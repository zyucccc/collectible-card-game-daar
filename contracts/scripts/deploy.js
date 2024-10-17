const { ethers, JsonRpcProvider } = require('ethers');

//Provider.ts
const LOCAL_URL = 'http://localhost:8545'
const local = new ethers.providers.JsonRpcProvider(LOCAL_URL)

//metaMask private key
// ad27d355473aad0d68d67f9a20b9c4b645099103842315a9006dbe3b8eb5e972

// Account #0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 (10000 ETH)
// Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

//creer un wallet
const wallet = new ethers.Wallet('0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80', local);

//creer un contract
const contract_Address = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
const contract = require("../artifacts/src/Main.sol/Main.json");
const contractABI = contract.abi;
const Contract = new ethers.Contract(contract_Address, contractABI, wallet);