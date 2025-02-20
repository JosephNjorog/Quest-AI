const { ethers } = require("hardhat");

// Replace with actual deployed addresses
const ADDRESSES = {
  gameRegistry: "0x9086994E481e60ceeb6C32F1af28C8B2ef363FFE",
  gameIntegrator: "0x9086994E481e60ceeb6C32F1af28C8B2ef363FFE",
  dfkConnector: "0x9086994E481e60ceeb6C32F1af28C8B2ef363FFE",
  aiExecutor: "0x9086994E481e60ceeb6C32F1af28C8B2ef363FFE",
  walletManager: "0x9086994E481e60ceeb6C32F1af28C8B2ef363FFE"
};

// DFK contract addresses (replace with actual values)
const DFK_CONTRACTS = {
  questCore: "0x9086994E481e60ceeb6C32F1af28C8B2ef363FFE",
  heroes: "0x9086994E481e60ceeb6C32F1af28C8B2ef363FFE",
  items: "0x9086994E481e60ceeb6C32F1af28C8B2ef363FFE",
  profile: "0x9086994E481e60ceeb6C32F1af28C8B2ef363FFE"
};

async function main() {
  console.log("Configuring QuestMind contracts...");
  
  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log(`Configuring with account: ${deployer.address}`);
  
  // Get contract instances
  const gameRegistry = await ethers.getContractAt("GameRegistry", ADDRESSES.gameRegistry);
  const gameIntegrator = await ethers.getContractAt("GameIntegrator", ADDRESSES.gameIntegrator);
  const dfkConnector = await ethers.getContractAt("DFKConnector", ADDRESSES.dfkConnector);
  const aiExecutor = await ethers.getContractAt("AIExecutor", ADDRESSES.aiExecutor);
  
  console.log("Setting up contract relationships...");
  
  // 1. Set AIExecutor in GameIntegrator
  await gameIntegrator.setAIExecutor(ADDRESSES.aiExecutor);
  console.log("Set AIExecutor in GameIntegrator");
  
  // 2. Set GameIntegrator in DFKConnector
  await dfkConnector.setGameIntegrator(ADDRESSES.gameIntegrator);
  console.log("Set GameIntegrator in DFKConnector");
  
  // 3. Set DFK contract addresses in DFKConnector
  await dfkConnector.setDFKContracts(
    DFK_CONTRACTS.questCore,
    DFK_CONTRACTS.heroes,
    DFK_CONTRACTS.items,
    DFK_CONTRACTS.profile
  );
  console.log("Set DFK contracts in DFKConnector");
  
  // 4. Register DFK game in GameRegistry
  await gameRegistry.registerGame(
    "defi_kingdoms",
    "DeFi Kingdoms",
    "1.0.0",
    DFK_CONTRACTS.questCore,
    "https://api.defikingdoms.com"
  );
  console.log("Registered DFK in GameRegistry");
  
  // 5. Add DFK to GameIntegrator
  await gameIntegrator.addGame("defi_kingdoms", ADDRESSES.dfkConnector);
  console.log("Added DFK to GameIntegrator");
  
  // 6. Add action selectors for common DFK actions
  const selectors = [
    {
      action: "startQuest",
      selector: ethers.utils.id("startQuest(uint256,uint8,bytes)").slice(0, 10)
    },
    {
      action: "completeQuest",
      selector: ethers.utils.id("completeQuest(uint256)").slice(0, 10)
    },
    {
      action: "getHeroStamina",
      selector: ethers.utils.id("getHeroStamina(uint256)").slice(0, 10)
    }
  ];
  
  for (const { action, selector } of selectors) {
    await gameIntegrator.addActionSelector("defi_kingdoms", action, selector);
    console.log(`Added selector for ${action}`);
  }
  
  // 7. Set additional game attributes
  await gameRegistry.setGameAttribute(
    "defi_kingdoms",
    "questTypes",
    "mining,fishing,foraging,gardening,training"
  );
  
  await gameRegistry.setGameAttribute(
    "defi_kingdoms",
    "maxStamina",
    "25"
  );
  
  console.log("Contracts configured successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
