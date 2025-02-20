# QuestMind - Deployment Guide

This document provides step-by-step instructions for deploying and configuring the QuestMind smart contract ecosystem on the Avalanche network.

## Prerequisites

- Node.js (v14+)
- Hardhat or Truffle
- An Avalanche wallet with sufficient AVAX for deployment
- Private key for deployment account
- Avalanche RPC endpoint (Mainnet or Fuji Testnet)

## Environment Setup

1. Create a `.env` file with the following variables:
```
PRIVATE_KEY=your_private_key_here
AVAX_MAINNET_URL=https://api.avax.network/ext/bc/C/rpc
AVAX_TESTNET_URL=https://api.avax-test.network/ext/bc/C/rpc
DEPLOY_NETWORK=fuji  # or 'mainnet'
```

2. Install dependencies:
```bash
npm install @openzeppelin/contracts hardhat @nomiclabs/hardhat-ethers ethers
```

## Deployment Steps

### 1. Compile Contracts

```bash
npx hardhat compile
```

### 2. Deploy Contracts

Create a deployment script in `scripts/deploy.js`:

Run the deployment script:
```bash
npx hardhat run scripts/deploy.js --network fuji
```

### 3. Configure Contracts

After deployment, create a configuration script in `scripts/configure.js`:

Run the configuration script:
```bash
npx hardhat run scripts/configure.js --network fuji
```

## Verification Steps

### 1. Verify Contract Code on Snowtrace

```bash
npx hardhat verify --network fuji DEPLOYED_CONTRACT_ADDRESS [constructor arguments if any]
```

Repeat for each contract.

### 2. Test Integration

Create a test script in `scripts/test-integration.js`:

```javascript
const { ethers } = require("hardhat");

// Replace with actual deployed addresses
const ADDRESSES = {
  gameIntegrator: "0x...",
  dfkConnector: "0x..."
};

async function main() {
  console.log("Testing QuestMind integration...");
  
  // Get signer
  const [signer] = await ethers.getSigners();
  console.log(`Testing with account: ${signer.address}`);
  
  // Get contract instances
  const gameIntegrator = await ethers.getContractAt("GameIntegrator", ADDRESSES.gameIntegrator);
  const dfkConnector = await ethers.getContractAt("DFKConnector", ADDRESSES.dfkConnector);
  
  // 1. Authorize user
  await gameIntegrator.authorizeUserForGame("defi_kingdoms", signer.address, true);
  console.log("User authorized");
  
  // 2. Register a hero (replace 123 with actual hero ID)
  const heroId = 123;
  await dfkConnector.registerHero(signer.address, heroId);
  console.log(`Hero ${heroId} registered`);
  
  // 3. Test startQuest execution
  const questType = 0; // 0 = Mining
  const questData = ethers.utils.defaultAbiCoder.encode(["uint256", "uint256"], [0, 0]);
  const encodedParams = ethers.utils.defaultAbiCoder.encode(
    ["uint256", "uint8", "bytes"],
    [heroId, questType, questData]
  );
  
  console.log("Starting quest...");
  try {
    const tx = await gameIntegrator.executeGameAction(
      "defi_kingdoms",
      "startQuest",
      encodedParams,
      0
    );
    const receipt = await tx.wait();
    console.log(`Quest started! Transaction hash: ${receipt.transactionHash}`);
  } catch (error) {
    console.error("Failed to start quest:", error.message);
  }
  
  // 4. Check hero quest status
  const questStatus = await dfkConnector.getHeroQuestStatus(heroId);
  console.log("Hero quest status:", {
    questId: questStatus[0].toString(),
    startTime: questStatus[1].toString(),
    isActive: questStatus[3]
  });
  
  console.log("Integration test completed!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
```

Run the test script:
```bash
npx hardhat run scripts/test-integration.js --network fuji
```

## Deployment to Mainnet

When you're ready to deploy to Avalanche mainnet:

1. Update your `.env` file:
```
DEPLOY_NETWORK=mainnet
```

2. Run the deployment script with the mainnet network:
```bash
npx hardhat run scripts/deploy.js --network mainnet
```

3. Run the configuration script with the updated contract addresses:
```bash
npx hardhat run scripts/configure.js --network mainnet
```

## Gas Optimization Tips

1. **Batch Transactions:** When configuring multiple settings, batch them together in a single transaction
2. **Deploy During Low-Gas Periods:** Monitor gas prices and deploy during periods of lower network activity
3. **Optimize Constructor Parameters:** Initialize contracts with as many parameters as possible in the constructor


## Monitoring After Deployment

After deployment, set up:

1. **Transaction Monitoring:** Use a service like Tenderly to monitor contract interactions
2. **Alerts:** Configure alerts for unusual activities or high gas usage
3. **Dashboard:** Create a monitoring dashboard for key contract metrics

## Troubleshooting Common Issues

### Contract Verification Fails
- Ensure you're using the exact compiler version used during deployment
- Double-check constructor arguments are in the correct order
- Make sure the deployed bytecode matches the compiled bytecode

### Transaction Reverts
- Check that all prerequisite configurations are completed
- Verify the caller has appropriate permissions
- Ensure sufficient gas is provided for complex operations

### Out of Gas Errors
- Batch operations when possible
- Optimize storage usage by using appropriate data types
- Consider implementing gas-efficient patterns like pull payment instead of push payment