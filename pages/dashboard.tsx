import { useState } from 'react';
import MainLayout from '../components/Layout/MainLayout';
import WalletConnector from '../components/Web3/WalletConnector';
import InstructionInterface from '../components/AI/InstructionInterface';
import AgentDashboard from '../components/Dashboard/AgentDashboard';

const DashboardPage: React.FC = () => {
  const [isWalletConnected, setIsWalletConnected] = useState(false);

  const handleWalletConnect = (address: string) => {
    setIsWalletConnected(true);
  };

  return (
    <MainLayout title="Dashboard - QuestMind">
      <div className="space-y-6">
        {!isWalletConnected ? (
          <div className="flex items-center justify-center min-h-[60vh]">
            <WalletConnector onConnect={handleWalletConnect} />
          </div>
        ) : (
          <>
            <AgentDashboard />
            <InstructionInterface />
          </>
        )}
      </div>
    </MainLayout>
  );
};

export default DashboardPage;