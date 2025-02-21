export const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };
  
  export const formatBalance = (balance, decimals = 4) => {
    if (!balance) return '0';
    return parseFloat(balance).toFixed(decimals);
  };
  
  export const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };
  export const truncateAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };