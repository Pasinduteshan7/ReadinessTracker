import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Import dev-only mock seeder so the in-memory backend is preloaded during development.
if (import.meta.env.DEV) {
  // dynamic import to avoid executing in production bundling
  void import('./lib/mockSeed');
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
