import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/theme.css';
import './styles/global.css';
import './styles/fonts';
import App from './App.tsx';
import { applySettings } from './settings/applySettings';
import { DEFAULT_SETTINGS } from './settings/types';

// Paint the default palette (midnight-cyan) onto <html> synchronously, before
// React mounts — otherwise the first frame shows theme.css's light tokens and
// the provider's effect only flips to the default a tick later (a FOUC flash).
applySettings(DEFAULT_SETTINGS);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
