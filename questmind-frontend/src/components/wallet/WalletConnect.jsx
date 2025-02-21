import React, { useState } from 'react';
import { Wallet, Shield, ExternalLink, AlertCircle } from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

const WalletConnect = () => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState('');

  const walletOptions = [
    {
      name: 'MetaMask',
      icon: '🦊',
      description: 'Connect to your MetaMask wallet'
    },
    {
      name: 'WalletConnect',
      icon: '🔗',
      description: 'Connect using WalletConnect'
    },
    {
      name: 'Core',
      icon: '🌐',
      description: 'Connect to Avalanche Core wallet'
    }
  ];

  const handleConnect = async (walletName) => {
    setIsConnecting(true);
    setError('');
    try {
      // TODO: Implement actual wallet connection
      await new Promise(resolve => setTimeout(resolve, 1500));
      // Simulate success
    } catch (err) {
      setError('Failed to connect wallet. Please try again.');
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="text-center mb-8">
        <Wallet className="w-12 h-12 mx-auto mb-4 text-blue-500" />
        <h2 className="text-2xl font-bold mb-2">Connect Your Wallet</h2>
        <p className="text-gray-600">Choose your preferred wallet to connect to the AI Agent</p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4">
        {walletOptions.map((wallet) => (
          <Card key={wallet.name} className="p-4 hover:shadow-md transition-shadow">
            <button
              onClick={() => handleConnect(wallet.name)}
              disabled={isConnecting}
              className="w-full text-left flex items-center justify-between p-2 rounded-lg hover:bg-gray-50"
            >
              <div className="flex items-center space-x-4">
                <span className="text-2xl">{wallet.icon}</span>
                <div>
                  <h3 className="font-semibold">{wallet.name}</h3>
                  <p className="text-sm text-gray-600">{wallet.description}</p>
                </div>
              </div>
              <ExternalLink className="w-5 h-5 text-gray-400" />
            </button>
          </Card>
        ))}
      </div>

      <div className="mt-8 flex items-center justify-center space-x-2 text-sm text-gray-600">
        <Shield className="w-4 h-4" />
        <span>Your keys are stored locally and never leave your browser</span>
      </div>
    </div>
  );
};

export default WalletConnect;