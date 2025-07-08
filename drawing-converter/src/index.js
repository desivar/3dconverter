import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // You can keep a minimal index.css if needed, or move everything to App.css
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
