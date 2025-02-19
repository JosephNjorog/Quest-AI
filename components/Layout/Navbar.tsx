import React from 'react';
import Link from 'next/link';
import { useState } from 'react';

const Navbar: React.FC = () => {
  const [isWalletConnected, setIsWalletConnected] = useState(false);

  const handleConnectWallet = async () => {
    // Simulate wallet connection logic
    try {
      // Replace this with actual wallet connection code (e.g., MetaMask)
      console.log('Connecting wallet...');
      setIsWalletConnected(true);
    } catch (error) {
      console.error('Error connecting wallet:', error);
    }
  };

  return (
    <nav className="bg-primary-600 text-white py-2 px-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo/Title */}
        <Link href="/" className="text-lg font-bold">QuestMind</Link>

        {/* Navigation Links */}
        <ul className="flex space-x-4">
          <li>
            <Link href="/dashboard" className="hover:text-gray-300">
              Dashboard
            </Link>
          </li>
          <li>
            <Link href="/quests" className="hover:text-gray-300">
              Quests
            </Link>
          </li>
          <li>
            <Link href="/wallet" className="hover:text-gray-300">
              Wallet
            </Link>
          </li>
        </ul>

        {/* Wallet Connection Button */}
        <button
          onClick={handleConnectWallet}
          className={`px-4 py-2 rounded-md ${
            isWalletConnected ? 'bg-green-500' : 'bg-blue-500'
          } hover:bg-opacity-80 transition-colors`}
        >
          {isWalletConnected ? 'Wallet Connected' : 'Connect Wallet'}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;