import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Loader from './components/common/Loader';

// Lazy load pages for better performance
const Dashboard = lazy(() => import('./pages/Dashboard'));
const HeroManagement = lazy(() => import('./pages/HeroManagement'));
const QuestLog = lazy(() => import('./pages/QuestLog'));
const Settings = lazy(() => import('./pages/Settings'));
const StrategyBuilder = lazy(() => import('./pages/StrategyBuilder'));

// Auth guard HOC
const PrivateRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('token');
  return isAuthenticated ? children : <Navigate to="/connect" replace />;
};

const AppRoutes = () => {
  return (
    <Suspense fallback={<Loader />}>
      <Routes>
        {/* Public routes */}
        <Route path="/connect" element={<WalletConnect />} />
        
        {/* Protected routes */}
        <Route path="/" element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        } />
        
        <Route path="/heroes" element={
          <PrivateRoute>
            <HeroManagement />
          </PrivateRoute>
        } />
        
        <Route path="/quests" element={
          <PrivateRoute>
            <QuestLog />
          </PrivateRoute>
        } />
        
        <Route path="/strategy" element={
          <PrivateRoute>
            <StrategyBuilder />
          </PrivateRoute>
        } />
        
        <Route path="/settings" element={
          <PrivateRoute>
            <Settings />
          </PrivateRoute>
        } />
        
        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;