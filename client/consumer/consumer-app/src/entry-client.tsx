import React from 'react';
import ReactDOM from 'react-dom/client';
// import { BrowserRouter } from 'react-router-dom'; // Or appropriate router
import App from './App';
import './index.css'; // Ensure global styles are imported

// Hydrate the server-rendered HTML
ReactDOM.hydrateRoot(
  document.getElementById('root') as HTMLElement, // Ensure your index.html has <div id="root"></div>
  <React.StrictMode>
     {/* If using React Router, wrap App with BrowserRouter:
    <BrowserRouter>
      <App />
    </BrowserRouter>
     */}
     {/* For now, just render App directly */}
    <App />
  </React.StrictMode>
);
