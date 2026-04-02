import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Clear session once to land on login page as requested
if (!localStorage.getItem('shiva_initial_reset')) {
  localStorage.clear();
  localStorage.setItem('shiva_initial_reset', 'true');
  window.location.reload();
}

// Clear session to start from login page if requested
if (window.location.search.includes('reset=true')) {
  localStorage.clear();
  window.location.href = window.location.origin;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
