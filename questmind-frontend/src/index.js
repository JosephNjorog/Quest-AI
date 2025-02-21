import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './styles/index.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Context Providers
import { WalletProvider } from './context/WalletContext';
import { AgentProvider } from './context/AgentContext';
import { GameProvider } from './context/GameContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <WalletProvider>
        <GameProvider>
          <AgentProvider>
            <App />
            <ToastContainer position="top-right" autoClose={5000} theme="dark" />
          </AgentProvider>
        </GameProvider>
      </WalletProvider>
    </BrowserRouter>
  </React.StrictMode>
);