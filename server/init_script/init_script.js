require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const axios = require('axios');
const { ethers } = require('ethers');
// const { Collection } = require('../../typechain')

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:6854";

//ABI
const MainABI = require('../../contracts/artifacts/src/Main.sol/Main.json').abi;
const CollectionABI = require('../../contracts/artifacts/src/Collection.sol/Collection.json').abi;

//recuperer les adresse via les variables d'environnement
const MAINNET_RPC_URL = process.env.MAINNET_RPC_URL || "http://localhost:8545";
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const MAIN_CONTRACT_ADDRESS = process.env.MAIN_CONTRACT_ADDRESS;

//provider et signer(wallet)
const provider = new ethers.JsonRpcProvider(MAINNET_RPC_URL);
const signer = new ethers.Wallet(PRIVATE_KEY, provider);

//creer un contract Main par le compte[0] private key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
const mainContract = new ethers.Contract(MAIN_CONTRACT_ADDRESS, MainABI, signer);

//on init le set "swsh1" de Pokemon TCG
const InitSetID = "swsh1";
const initCollection = async () => {
    try{
       // CollectionName = await  axios.get(`${API_BASE_URL}/getPokemonNameByID/${InitSetID}`)
       // CollectionCount = await  axios.get(`${API_BASE_URL}/getSetCardCount/${InitSetID}`)
       // cards = await  axios.get(`${API_BASE_URL}/getPokemonSetCards/${InitSetID}`)

      const [{data: CollectionNameRes},{data: CollectionCountRes},{data: cardsRes}] = await Promise.all([
        axios.get(`${API_BASE_URL}/getPokemonNameByID/${InitSetID}`),
        axios.get(`${API_BASE_URL}/getSetCardCount/${InitSetID}`),
        axios.get(`${API_BASE_URL}/getPokemonSetCards/${InitSetID}`)
      ])

      CollectionName = CollectionNameRes.data;
      // CollectionName = BigInt(123);
      console.log("CollectionName: ", CollectionName,typeof CollectionName);
      CollectionCount = CollectionCountRes.count;
      console.log("CollectionCount: ", CollectionCount,typeof CollectionCount);
      cards = cardsRes.data;
      console.log("cards: ", cards,typeof cards);

      User = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'; // compte[0] de test hardhat
       //creer un instance Collection
       tx = await mainContract.createCollection(User, CollectionName, CollectionCount);
       await tx.wait();
       //mint card
       //  for (let i = 0; i < cards.length; i++) {
       //      card = cards[i];
       //      tx = await mainContract.mintCard(0, User, card.id, card.image);
       //      await tx.wait();
       //  }
      const mintPromises = cards.map(async (card, index) => {
        const nonce = await provider.getTransactionCount(User) + index;
        console.log(`Minting card ${card.id} with nonce ${nonce}`);

        const tx = await mainContract.mintCard(0, User, card.id, card.image, { nonce ,gasLimit: 1000000 });
        await tx.wait();
        console.log(`Card ${card.id} minted successfully`);
      });

      await Promise.all(mintPromises);
    }
    catch(error){
        console.error('Error init creationCollection:', error);
    }
}

module.exports = {
    initCollection
}