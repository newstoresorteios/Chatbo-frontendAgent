import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { logger } from './utils/logger';
import './styles/index.css';

logger.installGlobalHandlers();

const PRELOAD_RELOAD_KEY = 'chatbo:preload-reload-at';
const PRELOAD_RELOAD_COOLDOWN_MS = 30_000;

// A Vite deploy replaces hashed lazy chunks. An already-open tab can still
// reference the previous hashes; reload once so it receives the new index.
window.addEventListener('vite:preloadError', (event) => {
  const lastReloadAt = Number(sessionStorage.getItem(PRELOAD_RELOAD_KEY) || 0);
  if (Date.now() - lastReloadAt < PRELOAD_RELOAD_COOLDOWN_MS) return;

  event.preventDefault();
  sessionStorage.setItem(PRELOAD_RELOAD_KEY, String(Date.now()));
  window.location.reload();
});

window.setTimeout(() => {
  sessionStorage.removeItem(PRELOAD_RELOAD_KEY);
}, PRELOAD_RELOAD_COOLDOWN_MS);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
