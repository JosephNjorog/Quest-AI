import { ethers } from 'ethers';
  
export const getWeb3Provider = () => {
  if (typeof window !== 'undefined' && window.ethereum) {
    return new ethers.BrowserProvider(window.ethereum);
  }
  throw new Error('No Web3 Provider found');
};

export const formatAddress = (address: string): string => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const formatBalance = (balance: string, decimals = 18): string => {
  return parseFloat(ethers.formatUnits(balance, decimals)).toFixed(4);
};
