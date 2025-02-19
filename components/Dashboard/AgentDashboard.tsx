import React, { useState, useEffect } from 'react';
import { 
  ChartBarIcon, 
  CurrencyDollarIcon, 
  ClockIcon,
  UserCircleIcon 
} from '@heroicons/react/24/outline';

interface HeroStats {
  level: number;
  experience: number;
  stamina: number;
  questsCompleted: number;
}

interface GameMetrics {
  totalRewards: number;
  activeQuests: number;
  completedQuests: number;
  successRate: number;
}

const AgentDashboard: React.FC = () => {
  const [heroStats, setHeroStats] = useState<HeroStats>({
    level: 1,
    experience: 0,
    stamina: 100,
    questsCompleted: 0
  });

  const [metrics, setMetrics] = useState<GameMetrics>({
    totalRewards: 0,
    activeQuests: 0,
    completedQuests: 0,
    successRate: 0
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // TODO: Replace with actual API calls to fetch data
    const fetchDashboardData = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data
        setHeroStats({
          level: 5,
          experience: 1240,
          stamina: 85,
          questsCompleted: 12
        });

        setMetrics({
          totalRewards: 156.8,
          activeQuests: 2,
          completedQuests: 25,
          successRate: 92
        });
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
    // Set up periodic refresh
    const interval = setInterval(fetchDashboardData, 30000); // Refresh every 30s

    return () => clearInterval(interval);
  }, []);

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    icon: React.ReactNode;
    description?: string;
  }> = ({ title, value, icon, description }) => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className="p-2 bg-primary-100 rounded-lg">
          {icon}
        </div>
        <div className="ml-4">
          <h3 className="text-sm font-medium text-gray-500">{title}</h3>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
          {description && (
            <p className="text-sm text-gray-600">{description}</p>
          )}
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Agent Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Hero Level"
          value={heroStats.level}
          icon={<UserCircleIcon className="w-6 h-6 text-primary-600" />}
          description={`${heroStats.experience} XP to next level`}
        />
        
        <StatCard
          title="Active Quests"
          value={metrics.activeQuests}
          icon={<ClockIcon className="w-6 h-6 text-primary-600" />}
          description={`${metrics.completedQuests} completed`}
        />
        
        <StatCard
          title="Total Rewards"
          value={`${metrics.totalRewards} JEWEL`}
          icon={<CurrencyDollarIcon className="w-6 h-6 text-primary-600" />}
        />
        
        <StatCard
          title="Success Rate"
          value={`${metrics.successRate}%`}
          icon={<ChartBarIcon className="w-6 h-6 text-primary-600" />}
        />
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium mb-4">Hero Status</h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium">Stamina</span>
              <span className="text-sm text-gray-500">{heroStats.stamina}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-primary-600 h-2 rounded-full" 
                style={{ width: `${heroStats.stamina}%` }}
              />
            </div>
          </div>
          
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium">Experience</span>
              <span className="text-sm text-gray-500">
                {heroStats.experience}/2000 XP
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-primary-600 h-2 rounded-full" 
                style={{ width: `${(heroStats.experience / 2000) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentDashboard;