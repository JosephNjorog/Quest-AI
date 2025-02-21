import React, { useState } from 'react';
import Card from '../components/common/Card';
import Button from '../common/Button';
import Input from '../common/Input';
import { Settings as SettingsIcon, Save, Bell, Shield, Wallet, Bot } from 'lucide-react';

const Settings = () => {
  const [settings, setSettings] = useState({
    notifications: {
      questCompletion: true,
      marketAlerts: true,
      failureAlerts: true
    },
    security: {
      confirmHighValue: true,
      maxTransactionValue: "1000",
      autoLogout: "30"
    },
    agent: {
      riskTolerance: "medium",
      maxActiveQuests: "5",
      updateInterval: "5"
    }
  });

  const handleChange = (section, field, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Settings</h1>
        <Button>
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </Button>
      </div>

      <Card className="p-6">
        <div className="flex items-center space-x-2 mb-6">
          <Bell className="w-6 h-6 text-blue-500" />
          <h2 className="text-lg font-semibold">Notifications</h2>
        </div>
        
        <div className="space-y-4">
          {Object.entries(settings.notifications).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <span className="text-gray-700">
                {key.split(/(?=[A-Z])/).join(' ')}
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) => handleChange('notifications', key, e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center space-x-2 mb-6">
          <Shield className="w-6 h-6 text-green-500" />
          <h2 className="text-lg font-semibold">Security</h2>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-700">Confirm High-Value Transactions</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.security.confirmHighValue}
                onChange={(e) => handleChange('security', 'confirmHighValue', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          
          <Input
            label="Maximum Transaction Value (JEWEL)"
            type="number"
            value={settings.security.maxTransactionValue}
            onChange={(e) => handleChange('security', 'maxTransactionValue', e.target.value)}
          />
          
          <Input
            label="Auto Logout After (minutes)"
            type="number"
            value={settings.security.autoLogout}
            onChange={(e) => handleChange('security', 'autoLogout', e.target.value)}
          />
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center space-x-2 mb-6">
          <Bot className="w-6 h-6 text-purple-500" />
          <h2 className="text-lg font-semibold">AI Agent Settings</h2>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <span className="text-gray-700">Risk Tolerance</span>
            <select
              value={settings.agent.riskTolerance}
              onChange={(e) => handleChange('agent', 'riskTolerance', e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          
          <Input
            label="Maximum Active Quests"
            type="number"
            value={settings.agent.maxActiveQuests}
            onChange={(e) => handleChange('agent', 'maxActiveQuests', e.target.value)}
          />
          
          <Input
            label="Update Interval (minutes)"
            type="number"
            value={settings.agent.updateInterval}
            onChange={(e) => handleChange('agent', 'updateInterval', e.target.value)}
          />
        </div>
      </Card>
    </div>
  );
};

export default Settings;