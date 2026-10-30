import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { setupHttpInterceptor } from './lib/httpInterceptor';
import './index.css';

setupHttpInterceptor();

if (import.meta.env.DEV) {
  void import('./lib/mockSeed');
}
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
