import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import './styles/visual-system.css';
import './styles/theme-closure.css';
import './styles/enterprise.css';
import './styles/portal-experience.css';
import './styles/admin-directory-v2.css';
import './styles/uos-benchmark.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
