// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

/**
 * @title DFKConnector
 * @dev Specialized contract for Defi Kingdoms interactions
 */
contract DFKConnector {
    // State variables
    address public owner;
    address public gameIntegrator;
    
    // DFK contract addresses
    address public questCoreContract;
    address public heroesContract;
    address public itemsContract;
    address public profileContract;
    
    // Quest types
    enum QuestType {
        Mining,
        Gardening,
        Foraging,
        Fishing,
        Training
    }
    
    // Quest status
    struct QuestStatus {
        uint256 questId;
        uint256 startTime;
        uint256 completeTime;
        bool isActive;
        bool isComplete;
        QuestType questType;
    }
    
    // Hero quest tracking
    mapping(uint256 => QuestStatus) public heroQuests; // heroId => QuestStatus
    mapping(address => uint256[]) public userHeroes; // user => hero IDs
    
    // Events
    event QuestStarted(uint256 indexed heroId, QuestType questType, uint256 questId);
    event QuestCompleted(uint256 indexed heroId, QuestType questType, uint256 questId);
    event ContractAddressUpdated(string contractType, address newAddress);
    event HeroRegistered(address indexed user, uint256 heroId);
    
    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "DFKConnector: caller is not the owner");
        _;
    }
    
    modifier onlyGameIntegrator() {
        require(msg.sender == gameIntegrator, "DFKConnector: caller is not the game integrator");
        _;
    }
    
    /**
     * @dev Constructor to initialize the DFKConnector contract
     */
    constructor() {
        owner = msg.sender;
    }
    
    /**
     * @dev Sets the GameIntegrator contract address
     * @param _gameIntegrator The address of the GameIntegrator contract
     */
    function setGameIntegrator(address _gameIntegrator) external onlyOwner {
        gameIntegrator = _gameIntegrator;
    }
    
    /**
     * @dev Update DFK contract addresses
     * @param _questCoreContract Address of Quest Core contract
     * @param _heroesContract Address of Heroes contract
     * @param _itemsContract Address of Items contract
     * @param _profileContract Address of Profile contract
     */
    function setDFKContracts(
        address _questCoreContract,
        address _heroesContract,
        address _itemsContract,
        address _profileContract
    ) external onlyOwner {
        questCoreContract = _questCoreContract;
        heroesContract = _heroesContract;
        itemsContract = _itemsContract;
        profileContract = _profileContract;
        
        emit ContractAddressUpdated("questCore", _questCoreContract);
        emit ContractAddressUpdated("heroes", _heroesContract);
        emit ContractAddressUpdated("items", _itemsContract);
        emit ContractAddressUpdated("profile", _profileContract);
    }
    
    /**
     * @dev Register a hero for a user
     * @param user User address
     * @param heroId Hero ID
     */
    function registerHero(address user, uint256 heroId) external {
        require(
            msg.sender == owner || msg.sender == user || msg.sender == gameIntegrator,
            "DFKConnector: not authorized"
        );
        
        // Check if hero already registered
        bool heroExists = false;
        for (uint i = 0; i < userHeroes[user].length; i++) {
            if (userHeroes[user][i] == heroId) {
                heroExists = true;
                break;
            }
        }
        
        if (!heroExists) {
            userHeroes[user].push(heroId);
            emit HeroRegistered(user, heroId);
        }
    }
    
    /**
     * @dev Start a quest for a hero
     * @param heroId ID of the hero
     * @param questType Type of quest (mining, gardening, etc.)
     * @param questData Additional data for the quest
     * @return questId ID of the started quest
     */
    function startQuest(
        uint256 heroId,
        QuestType questType,
        bytes calldata questData
    ) external onlyGameIntegrator returns (uint256 questId) {
        // Prepare call data for DFK quest contract
        bytes memory data = abi.encodeWithSignature(
            "startQuest(uint256,uint8,bytes)",
            heroId,
            uint8(questType),
            questData
        );
        
        // Call DFK contract
        (bool success, bytes memory result) = questCoreContract.call(data);
        require(success, "DFKConnector: failed to start quest");
        
        // Parse quest ID from result
        questId = abi.decode(result, (uint256));
        
        // Record quest status
        heroQuests[heroId] = QuestStatus({
            questId: questId,
            startTime: block.timestamp,
            completeTime: 0,
            isActive: true,
            isComplete: false,
            questType: questType
        });
        
        emit QuestStarted(heroId, questType, questId);
        return questId;
    }
    
    /**
     * @dev Complete a quest for a hero
     * @param heroId ID of the hero
     * @return success Whether the quest was completed successfully
     */
    function completeQuest(uint256 heroId) external onlyGameIntegrator returns (bool success) {
        // Check if hero has an active quest
        require(heroQuests[heroId].isActive, "DFKConnector: no active quest for hero");
        
        // Prepare call data for DFK quest contract
        bytes memory data = abi.encodeWithSignature(
            "completeQuest(uint256)",
            heroQuests[heroId].questId
        );
        
        // Call DFK contract
        (success, ) = questCoreContract.call(data);
        require(success, "DFKConnector: failed to complete quest");
        
        // Update quest status
        heroQuests[heroId].isActive = false;
        heroQuests[heroId].isComplete = true;
        heroQuests[heroId].completeTime = block.timestamp;
        
        emit QuestCompleted(heroId, heroQuests[heroId].questType, heroQuests[heroId].questId);
        return success;
    }
    
    /**
     * @dev Get hero quest status
     * @param heroId ID of the hero
     * @return Quest status details
     */
    function getHeroQuestStatus(uint256 heroId) external view returns (
        uint256 questId,
        uint256 startTime,
        uint256 completeTime,
        bool isActive,
        bool isComplete,
        QuestType questType
    ) {
        QuestStatus memory status = heroQuests[heroId];
        return (
            status.questId,
            status.startTime,
            status.completeTime,
            status.isActive,
            status.isComplete,
            status.questType
        );
    }
    
    /**
     * @dev Get all heroes for a user
     * @param user User address
     * @return Array of hero IDs
     */
    function getUserHeroes(address user) external view returns (uint256[] memory) {
        return userHeroes[user];
    }
    
    /**
     * @dev Check hero stamina
     * @param heroId ID of the hero
     * @return currentStamina Current stamina value
     * @return maxStamina Maximum stamina value
     */
    function getHeroStamina(uint256 heroId) external returns (uint256 currentStamina, uint256 maxStamina) {
        // Call DFK heroes contract
        bytes memory data = abi.encodeWithSignature("getHeroStamina(uint256)", heroId);
        (bool success, bytes memory result) = heroesContract.call(data);
        require(success, "DFKConnector: failed to get hero stamina");
        
        (currentStamina, maxStamina) = abi.decode(result, (uint256, uint256));
        return (currentStamina, maxStamina);
    }
    
    /**
     * @dev Emergency function to withdraw stuck funds
     * @param token Address of token to withdraw (zero address for native AVAX)
     */
    function emergencyWithdraw(address token) external onlyOwner {
        if (token == address(0)) {
            // Withdraw native AVAX
            (bool success, ) = owner.call{value: address(this).balance}("");
            require(success, "DFKConnector: AVAX withdrawal failed");
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
                "DFKConnector: Token withdrawal failed");
        }
    }
    
    /**
     * @dev Transfer ownership of the contract
     * @param newOwner Address of the new owner
     */
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "DFKConnector: new owner is the zero address");
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