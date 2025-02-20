// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./WalletManager.sol";
import "./GameIntegrator.sol";

/**
 * @title AIExecutor
 * @dev Main smart contract for AI-powered autonomous on-chain gaming agent
 */
contract AIExecutor {
    // State variables
    address public owner;
    WalletManager public walletManager;
    GameIntegrator public gameIntegrator;
    
    // Tracking variables
    uint256 public totalExecutions;
    uint256 public successfulExecutions;
    
    // Execution fee (in AVAX wei)
    uint256 public executionFee;
    bool public feeEnabled;
    
    // Mapping to track authorized AI agents
    mapping(address => bool) public authorizedAgents;
    
    // Events
    event TaskExecuted(address indexed user, string taskType, bool success);
    event AgentAuthorized(address indexed agent, bool status);
    event ExecutionFeeUpdated(uint256 newFee);
    event FundsWithdrawn(address indexed to, uint256 amount);
    
    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "AIExecutor: caller is not the owner");
        _;
    }
    
    modifier onlyAuthorized() {
        require(
            msg.sender == owner || authorizedAgents[msg.sender],
            "AIExecutor: caller is not authorized"
        );
        _;
    }
    
    modifier feePayment() {
        if (feeEnabled && msg.sender != owner) {
            require(msg.value >= executionFee, "AIExecutor: insufficient fee");
        }
        _;
    }
    
    /**
     * @dev Constructor to set up the contract with required dependencies
     * @param _walletManager Address of the wallet manager contract
     * @param _gameIntegrator Address of the game integrator contract
     */
    constructor(address _walletManager, address _gameIntegrator) {
        owner = msg.sender;
        walletManager = WalletManager(_walletManager);
        gameIntegrator = GameIntegrator(_gameIntegrator);
        executionFee = 0.005 ether; // Default fee (0.005 AVAX)
        feeEnabled = true;
    }
    
    /**
     * @dev Authorizes or revokes an AI agent's permission to execute tasks
     * @param agent The agent's address to authorize
     * @param status True to authorize, false to revoke
     */
    function setAgentAuthorization(address agent, bool status) external onlyOwner {
        authorizedAgents[agent] = status;
        emit AgentAuthorized(agent, status);
    }
    
    /**
     * @dev Sets the execution fee for task execution
     * @param newFee The new fee amount in AVAX wei
     */
    function setExecutionFee(uint256 newFee) external onlyOwner {
        executionFee = newFee;
        emit ExecutionFeeUpdated(newFee);
    }
    
    /**
     * @dev Enables or disables the execution fee requirement
     * @param enabled True to enable fees, false to disable
     */
    function setFeeEnabled(bool enabled) external onlyOwner {
        feeEnabled = enabled;
    }
    
    /**
     * @dev Executes a task in a game through the GameIntegrator contract
     * @param gameId The identifier of the target game (e.g., "defi_kingdoms")
     * @param taskType The type of task to execute (e.g., "quest", "crafting")
     * @param data The ABI-encoded data for the specific task
     * @return success Whether the execution was successful
     * @return response Any response data from the execution
     */
    function executeGameTask(
        string calldata gameId,
        string calldata taskType,
        bytes calldata data
    ) external payable onlyAuthorized feePayment returns (bool success, bytes memory response) {
        // Forward execution to the game integrator
        (success, response) = gameIntegrator.executeGameAction(gameId, taskType, data, msg.value);
        
        // Update execution statistics
        totalExecutions++;
        if (success) {
            successfulExecutions++;
        }
        
        emit TaskExecuted(msg.sender, taskType, success);
        return (success, response);
    }
    
    /**
     * @dev Executes a wallet operation through the WalletManager contract
     * @param operation The operation type (e.g., "transfer", "approve")
     * @param data The ABI-encoded data for the specific operation
     * @return success Whether the execution was successful
     * @return response Any response data from the execution
     */
    function executeWalletOperation(
        string calldata operation,
        bytes calldata data
    ) external payable onlyAuthorized feePayment returns (bool success, bytes memory response) {
        // Forward execution to the wallet manager
        (success, response) = walletManager.executeOperation(operation, data, msg.value);
        
        // Update execution statistics
        totalExecutions++;
        if (success) {
            successfulExecutions++;
        }
        
        emit TaskExecuted(msg.sender, operation, success);
        return (success, response);
    }
    
    /**
     * @dev Retrieves the execution success rate of the AI agent
     * @return The percentage of successful executions (0-100)
     */
    function getSuccessRate() external view returns (uint256) {
        if (totalExecutions == 0) {
            return 0;
        }
        return (successfulExecutions * 100) / totalExecutions;
    }
    
    /**
     * @dev Checks if the user is authorized for a certain game
     * @param user The user's address to check
     * @param gameId The game identifier to check authorization for
     * @return Whether the user is authorized for the game
     */
    function isAuthorizedForGame(address user, string calldata gameId) external view returns (bool) {
        return gameIntegrator.isUserAuthorized(user, gameId);
    }
    
    /**
     * @dev Withdraws contract funds to the owner
     * @param amount The amount to withdraw, or 0 for the entire balance
     */
    function withdrawFunds(uint256 amount) external onlyOwner {
        uint256 withdrawAmount = amount;
        if (withdrawAmount == 0) {
            withdrawAmount = address(this).balance;
        }
        
        require(withdrawAmount <= address(this).balance, "AIExecutor: insufficient balance");
        
        (bool success, ) = owner.call{value: withdrawAmount}("");
        require(success, "AIExecutor: transfer failed");
        
        emit FundsWithdrawn(owner, withdrawAmount);
    }
    
    /**
     * @dev Updates the wallet manager contract address
     * @param _walletManager The new wallet manager contract address
     */
    function setWalletManager(address _walletManager) external onlyOwner {
        walletManager = WalletManager(_walletManager);
    }
    
    /**
     * @dev Updates the game integrator contract address
     * @param _gameIntegrator The new game integrator contract address
     */
    function setGameIntegrator(address _gameIntegrator) external onlyOwner {
        gameIntegrator = GameIntegrator(_gameIntegrator);
    }
    
    /**
     * @dev Allows receiving AVAX
     */
    receive() external payable {}
}