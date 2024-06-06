import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter } from 'react-router-dom';
import { StompClientProvider } from './StompClientContext';
import { GameProvider } from './GameProvider';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
<React.StrictMode>
  <StompClientProvider url={`${process.env.REACT_APP_API_URL}/gs-guide-websocket`} token="token">
    <BrowserRouter>
      <GameProvider>
        <App />
      </GameProvider>
    </BrowserRouter>
  </StompClientProvider>
</React.StrictMode>
);
reportWebVitals();
