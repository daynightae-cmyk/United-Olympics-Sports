import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import './styles/player-portal.css';
import './styles/player-portal-chatgpt-black-gold.css';
import './styles/visual-system.css';
import './styles/theme-closure.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
