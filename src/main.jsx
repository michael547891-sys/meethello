import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './App.css';

const path = window.location.pathname.replace(/\/+$/, '') || '/';
const joinPath = '/wdd-fsvi-dmx';
if (path !== joinPath) {
  const target = `${joinPath}${window.location.search}${window.location.hash}`;
  window.location.replace(target);
}

document.title = 'Meet';

createRoot(document.getElementById('root')).render(<App />);
