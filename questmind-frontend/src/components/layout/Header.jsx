import React from 'react';
import { useWallet } from '../../hooks/useWallet';
import { useGame } from '../../hooks/useGameData';
import { truncateAddress } from '../../utils/formatters';

function Header() {
  const { account, chainId, balance, disconnect } = useWallet();
  const { selectedGame } = useGame();

  const getNetworkName = () => {
    switch (chainId) {
      case '0xa86a': return 'Avalanche';
      case '0xa869': return 'Avalanche Fuji';
      default: return 'Unknown Network';
    }
  };

  const getGameBadgeClass = () => {
    switch (selectedGame) {
      case 'dfk': return 'bg-game-dfk/20 text-game-dfk';
      case 'heroes': return 'bg-game-heroes/20 text-game-heroes';
      default: return 'bg-gray-600/20 text-gray-400';
    }
  };

  return (
    <header className="bg-dark-900/80 backdrop-blur-sm sticky top-0 z-10 px-4 py-3 border-b border-dark-700">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-display font-bold">
            <span className="gradient-text">QuestMind</span>
          </h1>
          
          {selectedGame && (
            <span className={`px-2 py-1 rounded-md text-xs font-medium ${getGameBadgeClass()}`}>
              {selectedGame === 'dfk' ? 'DeFi Kingdoms' : 'Heroes of NFT'}
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2 sm:space-x-4">
          <div className="hidden md:flex items-center px-3 py-1.5 bg-dark-700 rounded-lg text-sm">
            <div className="h-2 w-2 rounded-full bg-green-400 mr-2"></div>
            <span className="text-gray-300">{getNetworkName()}</span>
          </div>
          
          <div className="flex items-center px-3 py-1.5 bg-dark-700 rounded-lg text-sm">
            <span className="text-gray-300 mr-1 hidden sm:inline">Balance:</span>
            <span className="font-medium text-white">{parseFloat(balance).toFixed(4)} AVAX</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <button 
              className="px-3 py-1.5 bg-dark-600 hover:bg-dark-500 rounded-lg transition-colors duration-200"
              onClick={() => {}}
            >
              <span className="text-sm font-medium">{truncateAddress(account)}</span>
            </button>
            
            <button 
              onClick={disconnect}
              className="p-1.5 text-gray-400 hover:text-gray-300 hover:bg-dark-600 rounded-lg transition-colors duration-200"
              title="Disconnect Wallet"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V7.414l-5-5H3zm7 2a1 1 0 00-1 1v1H5a1 1 0 100 2h4v1a1 1 0 102 0V9h4a1 1 0 100-2h-4V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;