export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogContext {
  [key: string]: unknown;
}

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: LogContext;
  url?: string;
  userAgent?: string;
  sessionId?: string;
}

const SENSITIVE_KEYS = /^(authorization|cookie|password|token|refreshToken|secret|api[_-]?key|access[_-]?token)$/i;
const ENDPOINT = '/api/client-logs';
const FLUSH_INTERVAL_MS = 2_000;
const MAX_QUEUE = 100;
const SESSION_KEY = 'pulsedesk_log_session';

function getSessionId(): string {
  try {
    const existing = sessionStorage.getItem(SESSION_KEY);
    if (existing) return existing;
    const id = `s_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
    sessionStorage.setItem(SESSION_KEY, id);
    return id;
  } catch {
    return 'anonymous';
  }
}

function redactValue(key: string, value: unknown): unknown {
  if (SENSITIVE_KEYS.test(key)) return '[REDACTED]';
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return redactObject(value as Record<string, unknown>);
  }
  if (Array.isArray(value)) {
    return value.map((item, index) =>
      item && typeof item === 'object'
        ? redactObject(item as Record<string, unknown>)
        : redactValue(String(index), item),
    );
  }
  return value;
}

function redactObject(input: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(input)) {
    out[key] = redactValue(key, value);
  }
  return out;
}

function shouldShipToVercel(): boolean {
  return import.meta.env.PROD;
}

class Logger {
  private queue: LogEntry[] = [];
  private timer: ReturnType<typeof setTimeout> | null = null;
  private flushing = false;
  private installed = false;

  installGlobalHandlers() {
    if (this.installed || typeof window === 'undefined') return;
    this.installed = true;

    window.addEventListener('error', (event) => {
      this.error('Unhandled error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error instanceof Error ? event.error.stack : undefined,
      });
    });

    window.addEventListener('unhandledrejection', (event) => {
      const reason = event.reason;
      this.error('Unhandled promise rejection', {
        reason:
          reason instanceof Error
            ? { message: reason.message, stack: reason.stack, name: reason.name }
            : reason,
      });
    });

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        void this.flush(true);
      }
    });

    window.addEventListener('pagehide', () => {
      void this.flush(true);
    });

    this.info('App started', {
      href: window.location.href,
      env: import.meta.env.MODE,
    });
  }

  debug(message: string, context?: LogContext) {
    this.write('debug', message, context);
  }

  info(message: string, context?: LogContext) {
    this.write('info', message, context);
  }

  warn(message: string, context?: LogContext) {
    this.write('warn', message, context);
  }

  error(message: string, context?: LogContext) {
    this.write('error', message, context);
  }

  private write(level: LogLevel, message: string, context?: LogContext) {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context: context ? redactObject(context) : undefined,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      sessionId: getSessionId(),
    };

    const consoleFn =
      level === 'error'
        ? console.error
        : level === 'warn'
          ? console.warn
          : level === 'debug'
            ? console.debug
            : console.log;

    consoleFn(`[${level}] ${message}`, entry.context ?? '');

    if (!shouldShipToVercel()) return;

    this.queue.push(entry);
    if (this.queue.length > MAX_QUEUE) {
      this.queue = this.queue.slice(-MAX_QUEUE);
    }

    if (level === 'error') {
      void this.flush();
      return;
    }

    this.scheduleFlush();
  }

  private scheduleFlush() {
    if (this.timer) return;
    this.timer = setTimeout(() => {
      this.timer = null;
      void this.flush();
    }, FLUSH_INTERVAL_MS);
  }

  async flush(useBeacon = false) {
    if (this.flushing || this.queue.length === 0 || !shouldShipToVercel()) return;

    const batch = this.queue.splice(0, MAX_QUEUE);
    this.flushing = true;

    try {
      const body = JSON.stringify({ logs: batch });

      if (useBeacon && typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
        const blob = new Blob([body], { type: 'application/json' });
        navigator.sendBeacon(ENDPOINT, blob);
        return;
      }

      await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
        keepalive: true,
      });
    } catch {
      this.queue.unshift(...batch);
      if (this.queue.length > MAX_QUEUE) {
        this.queue = this.queue.slice(0, MAX_QUEUE);
      }
    } finally {
      this.flushing = false;
    }
  }
}

export const logger = new Logger();
