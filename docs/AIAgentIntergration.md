# QuestMind - AI Agent Integration Guide

This document provides instructions for integrating the smart contract system with the AI agent backend, enabling autonomous gameplay in Defi Kingdoms and other Avalanche games.

## System Architecture

The complete QuestMind system consists of:

1. **Smart Contracts**: Deployed on Avalanche for on-chain interactions
2. **AI Agent Backend**: Python/Node.js server that processes instructions and makes decisions
3. **Frontend Application**: User interface for instruction input and monitoring
4. **Blockchain Indexer**: For faster data retrieval and event monitoring

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│   Frontend  │◄────►│  AI Agent   │◄────►│ Smart       │
│   (React)   │      │  Backend    │      │ Contracts   │
└─────────────┘      └─────────────┘      └─────────────┘
                            │                    ▲
                            ▼                    │
                     ┌─────────────┐      ┌─────────────┐
                     │  Language   │      │ Blockchain  │
                     │  Model API  │      │ Indexer     │
                     └─────────────┘      └─────────────┘
```

## Contract ABI Setup

First, generate and save the contract ABIs:

```bash
# From the smart contract project folder
npx hardhat export-abi
```

This will create an `abi` folder containing JSON files for each contract.

## AI Agent Backend Integration

### 1. Setting Up Contract Interaction

#### Python Implementation (with web3.py)

```python
from web3 import Web3
import json
import os

# Connection setup
def setup_web3_connection():
    RPC_URL = os.getenv("AVALANCHE_RPC_URL", "https://api.avax.network/ext/bc/C/rpc")
    w3 = Web3(Web3.HTTPProvider(RPC_URL))
    return w3

# Load contract ABIs
def load_contract(w3, contract_name, contract_address):
    with open(f"./abi/{contract_name}.json", "r") as f:
        contract_abi = json.load(f)
    
    return w3.eth.contract(address=contract_address, abi=contract_abi)

# Setup all contracts
def setup_contracts(w3):
    ADDRESSES = {
        "gameIntegrator": "0x...",
        "dfkConnector": "0x...",
        "gameRegistry": "0x...",
    }
    
    return {
        "gameIntegrator": load_contract(w3, "GameIntegrator", ADDRESSES["gameIntegrator"]),
        "dfkConnector": load_contract(w3, "DFKConnector", ADDRESSES["dfkConnector"]),
        "gameRegistry": load_contract(w3, "GameRegistry", ADDRESSES["gameRegistry"]),
    }
```

#### JavaScript Implementation (with ethers.js)

```javascript
const { ethers } = require("ethers");
const fs = require("fs");

// Connection setup
function setupProvider() {
    const RPC_URL = process.env.AVALANCHE_RPC_URL || "https://api.avax.network/ext/bc/C/rpc";
    return new ethers.providers.JsonRpcProvider(RPC_URL);
}

// Load contract ABIs
function loadContract(contractName, contractAddress, provider, signer) {
    const abi = JSON.parse(fs.readFileSync(`./abi/${contractName}.json`));
    return new ethers.Contract(contractAddress, abi, signer || provider);
}

// Setup all contracts
async function setupContracts(provider, wallet) {
    const signer = wallet.connect(provider);
    
    const ADDRESSES = {
        gameIntegrator: "0x...",
        dfkConnector: "0x...",
        gameRegistry: "0x..."
    };
    
    return {
        gameIntegrator: loadContract("GameIntegrator", ADDRESSES.gameIntegrator, provider, signer),
        dfkConnector: loadContract("DFKConnector", ADDRESSES.dfkConnector, provider, signer),
        gameRegistry: loadContract("GameRegistry", ADDRESSES.gameRegistry, provider, signer)
    };
}
```

### 2. AI Agent Decision Process

The AI agent should follow this workflow:

1. Parse user instruction using NLP
2. Break down into game-specific tasks
3. Check game state (hero stats, available quests, etc.)
4. Make strategic decisions
5. Execute actions through smart contracts
6. Monitor transactions and provide feedback

#### Example: Processing User Instructions

```python
def process_user_instruction(instruction, user_address):
    """
    Process natural language instruction from user
    and convert to executable game actions
    """
    # 1. Parse instruction with LLM
    parsed_intent = llm_service.parse_instruction(instruction)
    
    # 2. Determine game and action type
    game_id = parsed_intent["game"]  # e.g., "defi_kingdoms"
    action_type = parsed_intent["action"]  # e.g., "quest"
    
    # 3. Get user's available resources (heroes, items, etc.)
    if game_id == "defi_kingdoms":
        heroes = get_user_heroes(user_address)
        
        # 4. Select appropriate hero for the task
        selected_hero = optimize_hero_selection(heroes, action_type)
        
        # 5. Determine specific quest type based on intent
        quest_type = map_intent_to_quest_type(parsed_intent["details"])
        
        # 6. Create execution plan
        execution_plan = {
            "game_id": game_id,
            "action_type": "startQuest",
            "params": {
                "heroId": selected_hero["id"],
                "questType": quest_type,
                "questData": create_quest_data(quest_type)
            }
        }
        
        return execution_plan
