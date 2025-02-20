# QuestMind - Smart Contract Documentation

## Overview
QuestMind is an AI-powered autonomous gaming agent on Avalanche. This document provides detailed information about the project's smart contracts, their functions, and how they interact.

## Contract Architecture

The QuestMind smart contract system consists of the following main components:

1. **AIExecutor.sol**
2. **WalletManager.sol**
3. **GameIntegrator.sol** 
4. **GameRegistry.sol**
5. **DFKConnector.sol**

### Contract Relationships

```
                     ┌───────────────┐
                     │   AIExecutor  │
                     └───────┬───────┘
                             │
                             ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│ WalletManager │◄───┤GameIntegrator │────►│ GameRegistry │
└───────────────┘    └───────┬───────┘    └───────────────┘
                             │
                             ▼
                     ┌───────────────┐
                     │  DFKConnector │
                     └───────────────┘
```

## GameIntegrator Contract

The `GameIntegrator` serves as the main interface between the AI agent and game-specific smart contracts. It handles the execution of game actions through a unified interface.

### Key Features

- **Game Registration**: Register game contracts for integration
- **Action Execution**: Execute game-specific actions with proper selectors
- **User Authorization**: Manage user permissions for different games
- **Dynamic Function Calls**: Support varied game actions through function selectors

### Main Functions

| Function | Description |
|----------|-------------|
| `addGame(string gameId, address gameContract)` | Registers a new game with its contract address |
| `addActionSelector(string gameId, string actionType, bytes4 selector)` | Maps game actions to function selectors |
| `executeGameAction(string gameId, string actionType, bytes actionData, uint256 valueAmount)` | Executes a game action with the provided parameters |
| `authorizeUserForGame(string gameId, address user, bool status)` | Manages user permissions for specific games |

## GameRegistry Contract

The `GameRegistry` maintains metadata and configuration information for all supported games.

### Key Features

- **Game Metadata**: Store and retrieve game-specific information
- **Version Tracking**: Track game versions and updates
- **Attribute Management**: Configure game-specific parameters
- **Status Management**: Enable or disable games

### Main Functions

| Function | Description |
|----------|-------------|
| `registerGame(string gameId, string gameName, string gameVersion, address gameContract, string apiEndpoint)` | Registers a game with its metadata |
| `setGameAttribute(string gameId, string key, string value)` | Sets a game-specific attribute |
| `getGameInfo(string gameId)` | Retrieves comprehensive information about a game |
| `setGameStatus(string gameId, bool isActive)` | Activates or deactivates a game |

## DFKConnector Contract

The `DFKConnector` provides specialized functionality for interacting with DeFi Kingdoms game mechanics.

### Key Features

- **Quest Management**: Start and complete quests for hero NFTs
- **Hero Tracking**: Track heroes owned by users
- **Quest Status**: Monitor quest progress and status
- **Stamina Checking**: Query hero stamina levels

### Main Functions

| Function | Description |
|----------|-------------|
| `registerHero(address user, uint256 heroId)` | Associates a hero NFT with a user |
| `startQuest(uint256 heroId, QuestType questType, bytes questData)` | Initiates a quest for a hero |
| `completeQuest(uint256 heroId)` | Completes an active quest |
| `getHeroQuestStatus(uint256 heroId)` | Retrieves the current quest status for a hero |
| `getUserHeroes(address user)` | Gets all heroes registered to a user |

## Integration Guide

### Setting Up the System

1. Deploy the contracts in the following order:
   - `WalletManager`
   - `GameRegistry`
   - `GameIntegrator`
   - `DFKConnector`
   - `AIExecutor`

2. Configure the contracts:
   ```solidity
   // 1. Set the AI Executor in GameIntegrator
   gameIntegrator.setAIExecutor(aiExecutorAddress);
   
   // 2. Set GameIntegrator in DFKConnector
   dfkConnector.setGameIntegrator(gameIntegratorAddress);
   
   // 3. Register DFK in GameRegistry
   gameRegistry.registerGame(
     "defi_kingdoms",
     "DeFi Kingdoms",
     "1.0.0",
     dfkContractAddress,
     "https://api.defikingdoms.com"
   );
   
   // 4. Add DFK to GameIntegrator
   gameIntegrator.addGame("defi_kingdoms", dfkConnectorAddress);
   
   // 5. Add action selectors
   gameIntegrator.addActionSelector(
     "defi_kingdoms",
     "startQuest",
     bytes4(keccak256("startQuest(uint256,uint8,bytes)"))
   );
   gameIntegrator.addActionSelector(
     "defi_kingdoms",
     "completeQuest",
     bytes4(keccak256("completeQuest(uint256)"))
   );
   ```

### Executing Game Actions

```solidity
// Example: Start a mining quest for hero #123
bytes memory questData = abi.encode(0, 0); // Additional parameters for quest
gameIntegrator.executeGameAction(
  "defi_kingdoms",
  "startQuest",
  abi.encode(123, uint8(0), questData),
  0
);
```

## Security Considerations

1. **Access Control**: All contracts implement strict access control using `onlyOwner` and other role-based modifiers
2. **Emergency Withdrawal**: Contracts include emergency withdrawal functions to recover stuck funds
3. **Input Validation**: Extensive validation of inputs to prevent errors and exploits
4. **Safe External Calls**: Proper handling of external contract calls with success verification

## Upgradeability

While these contracts are not upgradeable by default, the system is designed with modularity in mind:
- Game contracts can be updated via the `updateGameContract` function
- New game integrations can be added without modifying existing contracts
- The ownership of contracts can be transferred if needed

## Gas Optimization

The contracts implement several gas optimization techniques:
- Efficient storage usage
- Minimizing on-chain data
- Batched operations where possible
- View functions for data retrieval

## Future Extensions

The contract system can be extended with:
1. **Multi-game Support**: Additional game connectors for other Avalanche games
2. **Analytics Tracking**: On-chain analytics for user activities
3. **Reward Distribution**: Automated reward distribution mechanisms
4. **Governance**: DAO-controlled game parameters and strategies