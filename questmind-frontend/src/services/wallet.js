import { ethers } from 'ethers';

export const walletService = {
  async connect() {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed');
    }

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    
    return { provider, signer };
  },

  async getBalance(address) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const balance = await provider.getBalance(address);
    return ethers.utils.formatEther(balance);
  },

  async signMessage(message, signer) {
    return await signer.signMessage(message);
  }
};
