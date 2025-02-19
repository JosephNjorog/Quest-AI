import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

interface WalletConnectorProps {
  onConnect: (address: string) => void;
}

const WalletConnector: React.FC<WalletConnectorProps> = ({ onConnect }) => {
  const [address, setAddress] = useState<string>('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string>('');

  const connectWallet = async () => {
    if (!window.ethereum) {
      setError('Please install MetaMask or another Web3 wallet');
      return;
    }

    try {
      setIsConnecting(true);
      setError('');

      // Request account access
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      
      // Get the provider
      const provider = new ethers.BrowserProvider(window.ethereum);
      
      // Check if we're on the correct network (Avalanche)
      const network = await provider.getNetwork();
      const chainId = network.chainId;
      
      // Avalanche C-Chain ID is 43114
      if (chainId !== 43114n) {
        await switchToAvalanche();
      }

      const userAddress = accounts[0];
      setAddress(userAddress);
      onConnect(userAddress);
    } catch (err) {
      setError('Failed to connect wallet: ' + (err as Error).message);
    } finally {
      setIsConnecting(false);
    }
  };

  const switchToAvalanche = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0xA86A' }], // 43114 in hex
      });
    } catch (err: any) {
      // This error code indicates that the chain has not been added to MetaMask
      if (err.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: '0xA86A',
            chainName: 'Avalanche C-Chain',
            nativeCurrency: {
              name: 'AVAX',
              symbol: 'AVAX',
              decimals: 18
            },
            rpcUrls: ['https://api.avax.network/ext/bc/C/rpc'],
            blockExplorerUrls: ['https://snowtrace.io/']
          }]
        });
      }
    }
  };

  return (
    <div className="p-4">
      {!address ? (
        <button
          onClick={connectWallet}
          disabled={isConnecting}
          className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200 ease-in-out disabled:opacity-50"
        >
          {isConnecting ? 'Connecting...' : 'Connect Wallet'}
        </button>
      ) : (
        <div className="flex items-center space-x-2">
          <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
            Connected: {address.slice(0, 6)}...{address.slice(-4)}
          </div>
          <button
            onClick={() => setAddress('')}
            className="text-gray-500 hover:text-gray-700"
          >
            Disconnect
          </button>
        </div>
      )}
      
      {error && (
        <div className="mt-2 text-red-600 text-sm">
          {error}
        </div>
      )}
    </div>
  );
};

export default WalletConnector;