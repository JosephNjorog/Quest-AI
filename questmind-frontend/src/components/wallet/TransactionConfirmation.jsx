import React from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import { Check, AlertTriangle, X } from 'lucide-react';

const TransactionConfirmation = ({ transaction, onConfirm, onCancel }) => {
  const {
    type,
    amount,
    currency,
    gas,
    description,
    riskLevel = 'low'
  } = transaction;

  const getRiskBadge = (level) => {
    const styles = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-red-100 text-red-800'
    };
    return styles[level] || styles.low;
  };

  return (
    <Card className="p-6 max-w-md mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold mb-2">Confirm Transaction</h2>
        <p className="text-gray-600">Please review the transaction details</p>
      </div>

      <div className="space-y-4 mb-6">
        <div className="flex justify-between py-2 border-b">
          <span className="text-gray-600">Type</span>
          <span className="font-medium">{type}</span>
        </div>
        
        <div className="flex justify-between py-2 border-b">
          <span className="text-gray-600">Amount</span>
          <span className="font-medium">{amount} {currency}</span>
        </div>

        <div className="flex justify-between py-2 border-b">
          <span className="text-gray-600">Gas Fee</span>
          <span className="font-medium">{gas} AVAX</span>
        </div>

        <div className="py-2">
          <span className="text-gray-600">Description</span>
          <p className="mt-1 text-sm">{description}</p>
        </div>

        <div className="flex items-center justify-between py-2 border-t">
          <span className="text-gray-600">Risk Level</span>
          <span className={`px-2 py-1 rounded-full text-sm ${getRiskBadge(riskLevel)}`}>
            {riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1)}
          </span>
        </div>
      </div>

      <div className="flex space-x-3">
        <Button
          variant="danger"
          className="flex-1"
          onClick={onCancel}
        >
          <X className="w-4 h-4 mr-2" />
          Cancel
        </Button>
        <Button
          variant="primary"
          className="flex-1"
          onClick={onConfirm}
        >
          <Check className="w-4 h-4 mr-2" />
          Confirm
        </Button>
      </div>
    </Card>
  );
};

export default TransactionConfirmation;