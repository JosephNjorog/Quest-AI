// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

/**
 * @title GameIntegrator
 * @dev Handles interactions with various games on Avalanche
 */
contract GameIntegrator {
    // State variables
    address public owner;
    address public aiExecutor;
    
    // Game integration data
    struct GameInfo {
        bool isActive;
        address gameContract;
        mapping(string => bytes4) actionSelectors;
        mapping(address => bool) authorizedUsers;
    }
    
    // Maps game ID to its configuration
    mapping(string => GameInfo) public games;
    string[] public supportedGames;
    
    // Event logs
    event GameAdded(string gameId, address gameContract);
    event GameActionExecuted(string indexed gameId, string actionType, bool success);
    event UserAuthorization(string indexed gameId, address indexed user, bool status);
    event ActionSelectorAdded(string indexed gameId, string actionType, bytes4 selector);
    
    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "GameIntegrator: caller is not the owner");
        _;
    }
    
    modifier onlyAuthorized() {
        require(
            msg.sender == owner || msg.sender == aiExecutor,
            "GameIntegrator: caller is not authorized"
        );
        _;
    }
    
    modifier gameExists(string calldata gameId) {
        require(games[gameId].isActive, "GameIntegrator: game not supported");
        _;
    }
    
    /**
     * @dev Constructor to initialize the GameIntegrator contract
     */
    constructor() {
        owner = msg.sender;
    }
    
    /**
     * @dev Sets the AIExecutor contract address
     * @param _aiExecutor The address of the AIExecutor contract
     */
    function setAIExecutor(address _aiExecutor) external onlyOwner {
        aiExecutor = _aiExecutor;
    }
    
    /**
     * @dev Adds a new game to the integrator
     * @param gameId Identifier for the game (e.g., "defi_kingdoms")
     * @param gameContract Address of the game's main contract
     */
    function addGame(string calldata gameId, address gameContract) external onlyOwner {
        require(!games[gameId].isActive, "GameIntegrator: game already exists");
        
        games[gameId].isActive = true;
        games[gameId].gameContract = gameContract;
        supportedGames.push(gameId);
        
        emit GameAdded(gameId, gameContract);
    }
    
    /**
     * @dev Adds function selector for a game action
     * @param gameId Game identifier
     * @param actionType Type of action (e.g., "startQuest", "claimRewards")
     * @param selector Function selector (bytes4) for the action
     */
    function addActionSelector(
        string calldata gameId,
        string calldata actionType,
        bytes4 selector
    ) external onlyOwner gameExists(gameId) {
        games[gameId].actionSelectors[actionType] = selector;
        emit ActionSelectorAdded(gameId, actionType, selector);
    }
    
    /**
     * @dev Authorizes a user for a specific game
     * @param gameId Game identifier
     * @param user User address to authorize
     * @param status True to authorize, false to revoke
     */
    function authorizeUserForGame(
        string calldata gameId,
        address user,
        bool status
    ) external gameExists(gameId) {
        require(
            msg.sender == owner || msg.sender == user,
            "GameIntegrator: not authorized to change status"
        );
        games[gameId].authorizedUsers[user] = status;
        emit UserAuthorization(gameId, user, status);
    }
    
    /**
     * @dev Checks if a user is authorized for a specific game
     * @param user User address to check
     * @param gameId Game identifier
     * @return Whether the user is authorized
     */
    function isUserAuthorized(address user, string calldata gameId) external view gameExists(gameId) returns (bool) {
        return games[gameId].authorizedUsers[user];
    }
    
    /**
     * @dev Executes a game action
     * @param gameId Game identifier
     * @param actionType Type of action to execute
     * @param actionData ABI-encoded action parameters
     * @param valueAmount AVAX value to send with the transaction
     * @return success Whether the action execution was successful
     * @return result Any result data from the action
     */
    function executeGameAction(
        string calldata gameId,
        string calldata actionType,
        bytes calldata actionData,
        uint256 valueAmount
    ) external payable onlyAuthorized gameExists(gameId) returns (bool success, bytes memory result) {
        // Get the function selector for this action
        bytes4 selector = games[gameId].actionSelectors[actionType];
        require(selector != bytes4(0), "GameIntegrator: action type not configured");
        
        // Prepare the call data (selector + action data)
        bytes memory data = abi.encodePacked(selector, actionData);
        
        // Execute the call to the game contract
        address gameContract = games[gameId].gameContract;
        (success, result) = gameContract.call{value: valueAmount}(data);
        
        emit GameActionExecuted(gameId, actionType, success);
        return (success, result);
    }
    
/**
     * @dev Gets all the supported games
     * @return Array of game IDs
     */
    function getSupportedGames() external view returns (string[] memory) {
        return supportedGames;
    }
    
    /**
     * @dev Gets game contract address for a game ID
     * @param gameId Game identifier
     * @return Game contract address
     */
    function getGameContract(string calldata gameId) external view gameExists(gameId) returns (address) {
        return games[gameId].gameContract;
    }
    
    /**
     * @dev Gets function selector for a specific game action
     * @param gameId Game identifier
     * @param actionType Type of action
     * @return bytes4 selector
     */
    function getActionSelector(string calldata gameId, string calldata actionType) 
        external 
        view 
        gameExists(gameId) 
        returns (bytes4) {
        return games[gameId].actionSelectors[actionType];
    }
    
    /**
     * @dev Emergency function to withdraw stuck funds
     * @param token Address of token to withdraw (zero address for native AVAX)
     */
    function emergencyWithdraw(address token) external onlyOwner {
        if (token == address(0)) {
            // Withdraw native AVAX
            (bool success, ) = owner.call{value: address(this).balance}("");
            require(success, "GameIntegrator: AVAX withdrawal failed");
        } else {
            // Withdraw ERC20 tokens
            (bool success, bytes memory data) = token.call(
                abi.encodeWithSignature(
                    "transfer(address,uint256)",
                    owner,
                    IERC20(token).balanceOf(address(this))
                )
            );
            require(success && (data.length == 0 || abi.decode(data, (bool))), 
                "GameIntegrator: Token withdrawal failed");
        }
    }
    
    /**
     * @dev Function to update game contract address
     * @param gameId Game identifier
     * @param newGameContract New address for the game contract
     */
    function updateGameContract(string calldata gameId, address newGameContract) 
        external 
        onlyOwner 
        gameExists(gameId) {
        games[gameId].gameContract = newGameContract;
    }
    
    /**
     * @dev Transfer ownership of the contract
     * @param newOwner Address of the new owner
     */
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "GameIntegrator: new owner is the zero address");
        owner = newOwner;
    }
    
    // Allow contract to receive AVAX
    receive() external payable {}
}

/**
 * @dev Minimal interface for ERC20 token operations
 */
interface IERC20 {
    function balanceOf(address account) external view returns (uint256);
    function transfer(address recipient, uint256 amount) external returns (bool);
}