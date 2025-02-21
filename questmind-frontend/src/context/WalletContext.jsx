import React, { createContext, useContext, useState, useCallback } from 'react';

const WalletContext = createContext({});

export const WalletProvider = ({ children }) => {
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);

  const connect = useCallback(async (provider) => {
    setIsConnecting(true);
    setError(null);
    try {
      // Implement wallet connection logic here
      const connected = await new Promise(resolve => setTimeout(() => resolve({ address: '0x...', balance: '100' }), 1000));
      setAccount(connected.address);
      setBalance(connected.balance);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setAccount(null);
    setBalance(null);
  }, []);

  return (
    <WalletContext.Provider value={{
      account,
      balance,
      isConnecting,
      error,
      connect,
      disconnect
    }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => useContext(WalletContext);
