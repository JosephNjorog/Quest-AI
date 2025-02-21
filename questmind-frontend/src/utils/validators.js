export const validateAddress = (address) => {
    if (!address) return false;
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  };
  
  export const validateAmount = (amount, balance) => {
    if (!amount || !balance) return false;
    return parseFloat(amount) <= parseFloat(balance);
  };
  