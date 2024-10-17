require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const express = require('express');
const { ethers } = require('ethers');
const cors = require('cors');
const app = express();
const port = 6854;

app.use(cors());
app.use(express.json());

//ABI
const MainABI = require('../contracts/artifacts/src/Main.sol/Main.json').abi;
const CollectionABI = require('../contracts/artifacts/src/Collection.sol/Collection.json').abi;

// console.log("MainABI:", JSON.stringify(MainABI, null, 2));

//recuperer les adresse via les variables d'environnement
const MAINNET_RPC_URL = process.env.MAINNET_RPC_URL || "http://localhost:8545";
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const MAIN_CONTRACT_ADDRESS = process.env.MAIN_CONTRACT_ADDRESS;

// console.log("MAINNET_RPC_URL: ", MAINNET_RPC_URL);
// console.log("PRIVATE_KEY: ", PRIVATE_KEY);
// console.log("MAIN_CONTRACT_ADDRESS: ", MAIN_CONTRACT_ADDRESS);

//provider et signer(wallet)
const provider = new ethers.JsonRpcProvider(MAINNET_RPC_URL);
const signer = new ethers.Wallet(PRIVATE_KEY, provider);

//creer un contract Main
const mainContract = new ethers.Contract(MAIN_CONTRACT_ADDRESS, MainABI, signer);

//test
app.get('/test', (req, res) => {
  res.json({
    message: "API is working",
    env: {
      MAINNET_RPC_URL: MAINNET_RPC_URL,
      MAIN_CONTRACT_ADDRESS: MAIN_CONTRACT_ADDRESS
    }
  });
});

//creer un contract Collection
app.post('/createCollection', async (req, res) => {
  try {
    const { name, cardCount } = req.body;
    const tx = await mainContract.createCollection(name, cardCount);
    await tx.wait();
    res.json({ success: true, message: "Collection created successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

//mint card
app.post('/mintCard', async (req, res) => {
  try {
    const { collectionID, recipient, cardNumber, ImgField } = req.body;
    const tx = await mainContract.mintCard(collectionID, recipient, cardNumber, ImgField);
    await tx.wait();
    res.json({ success: true, message: "Card minted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

//get address of collection
app.get('/getCollection/:collectionID', async (req, res) => {
  try {
    const collectionID = req.params.collectionID;
    const collectionAddress = await mainContract.getCollection(collectionID);
    res.json({ success: true, collectionAddress });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

//get collection count
app.get('/getCollectionCount', async (req, res) => {
  try {
    const count = await mainContract.getCollectionCount();
    res.json({ success: true, count: count.toString() });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

//get card info
app.get('/getCollectionCards/:collectionID/:tokenId', async (req, res) => {
  try {
    const { collectionID, tokenId } = req.params;
    const collectionAddress = await mainContract.getCollection(collectionID);
    const collectionContract = new ethers.Contract(collectionAddress, CollectionABI, provider);
    const cardInfo = await collectionContract.getCollectionCards(tokenId);
    res.json({ success: true, cardInfo });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});


app.listen(port, () => {
  console.log(`NFT Metadata API listening at http://localhost:${port}`);
});
