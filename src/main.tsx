import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import './styles/visual-system.css';
import './styles/theme-closure.css';
import './styles/uos-design-system.css';
import './styles/uos-fields.css';
import './styles/uos-assistant.css';
import './styles/uos-update.css';
import './styles/sports-3d-system.css';
import './styles/auth-closure.css';
import './styles/enterprise.css';
import './styles/portal-experience.css';
import './styles/portal-closure.css';
import './styles/admin-directory-v2.css';
import './styles/uos-benchmark.css';
import './styles/player-portal.css';
import './styles/portal-unification.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