```

### 3. Executing Game Actions

#### Python Implementation

```python
def execute_game_action(action_plan, private_key):
    """Execute a game action through smart contracts"""
    w3 = setup_web3_connection()
    contracts = setup_contracts(w3)
    
    # Setup account
    account = w3.eth.account.from_key(private_key)
    w3.eth.default_account = account.address
    
    # Prepare transaction data
    game_id = action_plan["game_id"]
    action_type = action_plan["action_type"]
    params = action_plan["params"]
    
    # Encode parameters based on action type
    if action_type == "startQuest":
        encoded_params = encode_start_quest_params(params)
    elif action_type == "completeQuest":
        encoded_params = encode_complete_quest_params(params)
    else:
        raise ValueError(f"Unknown action type: {action_type}")
    
    # Estimate gas
    game_integrator = contracts["gameIntegrator"]
    gas_estimate = game_integrator.functions.executeGameAction(
        game_id, action_type, encoded_params, 0
    ).estimateGas({'from': account.address})
    
    # Build transaction
    tx = game_integrator.functions.executeGameAction(
        game_id, action_type, encoded_params, 0
    ).buildTransaction({
        'from': account.address,
        'gas': int(gas_estimate * 1.2),  # Add 20% buffer
        'nonce': w3.eth.getTransactionCount(account.address),
    })
    
    # Sign and send transaction
    signed_tx = w3.eth.account.sign_transaction(tx, private_key)
    tx_hash = w3.eth.sendRawTransaction(signed_tx.rawTransaction)
    
    # Return transaction hash for monitoring
    return w3.toHex(tx_hash)
