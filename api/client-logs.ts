type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface ClientLogEntry {
  level?: LogLevel;
  message?: string;
  timestamp?: string;
  context?: Record<string, unknown>;
  url?: string;
  userAgent?: string;
  sessionId?: string;
}

interface VercelRequest {
  method?: string;
  body?: {
    logs?: ClientLogEntry[];
  } | ClientLogEntry[] | ClientLogEntry;
}

interface VercelResponse {
  setHeader: (name: string, value: string) => void;
  status: (code: number) => VercelResponse;
  json: (body: unknown) => void;
  end: () => void;
}

const MAX_BATCH = 50;

function writeLog(entry: ClientLogEntry) {
  const level = entry.level ?? 'info';
  const payload = {
    source: 'client',
    level,
    message: entry.message ?? '',
    timestamp: entry.timestamp ?? new Date().toISOString(),
    url: entry.url,
    sessionId: entry.sessionId,
    userAgent: entry.userAgent,
    context: entry.context ?? {},
  };

  const line = JSON.stringify(payload);

  switch (level) {
    case 'error':
      console.error(line);
      break;
    case 'warn':
      console.warn(line);
      break;
    case 'debug':
      console.debug(line);
      break;
    default:
      console.log(line);
  }
}

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = req.body;
  const entries: ClientLogEntry[] = Array.isArray((body as { logs?: ClientLogEntry[] })?.logs)
    ? ((body as { logs: ClientLogEntry[] }).logs).slice(0, MAX_BATCH)
    : Array.isArray(body)
      ? body.slice(0, MAX_BATCH)
      : body
        ? [body as ClientLogEntry]
        : [];

  if (entries.length === 0) {
    return res.status(400).json({ error: 'No logs provided' });
  }

  for (const entry of entries) {
    writeLog(entry);
  }

  return res.status(204).end();
}
