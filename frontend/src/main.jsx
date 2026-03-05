/**
 * main.jsx - Точка входу React додатку
 *
 * Монтує кореневий компонент App у DOM елемент #root
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import PlayerView from './components/PlayerView.jsx';
import './styles/theme.css';

// Монтуємо додаток у кореневий div
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <PlayerView />
  </React.StrictMode>
);