```

#### JavaScript Implementation

```javascript
async function executeGameAction(actionPlan, wallet) {
    const provider = setupProvider();
    const contracts = await setupContracts(provider, wallet);
    
    // Prepare transaction data
    const { game_id, action_type, params } = actionPlan;
    
    // Encode parameters based on action type
    let encodedParams;
    if (action_type === "startQuest") {
        encodedParams = ethers.utils.defaultAbiCoder.encode(
            ["uint256", "uint8", "bytes"],
            [params.heroId, params.questType, params.questData]
        );
    } else if (action_type === "completeQuest") {
        encodedParams = ethers.utils.defaultAbiCoder.encode(
            ["uint256"],
            [params.heroId]
        );
    } else {
        throw new Error(`Unknown action type: ${action_type}`);
    }
    
    // Execute transaction
    try {
        const tx = await contracts.gameIntegrator.executeGameAction(
            game_id,
            action_type,
            encodedParams,
            0,  // value amount
            { gasLimit: 500000 }  // Add gas limit to avoid underestimation issues
        );
        
        // Wait for transaction confirmation
        const receipt = await tx.wait();
        return receipt.transactionHash;
        
    } catch (error) {
        console.error("Transaction failed:", error);
        throw error;
    }
}
```

## Event Monitoring

To track the progress of game actions and provide user feedback, set up event listeners:

```javascript
async function setupEventListeners(contracts) {
    // Listen for game action events
    contracts.gameIntegrator.on("GameActionExecuted", 
        (gameId, actionType, success, event) => {
            console.log(`Game action executed for ${gameId}: ${actionType} (Success: ${success})`);
            
            // Record the event in database
            recordGameEvent({
                type: "action",
                gameId,
                actionType,
                success,
                txHash: event.transactionHash,
                timestamp: new Date().toISOString()
            });
        }
    );
    
    // Listen for quest events
    contracts.dfkConnector.on("QuestStarted", 
        (heroId, questType, questId, event) => {
            console.log(`Quest started for hero ${heroId} (Quest ID: ${questId})`);
            
            // Update user dashboard
            updateUserDashboard({
                type: "quest_started",
                heroId: heroId.toString(),
                questType: questType,
                questId: questId.toString(),
                txHash: event.transactionHash
            });
        }
    );
    
    contracts.dfkConnector.on("QuestCompleted", 
        (heroId, questType, questId, event) => {
            console.log(`Quest completed for hero ${heroId} (Quest ID: ${questId})`);
            
            // Update user dashboard and notify
            updateUserDashboard({
                type: "quest_completed",
                heroId: heroId.toString(),
                questType: questType,
                questId: questId.toString(),
                txHash: event.transactionHash
            });
            
            // Send notification to user
            sendUserNotification({
                type: "quest_completed",
                heroId: heroId.toString(),
                message: `Your hero #${heroId} has completed the quest!`
            });
        }
    );
}
```

## Transaction Security

Implement these security practices when building the AI agent:

1. **Key Management**
   - Never store private keys in code or config files
   - Use a secure key management service (AWS KMS, HashiCorp Vault)
   - Implement proper encryption for keys at rest

2. **Transaction Signing**
   - Sign transactions offline when possible
   - Implement transaction review before submission
   - Set reasonable gas limits for each action type

3. **Rate Limiting**
   - Limit the frequency of transactions per user
   - Implement cooldown periods between similar actions
   - Monitor for suspicious activity patterns

## Example: Complete AI Agent Loop

The following pseudocode demonstrates the complete AI agent action loop:

```python
def run_ai_agent_loop(user_id, instruction):
    """Main AI agent execution loop"""
    
    # 1. Fetch user details and authentication
    user = get_user_by_id(user_id)
    
    # 2. Parse instruction with NLP/LLM
    parsed_intent = llm_service.parse_instruction(instruction)
    
    # 3. Get game state
    game_state = get_current_game_state(user.address)
    
    # 4. Generate action plan
    action_plan = generate_action_plan(parsed_intent, game_state)
    
    # 5. Validate action plan
    validation_result = validate_action_plan(action_plan, user)
    if not validation_result["valid"]:
        return {
            "status": "error",
            "message": validation_result["reason"]
        }
    
    # 6. Execute action through smart contracts
    transaction_hash = execute_game_action(action_plan, user.key_service)
    
    # 7. Monitor transaction
    tx_status = monitor_transaction(transaction_hash)
    
    # 8. Record activity and update user dashboard
    record_user_activity(user_id, action_plan, tx_status)
    
    # 9. Return results to user
    return {
        "status": "success",
        "message": "Your instruction is being executed",
        "transaction_hash": transaction_hash,
        "estimated_completion": calculate_completion_time(action_plan)
    }
```

## Optimizing AI Decisions

For better AI decision-making:

1. **Historical Data Analysis**
   - Track quest rewards over time
   - Analyze hero performance in different quest types
   - Calculate optimal stamina usage patterns

2. **Reinforcement Learning**
   - Implement reward functions based on quest outcomes
   - Train models to maximize in-game rewards
   - Adjust strategies based on game economy changes

3. **Predictive Analytics**
   - Forecast token price movements for optimal swap timing
   - Predict best quest types based on time of day/week
   - Estimate quest competition levels

## Testing the Integration

Before deploying to production, thoroughly test the integration using:

1. **Local Testnet Environment**
   - Deploy contracts to a local Avalanche network
   - Simulate user instructions and contract interactions
   - Verify event handling and error recovery

2. **Fuji Testnet Testing**
   - Conduct end-to-end testing on Avalanche Fuji testnet
   - Test with real game contracts in testnet environment
   - Measure gas costs and transaction reliability

3. **Integration Tests**
   - Test parsing of various instruction types
   - Verify correct contract method selection
   - Validate parameter encoding for all action types

## Debugging Tips

1. **Transaction Debugging**
   - Use Tenderly or BlockScout to trace transactions
   - Log all transaction parameters before submission
   - Compare gas estimates with actual gas used

2. **Contract Interaction Debugging**
   - Test read-only functions before executing transactions
   - Verify function selector encoding
   - Check parameter formatting and encoding

3. **Event Monitoring Debugging**
   - Use websocket connections for reliable event reception
   - Implement event replay for missed events
   - Setup alert thresholds for unusual events