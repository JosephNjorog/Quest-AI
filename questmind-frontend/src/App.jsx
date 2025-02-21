import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useWallet } from './hooks/useWallet';

// Layout
import Layout from './components/layout/Layout';

// Pages
import Dashboard from './pages/Dashboard';
import HeroManagement from './pages/HeroManagement';
import QuestLog from './pages/QuestLog';
import Settings from './pages/Settings';
import StrategyBuilder from './pages/StrategyBuilder';

// Components
import WalletConnect from './components/wallet/WalletConnect';

function App() {
  const { isConnected } = useWallet();

  // Protected route wrapper
  const ProtectedRoute = ({ children }) => {
    if (!isConnected) {
      return <Navigate to="/" replace />;
    }
    return children;
  };

  return (
    <div className="min-h-screen bg-dark-800 text-white">
      {!isConnected ? (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-dark-900 to-dark-700 p-4">
          <WalletConnect />
        </div>
      ) : (
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route 
              path="/heroes" 
              element={
                <ProtectedRoute>
                  <HeroManagement />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/quests" 
              element={
                <ProtectedRoute>
                  <QuestLog />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/strategy" 
              element={
                <ProtectedRoute>
                  <StrategyBuilder />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/settings" 
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              } 
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      )}
    </div>
  );
}

export default App;