// main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import Popup from './popup';
import './main.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Popup />
  </React.StrictMode>
);