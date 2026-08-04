const MAX_BATCH = 50;

function writeLog(entry) {
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

module.exports = function handler(req, res) {
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
  let entries = [];

  if (Array.isArray(body?.logs)) {
    entries = body.logs.slice(0, MAX_BATCH);
  } else if (Array.isArray(body)) {
    entries = body.slice(0, MAX_BATCH);
  } else if (body) {
    entries = [body];
  }

  if (entries.length === 0) {
    return res.status(400).json({ error: 'No logs provided' });
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

  return res.status(204).end();
};
