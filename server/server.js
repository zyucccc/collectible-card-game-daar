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

//get collection
app.get('/getCollection/:collectionID', async (req, res) => {
  try {
    const collectionID = req.params.collectionID;
    const collectionAddress = await mainContract.getCollection(collectionID);
    res.json({ success: true, collectionAddress });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

//get collection addresse
app.get('/getCollectionAddress/:collectionID', async (req, res) => {
  try {
    const collectionID = req.params.collectionID;
    const collectionAddress = await mainContract.getCollectionAddress(collectionID);
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

//get Collection Name
app.get('/getCollectionName/:collectionID', async (req, res) => {
  try {
    const collectionID = req.params.collectionID;
    const name = await mainContract.getCollectionName(collectionID);
    res.json({ success: true, name });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

//get All cards of un collection
app.get('/getAllCollectionCards/:collectionID', async (req, res) => {
  try {
    const { collectionID } = req.params;
    const collectionAddress = await mainContract.getCollection(collectionID);
    const collectionContract = new ethers.Contract(collectionAddress, CollectionABI, provider);
    const cards = await collectionContract.getAllCollectionCards();
    //convertir uint256 en string
    const processedCards = bigIntToString(cards);
    res.json({ success: true, cards: processedCards });
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

// getUserCollection API
app.get('/getUserCollection/:userAddress', async (req, res) => {
  try {
    const userAddress = req.params.userAddress;
    const collectionInfo = await mainContract.getUserCollection(userAddress);

    // process the collection info
    const processedCollectionInfo = {
      id: collectionInfo.id.toString(),
      name: collectionInfo.name,
      cardCount: collectionInfo.cardCount.toString(),
      cards: collectionInfo.cards.map(card => ({
        cardNumber: card.cardNumber.toString(),
        ImgField: card.ImgField
      }))
    };

    res.json({ success: true, collectionInfo: processedCollectionInfo });
  } catch (error) {
    if (error.message.includes("No collection found for this user")) {
      res.status(404).json({ success: false, error: "can't find the collection of this user" });
    } else {
      res.status(500).json({ success: false, error: error.message });
    }
  }
});

//fonction auxiliaire

function processCardMetaData(cardData) {
  if (Array.isArray(cardData) && cardData.length === 2) {
    return {
      cardNumber: bigIntToString(cardData[0]),
      ImgField: cardData[1]
    };
  }
  return cardData;
}

//BigInt to String
function bigIntToString(obj) {
  if (typeof obj === 'bigint') {
    return obj.toString();
  } else if (Array.isArray(obj)) {
    return obj.map(processCardMetaData);
  } else if (typeof obj === 'object' && obj !== null) {
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [key, bigIntToString(value)])
    );
  }
  return obj;
}



app.listen(port, () => {
  console.log(`NFT Metadata API listening at http://localhost:${port}`);
});
