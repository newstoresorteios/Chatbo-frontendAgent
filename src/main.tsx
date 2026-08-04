import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { logger } from './utils/logger';
import './styles/index.css';

logger.installGlobalHandlers();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
