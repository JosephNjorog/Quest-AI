import React from 'react';
import { useWallet } from '../../context/WalletContext';
import { Card } from '../common/Card';
import { formatAddress, formatBalance } from '../../utils/formatters';

const WalletDetails = () => {
  const { account, balance, disconnect } = useWallet();

  if (!account) return null;

  return (
    <Card className="p-6 bg-white shadow-lg rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Wallet Details</h2>
        <button
          onClick={disconnect}
          className="text-sm text-red-600 hover:text-red-800"
        >
          Disconnect
        </button>
      </div>
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Address</span>
          <span className="font-mono text-sm">{formatAddress(account)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Balance</span>
          <span className="font-semibold">{formatBalance(balance)} AVAX</span>
        </div>
      </div>
    </Card>
  );
};

export default WalletDetails;