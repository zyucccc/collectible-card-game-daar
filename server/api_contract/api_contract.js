require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const express = require('express');
const { ethers } = require('ethers');
const axios = require('axios')
const { get } = require('axios')

//ABI
const MainABI = require('../../contracts/artifacts/src/Main.sol/Main.json').abi;
const CollectionABI = require('../../contracts/artifacts/src/Collection.sol/Collection.json').abi;

//recuperer les adresse via les variables d'environnement
const MAINNET_RPC_URL = process.env.MAINNET_RPC_URL || "http://localhost:8545";
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const MAIN_CONTRACT_ADDRESS = process.env.MAIN_CONTRACT_ADDRESS;

// console.log("MAINNET_RPC_URL: ", MAINNET_RPC_URL);
// console.log("PRIVATE_KEY: ", PRIVATE_KEY);
// console.log("MAIN_CONTRACT_ADDRESS: ", MAIN_CONTRACT_ADDRESS);


//-----------------------------------Booster-------------------------------------//
//ici notre moyen est de considerer les boosters comme des card speciales(NFT)
//dans ci api,on va stocker les "vrai" donnee contenu dans les boosters
//chaque fois on veut redeem un booster,on va recuperer son cardID,normalement
// ca va est "booster1","booster2" tel truc et apres on peut recuperer les donnees
//dans ce tableau (ou un mapping?),et on va inserer ces cards du booster dans la collection
const boosters = {
  "booster1": ["swsh3-1", "swsh3-2", "swsh3-3", "swsh3-4", "swsh3-5"],
  "booster2": ["swsh4-1", "swsh4-2", "swsh4-3", "swsh4-4", "swsh4-5"],
  "booster3": ["swsh5-1", "swsh5-2", "swsh5-3", "swsh5-4", "swsh5-5"],
};

//provider et signer(wallet)
const provider = new ethers.JsonRpcProvider(MAINNET_RPC_URL);
const signer = new ethers.Wallet(PRIVATE_KEY, provider);

//creer un contract Main par le compte[0] private key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
const mainContract = new ethers.Contract(MAIN_CONTRACT_ADDRESS, MainABI, signer);

const getTest = async (req, res) => {
  try {
    res.json({
      success: true,
      message: "API is working" ,
      env: {
        MAINNET_RPC_URL: MAINNET_RPC_URL,
        MAIN_CONTRACT_ADDRESS: MAIN_CONTRACT_ADDRESS
      } });
  } catch (error) {
    console.error('Error fetching test:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

//creer un contract Collection
const createCollection = async (req, res) => {
  try {
    const { user, name, cardCount } = req.body;
    const tx = await mainContract.createCollection(user, name, cardCount);
    await tx.wait();
    res.json({ success: true, message: "Collection created successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

//mint card
const mintCard = async (req, res) => {
  try {
    const { collectionID, recipient, cardNumber, ImgField } = req.body;
    const tx = await mainContract.mintCard(collectionID, recipient, cardNumber, ImgField);
    const receipt = await tx.wait();
    res.json({ success: true, message: "Card minted successfully",tokenId: receipt });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

//get collection
const getCollection = async (req, res) => {
  try {
    const collectionID = req.params.collectionID;
    const collectionAddress = await mainContract.getCollection(collectionID);
    res.json({ success: true, collectionAddress });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

//get collection count
const getCollectionCount = async (req, res) => {
  try {
    const count = await mainContract.getCollectionCount();
    res.json({ success: true, count: count.toString() });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

//get Collection Name
const getCollectionName = async (req, res) => {
  try {
    const collectionID = req.params.collectionID;
    const name = await mainContract.getCollectionName(collectionID);
    res.json({ success: true, name });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

//get All cards of un collection
const getAllCollectionCards = async (req, res) => {
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
}

//get card info
const getCardInfo = async (req, res) => {
  try {
    const { collectionID, tokenId } = req.params;
    const collectionAddress = await mainContract.getCollection(collectionID);
    const collectionContract = new ethers.Contract(collectionAddress, CollectionABI, provider);
    const cardInfo = await collectionContract.getCollectionCards(tokenId);
    res.json({ success: true, cardInfo });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

//get Collection Owner
const getCollectionOwner = async (req, res) => {
  try {
    const collectionID = req.params.collectionID;
    const owner = await mainContract.getCollectionOwner(collectionID);
    res.json({ success: true, owner });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

// getUserCollection API
const getUserCollection = async (req, res) => {
  try {
    const userAddress = req.params.userAddress;
    const collectionsInfo = await mainContract.getUserCollection(userAddress);

    // process the collections info
    const processedCollectionsInfo = collectionsInfo.map(collectionInfo => ({
      id: collectionInfo.id.toString(),
      name: collectionInfo.name,
      cardCount: collectionInfo.cardCount.toString(),
      cards: collectionInfo.cards.map(card => ({
        cardNumber: card.cardId.toString(),
        ImgField: card.ImgField
      }))
    }));

    res.json({ success: true, collectionsInfo: processedCollectionsInfo });
  } catch (error) {
    console.error('Error fetching user collections:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch collections' });
  }
}

//get CollectionID par userAddress
const getCollectionID = async (req, res) => {
  try {
    const userAddress = req.params.userAddress;
    const collectionsIDs = await mainContract.getCollectionsID(userAddress);

    const formattedCollectionIDs = collectionsIDs.map(bigIntToString);

    res.json({
      success: true,
      collectionIDs: formattedCollectionIDs
    });
  } catch (error) {
    console.error('Error fetching user collections:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch collections' });
  }
};
//--------------------------Booster-----------------------------------//
const redeemBooster = async (req, res) => {
  try {
    const { userAddress, boosterID } = req.body;

    //si l'id de booster n'existe pas dans le tableau de Api,alors cest un booster invalide
    if (!boosters[boosterID]) {
      return res.status(400).json({ success: false, error: "Invalid booster" });
    }

    // mint les cards dans du booster dans la collection
    for (const cardID of boosters[boosterID]) {
      //on prends le premier collection de l'utilisateur
      const CollectionIds = await mainContract.getCollectionsID(userAddress);
      await CollectionIds;
      //recuperer l'image du card
      const imageRes = await axios.get(`https://api.pokemontcg.io/v2/cards/${cardID}`);
      const image = imageRes.data.data.images.small;
      const tx = await mainContract.mintCard(CollectionIds[0], userAddress, cardID, image);
      const receipt = await tx.wait();
    }

    res.json({ success: true, message: "Booster redeemed successfully", cards: boosters[boosterID] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getBoosterCards = async (req, res) => {
  try {
    const { boosterID } = req.params;
    if (!boosters[boosterID]) {
      return res.status(400).json({ success: false, error: "Invalid booster" });
    }
    res.json({ success: true, cards: boosters[boosterID] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}


//----------------------fonction auxiliaire----------------------------//

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

module.exports =
{
  getTest
  , createCollection
  , mintCard
  , getCollection
  , getCollectionCount
  , getCollectionName
  , getAllCollectionCards
  , getCardInfo
  , getCollectionOwner
  , getUserCollection
  , getCollectionID
  , redeemBooster
  , getBoosterCards
}