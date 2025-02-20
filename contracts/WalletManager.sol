// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

/**
 * @title WalletManager
 * @dev Manages secure wallet operations for the AI gaming agent
 */
contract WalletManager {
    // State variables
    address public owner;
    address public aiExecutor;
    
    // User wallet authorization mappings
    mapping(address => mapping(address => bool)) public userWalletAuthorization;
    mapping(address => mapping(address => uint256)) public userWalletAllowance;
    
    // Security thresholds
    uint256 public maxTransactionAmount;
    uint256 public dailyTransactionLimit;
    mapping(address => uint256) public dailyTransactionAmounts;
    mapping(address => uint256) public lastTransactionDay;
    
    // Emergency controls
    bool public emergencyStop;
    
    // Events
    event WalletAuthorized(address indexed user, address indexed wallet, bool status);
    event AllowanceUpdated(address indexed user, address indexed wallet, uint256 amount);
    event OperationExecuted(address indexed user, string operation, bool success);
    event TokenApproved(address indexed token, address indexed spender, uint256 amount);
    event EmergencyStatusChanged(bool stopped);
    
    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "WalletManager: caller is not the owner");
        _;
    }
    
    modifier onlyAuthorized() {
        require(
            msg.sender == owner || msg.sender == aiExecutor,
            "WalletManager: caller is not authorized"
        );
        _;
    }
    
    modifier whenNotStopped() {
        require(!emergencyStop, "WalletManager: operations are stopped");
        _;
    }
    
    /**
     * @dev Constructor to set up the wallet manager
     * @param _maxTransactionAmount Maximum amount allowed per transaction (in AVAX wei)
     * @param _dailyTransactionLimit Maximum daily transaction limit (in AVAX wei)
     */
    constructor(uint256 _maxTransactionAmount, uint256 _dailyTransactionLimit) {
        owner = msg.sender;
        maxTransactionAmount = _maxTransactionAmount;
        dailyTransactionLimit = _dailyTransactionLimit;
        emergencyStop = false;
    }
    
    /**
     * @dev Sets the AIExecutor contract address
     * @param _aiExecutor The address of the AIExecutor contract
     */
    function setAIExecutor(address _aiExecutor) external onlyOwner {
        aiExecutor = _aiExecutor;
    }
    
    /**
     * @dev Authorizes a wallet for AI operations
     * @param wallet The wallet address to authorize
     * @param status True to authorize, false to revoke
     */
    function authorizeWallet(address wallet, bool status) external {
        userWalletAuthorization[msg.sender][wallet] = status;
        emit WalletAuthorized(msg.sender, wallet, status);
    }
    
    /**
     * @dev Sets a daily allowance for a wallet
     * @param wallet The wallet address to set allowance for
     * @param amount Maximum daily amount (in AVAX wei)
     */
    function setWalletAllowance(address wallet, uint256 amount) external {
        require(amount <= dailyTransactionLimit, "WalletManager: amount exceeds global limit");
        userWalletAllowance[msg.sender][wallet] = amount;
        emit AllowanceUpdated(msg.sender, wallet, amount);
    }
    
    /**
     * @dev Updates the transaction limits
     * @param _maxTransactionAmount New max transaction amount
     * @param _dailyTransactionLimit New daily transaction limit
     */
    function updateTransactionLimits(
        uint256 _maxTransactionAmount,
        uint256 _dailyTransactionLimit
    ) external onlyOwner {
        maxTransactionAmount = _maxTransactionAmount;
        dailyTransactionLimit = _dailyTransactionLimit;
    }
    
    /**
     * @dev Toggles emergency stop status
     * @param stopped True to stop operations, false to resume
     */
    function setEmergencyStop(bool stopped) external onlyOwner {
        emergencyStop = stopped;
        emit EmergencyStatusChanged(stopped);
    }
    
    /**
     * @dev Executes a wallet operation as requested by the AI executor
     * @param operation Operation type (e.g., "transfer", "approve")
     * @param data ABI-encoded operation data
     * @param valueAmount Value amount for the operation (if needed)
     * @return success Whether the operation was successful
     * @return result Any result data from the operation
     */
    function executeOperation(
        string calldata operation,
        bytes calldata data,
        uint256 valueAmount
    ) external payable onlyAuthorized whenNotStopped returns (bool success, bytes memory result) {
        // Decode operation parameters
        if (keccak256(bytes(operation)) == keccak256(bytes("transfer"))) {
            // Transfer AVAX to a recipient
            (address recipient, uint256 amount) = abi.decode(data, (address, uint256));
            success = _executeTransfer(recipient, amount);
            result = abi.encode(success);
        } else if (keccak256(bytes(operation)) == keccak256(bytes("transferToken"))) {
            // Transfer ERC20 tokens
            (address token, address recipient, uint256 amount) = 
                abi.decode(data, (address, address, uint256));
            success = _executeTokenTransfer(token, recipient, amount);
            result = abi.encode(success);
        } else if (keccak256(bytes(operation)) == keccak256(bytes("approve"))) {
            // Approve ERC20 token spending
            (address token, address spender, uint256 amount) = 
                abi.decode(data, (address, address, uint256));
            success = _approveToken(token, spender, amount);
            result = abi.encode(success);
        } else {
            revert("WalletManager: unknown operation");
        }
        
        emit OperationExecuted(msg.sender, operation, success);
        return (success, result);
    }
    
    /**
     * @dev Internal function to execute AVAX transfer
     * @param recipient Recipient address
     * @param amount Amount to transfer (in AVAX wei)
     * @return Whether the transfer was successful
     */
    function _executeTransfer(address recipient, uint256 amount) internal returns (bool) {
        require(amount <= maxTransactionAmount, "WalletManager: amount exceeds transaction limit");
        require(_checkAndUpdateDailyLimit(amount), "WalletManager: exceeds daily limit");
        
        (bool success, ) = recipient.call{value: amount}("");
        return success;
    }
    
    /**
     * @dev Internal function to execute ERC20 token transfer
     * @param token Token contract address
     * @param recipient Recipient address
     * @param amount Amount of tokens to transfer
     * @return Whether the transfer was successful
     */
    function _executeTokenTransfer(
        address token,
        address recipient,
        uint256 amount
    ) internal returns (bool) {
        // Create the function call for transfer(address,uint256)
        bytes memory data = abi.encodeWithSignature(
            "transfer(address,uint256)",
            recipient,
            amount
        );
        
        (bool success, bytes memory result) = token.call(data);
        if (success && result.length > 0) {
            return abi.decode(result, (bool));
        }
        return false;
    }
    
    /**
     * @dev Internal function to approve ERC20 token spending
     * @param token Token contract address
     * @param spender Address approved to spend tokens
     * @param amount Amount of tokens approved
     * @return Whether the approval was successful
     */
    function _approveToken(
        address token,
        address spender,
        uint256 amount
    ) internal returns (bool) {
        // Create the function call for approve(address,uint256)
        bytes memory data = abi.encodeWithSignature(
            "approve(address,uint256)",
            spender,
            amount
        );
        
        (bool success, bytes memory result) = token.call(data);
        if (success) {
            emit TokenApproved(token, spender, amount);
            if (result.length > 0) {
                return abi.decode(result, (bool));
            }
            return true;
        }
        return false;
    }
    
    /**
     * @dev Checks if a transaction is within daily limits and updates counters
     * @param amount Transaction amount to check
     * @return Whether the transaction is within limits
     */
    function _checkAndUpdateDailyLimit(uint256 amount) internal returns (bool) {
        uint256 today = block.timestamp / 1 days;
        
        // Reset counter if it's a new day
        if (lastTransactionDay[msg.sender] < today) {
            dailyTransactionAmounts[msg.sender] = 0;
            lastTransactionDay[msg.sender] = today;
        }
        
        // Check if adding this amount would exceed the daily limit
        uint256 newTotal = dailyTransactionAmounts[msg.sender] + amount;
        if (newTotal > dailyTransactionLimit) {
            return false;
        }
        
        // Update daily amount
        dailyTransactionAmounts[msg.sender] = newTotal;
        return true;
    }
    
    /**
     * @dev Get the remaining daily allowance for a user
     * @param user User address to check
     * @return Remaining allowance for today
     */
    function getRemainingDailyAllowance(address user) external view returns (uint256) {
        uint256 today = block.timestamp / 1 days;
        
        if (lastTransactionDay[user] < today) {
            return dailyTransactionLimit;
        }
        
        if (dailyTransactionAmounts[user] >= dailyTransactionLimit) {
            return 0;
        }
        
        return dailyTransactionLimit - dailyTransactionAmounts[user];
    }
    
    /**
     * @dev Allows receiving AVAX
     */
    receive() external payable {}
}