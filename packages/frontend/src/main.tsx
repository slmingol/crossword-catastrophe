import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

// Read version from package.json (injected via Vite)
const version = __APP_VERSION__;
console.log('%c' + '='.repeat(60), 'color: #0066cc');
console.log('%c  🧩 CROSSWORD CATASTROPHE', 'color: #0066cc; font-weight: bold; font-size: 14px');
console.log('%c  Version: ' + version, 'color: #0066cc; font-weight: bold');
console.log('%c' + '='.repeat(60), 'color: #0066cc');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
