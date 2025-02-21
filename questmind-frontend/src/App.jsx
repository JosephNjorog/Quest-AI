import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { WalletProvider } from './context/WalletContext';
import { AgentProvider } from './context/AgentContext';
import { GameProvider } from './context/GameContext';
import Layout from './components/layout/Layout';
import AppRoutes from './routes';

const App = () => {
  return (
    <Router>
      <div className="min-h-screen bg-dark-800 text-gray-100">
        <WalletProvider>
          <AgentProvider>
            <GameProvider>
              <Layout>
                <AppRoutes />
              </Layout>
            </GameProvider>
          </AgentProvider>
        </WalletProvider>
      </div>
    </Router>
  );
};

export default App;