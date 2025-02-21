import React from 'react';
import DashboardOverview from '../components/dashboard/DashboardOverview';
import ActiveQuests from '../components/dashboard/ActiveQuests';
import ResourcesDisplay from '../components/dashboard/ResourcesDisplay';
import PerformanceStats from '../components/dashboard/PerformanceStats';
import RecentTransactions from '../components/dashboard/RecentTransactions';

const Dashboard = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardOverview />
        <ActiveQuests />
        <ResourcesDisplay />
        <PerformanceStats />
        <div className="lg:col-span-2">
          <RecentTransactions />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;