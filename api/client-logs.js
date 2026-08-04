const MAX_BATCH = 50;

function writeLog(entry) {
  const level = entry?.level || 'info';
  const payload = {
    source: 'client',
    level,
    message: entry?.message || '',
    timestamp: entry?.timestamp || new Date().toISOString(),
    url: entry?.url,
    sessionId: entry?.sessionId,
    userAgent: entry?.userAgent,
    context: entry?.context || {},
  };

  const line = JSON.stringify(payload);

  if (level === 'error') {
    console.error(line);
    return;
  }
  if (level === 'warn') {
    console.warn(line);
    return;
  }
  console.log(line);
}

function parseEntries(body) {
  if (!body) return [];
  if (Array.isArray(body.logs)) return body.logs.slice(0, MAX_BATCH);
  if (Array.isArray(body)) return body.slice(0, MAX_BATCH);
  return [body];
}

export default function handler(req, res) {
  try {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.statusCode = 204;
      res.end();
      return;
    }

    if (req.method !== 'POST') {
      res.statusCode = 405;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Method not allowed' }));
      return;
    }

    const entries = parseEntries(req.body);

    if (entries.length === 0) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'No logs provided' }));
      return;
    }

    console.log(
      JSON.stringify({
        source: 'client',
        level: 'info',
        message: `Received ${entries.length} client log(s)`,
        timestamp: new Date().toISOString(),
      }),
    );

    for (const entry of entries) {
      writeLog(entry);
    }

    res.statusCode = 204;
    res.end();
  } catch (error) {
    console.error(
      JSON.stringify({
        source: 'client',
        level: 'error',
        message: 'client-logs handler failed',
        error: error instanceof Error ? error.message : String(error),
      }),
    );
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Internal error' }));
  }
}
