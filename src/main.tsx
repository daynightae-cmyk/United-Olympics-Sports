import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import './styles/visual-system.css';
import './styles/theme-closure.css';
import './styles/auth-closure.css';
import './styles/sports-3d-system.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
