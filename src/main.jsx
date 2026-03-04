import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
// Import Bootstrap CSS for grid system and components
import 'bootstrap/dist/css/bootstrap.min.css';
// Import Bootstrap Icons for UI elements (User, Search, etc.)
import 'bootstrap-icons/font/bootstrap-icons.css';
// Import Custom SJU Styling
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);