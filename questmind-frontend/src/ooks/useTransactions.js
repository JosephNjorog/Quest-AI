import { useState, useCallback } from 'react';
import { ethers } from 'ethers';

export const useTransactions = (signer) => {
  const [pending, setPending] = useState([]);
  const [history, setHistory] = useState([]);

  const sendTransaction = useCallback(async (to, amount, data = '0x') => {
    const tx = {
      to,
      value: ethers.utils.parseEther(amount.toString()),
      data
    };

    const transaction = await signer.sendTransaction(tx);
    setPending(prev => [...prev, transaction]);
    
    const receipt = await transaction.wait();
    setPending(prev => prev.filter(tx => tx.hash !== transaction.hash));
    setHistory(prev => [...prev, receipt]);
    
    return receipt;
  }, [signer]);

  return {
    pending,
    history,
    sendTransaction
  };
};