const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying QuestMind contracts...");
  
  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log(`Deploying with account: ${deployer.address}`);
  
  // Deploy GameRegistry
  const GameRegistry = await ethers.getContractFactory("GameRegistry");
  const gameRegistry = await GameRegistry.deploy();
  await gameRegistry.deployed();
  console.log(`GameRegistry deployed to: ${gameRegistry.address}`);
  
  // Deploy GameIntegrator
  const GameIntegrator = await ethers.getContractFactory("GameIntegrator");
  const gameIntegrator = await GameIntegrator.deploy();
  await gameIntegrator.deployed();
  console.log(`GameIntegrator deployed to: ${gameIntegrator.address}`);
  
  // Deploy DFKConnector
  const DFKConnector = await ethers.getContractFactory("DFKConnector");
  const dfkConnector = await DFKConnector.deploy();
  await dfkConnector.deployed();
  console.log(`DFKConnector deployed to: ${dfkConnector.address}`);
  
  // Deploy AIExecutor (placeholder - use your existing contract here)
  const AIExecutor = await ethers.getContractFactory("AIExecutor");
  const aiExecutor = await AIExecutor.deploy();
  await aiExecutor.deployed();
  console.log(`AIExecutor deployed to: ${aiExecutor.address}`);
  
  // Deploy WalletManager (placeholder - use your existing contract here)
  const WalletManager = await ethers.getContractFactory("WalletManager");
  const walletManager = await WalletManager.deploy();
  await walletManager.deployed();
  console.log(`WalletManager deployed to: ${walletManager.address}`);
  
  console.log("Contracts deployed successfully!");
  return {
    gameRegistry: gameRegistry.address,
    gameIntegrator: gameIntegrator.address,
    dfkConnector: dfkConnector.address,
    aiExecutor: aiExecutor.address,
    walletManager: walletManager.address
  };
}

main()
  .then((addresses) => {
    console.log("Deployment addresses:", addresses);
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });