// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

/**
 * @title GameRegistry
 * @dev Registry for game-specific information and metadata
 */
contract GameRegistry {
    // State variables
    address public owner;
    
    // Game metadata
    struct GameMetadata {
        string gameName;
        string gameVersion;
        address gameContract;
        string apiEndpoint;
        bool isActive;
        uint256 lastUpdated;
        mapping(string => string) attributes;
    }
    
    // Maps game ID to its metadata
    mapping(string => GameMetadata) private gameMetadata;
    string[] public registeredGames;
    
    // Events
    event GameRegistered(string indexed gameId, string gameName, address gameContract);
    event GameUpdated(string indexed gameId, string attribute, string value);
    event GameStatusChanged(string indexed gameId, bool isActive);
    
    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "GameRegistry: caller is not the owner");
        _;
    }
    
    modifier gameExists(string calldata gameId) {
        require(bytes(gameMetadata[gameId].gameName).length > 0, "GameRegistry: game not registered");
        _;
    }
    
    /**
     * @dev Constructor to initialize the GameRegistry contract
     */
    constructor() {
        owner = msg.sender;
    }
    
    /**
     * @dev Registers a new game with metadata
     * @param gameId Unique identifier for the game
     * @param gameName Human-readable name of the game
     * @param gameVersion Version string
     * @param gameContract Address of the main game contract
     * @param apiEndpoint URL for the game's API (if any)
     */
    function registerGame(
        string calldata gameId,
        string calldata gameName,
        string calldata gameVersion,
        address gameContract,
        string calldata apiEndpoint
    ) external onlyOwner {
        require(bytes(gameMetadata[gameId].gameName).length == 0, "GameRegistry: game ID already exists");
        
        GameMetadata storage metadata = gameMetadata[gameId];
        metadata.gameName = gameName;
        metadata.gameVersion = gameVersion;
        metadata.gameContract = gameContract;
        metadata.apiEndpoint = apiEndpoint;
        metadata.isActive = true;
        metadata.lastUpdated = block.timestamp;
        
        registeredGames.push(gameId);
        
        emit GameRegistered(gameId, gameName, gameContract);
    }
    
    /**
     * @dev Sets a game-specific attribute
     * @param gameId Game identifier
     * @param key Attribute key
     * @param value Attribute value
     */
    function setGameAttribute(
        string calldata gameId,
        string calldata key,
        string calldata value
    ) external onlyOwner gameExists(gameId) {
        gameMetadata[gameId].attributes[key] = value;
        gameMetadata[gameId].lastUpdated = block.timestamp;
        
        emit GameUpdated(gameId, key, value);
    }
    
    /**
     * @dev Gets a game-specific attribute
     * @param gameId Game identifier
     * @param key Attribute key
     * @return Attribute value
     */
    function getGameAttribute(string calldata gameId, string calldata key) 
        external 
        view 
        gameExists(gameId) 
        returns (string memory) {
        return gameMetadata[gameId].attributes[key];
    }
    
    /**
     * @dev Activates or deactivates a game
     * @param gameId Game identifier
     * @param isActive Status to set
     */
    function setGameStatus(string calldata gameId, bool isActive) 
        external 
        onlyOwner 
        gameExists(gameId) {
        gameMetadata[gameId].isActive = isActive;
        gameMetadata[gameId].lastUpdated = block.timestamp;
        
        emit GameStatusChanged(gameId, isActive);
    }
    
    /**
     * @dev Gets basic game information
     * @param gameId Game identifier
     * @return Game name, version, contract address, API endpoint, active status, and last updated timestamp
     */
    function getGameInfo(string calldata gameId) 
        external 
        view 
        gameExists(gameId) 
        returns (
            string memory gameName,
            string memory gameVersion,
            address gameContract,
            string memory apiEndpoint,
            bool isActive,
            uint256 lastUpdated
        ) {
        GameMetadata storage metadata = gameMetadata[gameId];
        return (
            metadata.gameName,
            metadata.gameVersion,
            metadata.gameContract,
            metadata.apiEndpoint,
            metadata.isActive,
            metadata.lastUpdated
        );
    }
    
    /**
     * @dev Gets all registered game IDs
     * @return Array of game IDs
     */
    function getAllGames() external view returns (string[] memory) {
        return registeredGames;
    }
    
    /**
     * @dev Gets count of registered games
     * @return Number of registered games
     */
    function getGameCount() external view returns (uint256) {
        return registeredGames.length;
    }
    
    /**
     * @dev Updates game contract address
     * @param gameId Game identifier
     * @param newGameContract New address for the game contract
     */
    function updateGameContract(string calldata gameId, address newGameContract) 
        external 
        onlyOwner 
        gameExists(gameId) {
        gameMetadata[gameId].gameContract = newGameContract;
        gameMetadata[gameId].lastUpdated = block.timestamp;
        
        emit GameUpdated(gameId, "gameContract", Strings.toHexString(uint160(newGameContract), 20));
    }
    
    /**
     * @dev Transfer ownership of the contract
     * @param newOwner Address of the new owner
     */
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "GameRegistry: new owner is the zero address");
        owner = newOwner;
    }
}

/**
 * @dev String utilities
 */
library Strings {
    function toHexString(uint256 value, uint256 length) internal pure returns (string memory) {
        bytes memory buffer = new bytes(2 * length + 2);
        buffer[0] = '0';
        buffer[1] = 'x';
        for (uint256 i = 2 * length + 1; i > 1; --i) {
            buffer[i] = bytes1(uint8(48 + uint256(uint8(value & 0xf))));
            value >>= 4;
        }
        require(value == 0, "Strings: hex length insufficient");
        return string(buffer);
    }
}