export const AVALANCHE_MAINNET = {
    id: 43114,
    name: 'Avalanche C-Chain',
    network: 'avalanche',
    nativeCurrency: {
      decimals: 18,
      name: 'Avalanche',
      symbol: 'AVAX',
    },
    rpcUrls: {
      default: 'https://api.avax.network/ext/bc/C/rpc',
    },
    blockExplorers: {
      default: { name: 'SnowTrace', url: 'https://snowtrace.io' },
    },
    testnet: false,
  };
  
  export const AVALANCHE_TESTNET = {
    id: 43113,
    name: 'Avalanche Fuji Testnet',
    network: 'avalanche-fuji',
    nativeCurrency: {
      decimals: 18,
      name: 'Avalanche',
      symbol: 'AVAX',
    },
    rpcUrls: {
      default: 'https://api.avax-test.network/ext/bc/C/rpc',
    },
    blockExplorers: {
      default: { name: 'SnowTrace', url: 'https://testnet.snowtrace.io' },
    },
    testnet: true,
  };
  
  // utils/web3.ts
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
  
  // utils/api.ts
  import axios from 'axios';
  
  const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  api.interceptors.request.use((config) => {
    // Add auth token if available
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });
  
  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (error.response?.status === 401) {
        // Handle unauthorized access
        localStorage.removeItem('auth_token');
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );
  
  export default api;