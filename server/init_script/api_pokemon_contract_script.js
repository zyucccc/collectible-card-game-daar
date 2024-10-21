require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const axios = require('axios');
const { ethers,NonceManager ,BigNumberish} = require('ethers');
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
const manageredSigner = new NonceManager(signer);

//creer un contract Main par le compte[0] private key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
const mainContract = new ethers.Contract(MAIN_CONTRACT_ADDRESS, MainABI, manageredSigner);

//on init le set "swsh1" de Pokemon TCG
const InitSetID = "swsh1";
const initCollection = async () => {
    try{
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
       tx = await mainContract.createCollection(User, CollectionName, CollectionCount+300);
       await tx.wait();

      // for (let i = 0; i < 5; i++) {
      //   const card = cards[i];
      //   // const nonce = await provider.getTransactionCount(User, 'pending') ;
      //   // console.log(`Minting card ${card.id} with nonce ${nonce}`);
      //   console.log(`Minting card ${card.id} `);
      //
      //   const tx = await mainContract.mintCard(0, User, card.id, card.image, { gasLimit: 1000000 });
      //   await tx.wait();
      //   console.log(`Card ${card.id} minted successfully`);
      // }

        const mintPromises = cards.map(async (card, index) => {
        // const nonce = await provider.getTransactionCount(User) + index;
        // console.log(`Minting card ${card.id} with nonce ${nonce}`);

        const tx = await mainContract.mintCard(0, User, card.id, card.image, {gasLimit: 10000000 });
        await tx.wait();
        console.log(`Card ${card.id} minted successfully`);
      });

      await Promise.all(mintPromises);
    }
    catch(error){
        console.error('Error init creationCollection:', error);
    }
}

//creation du collection et inserer les pokmanSet dans la collection
const insererSetPokman_dans_collection = async(pokmonSetID,userAdresse) => {
    try {
        const [{ data: CollectionNameRes }, { data: CollectionCountRes }, { data: cardsRes }] = await Promise.all([
          axios.get(`${API_BASE_URL}/getPokemonNameByID/${pokmonSetID}`),
          axios.get(`${API_BASE_URL}/getSetCardCount/${pokmonSetID}`),
          axios.get(`${API_BASE_URL}/getPokemonSetCards/${pokmonSetID}`)
        ])

        CollectionName = CollectionNameRes.data;
        // CollectionName = BigInt(123);
        console.log("CollectionName: ", CollectionName, typeof CollectionName);
        CollectionCount = CollectionCountRes.count;
        console.log("CollectionCount: ", CollectionCount, typeof CollectionCount);
        cards = cardsRes.data;
        console.log("cards: ", cards, typeof cards);

        //creer un instance Collection
        tx = await mainContract.createCollection(userAdresse, CollectionName, CollectionCount+300);
        await tx.wait();

        count = await mainContract.getCollectionCount();
        // console.log("countRes: ", countRes, typeof countRes);


      // for (let i = 0; i < 5; i++) {
      //   const card = cards[i];
      //   // const nonce = await provider.getTransactionCount(User, 'pending') ;
      //   // console.log(`Minting card ${card.id} with nonce ${nonce}`);
      //   console.log(`Minting card ${card.id} `);
      //
      //   const tx = await mainContract.mintCard(count, userAdresse, card.id, card.image, { gasLimit: 1000000 });
      //   await tx.wait();
      //   console.log(`Card ${card.id} minted successfully`);
      // }

        const mintPromises = cards.map(async (card, index) => {
          // const nonce = await provider.getTransactionCount(userAdresse) + index;
          // console.log(`Minting card ${card.id} with nonce ${nonce}`);

          const tx = await mainContract.mintCard(count-1n, userAdresse, card.id, card.image, {  gasLimit: 10000000 });
          await tx.wait();
          console.log(`Card ${card.id} minted successfully`);
        });

        await Promise.all(mintPromises);
      }
    catch(error){
      console.error('Error insererSetPokman dans une collection:', error);
    }
}

const add_card_to_UserCollection = async (req, res) => {
  try {
    const { userAdresse, cardID, index = 0 } = req.body;
    console.log("userAdresse: ", userAdresse, typeof userAdresse);
    console.log("cardID: ", cardID, typeof cardID);
    console.log("index: ", index, typeof index);

    // Fetch collection IDs
    const collectionIdsRes = await axios.get(`${API_BASE_URL}/getCollectionID/${userAdresse}`);
    if (!collectionIdsRes.data || !collectionIdsRes.data.collectionIDs) {
      return res.status(404).json({ success: false, message: 'No collections found for this user' });
    }
    const index_bignumber = BigInt(index);
    const collectionId = collectionIdsRes.data.collectionIDs[index];
    console.log("collectionId: ", collectionId, typeof collectionId);

    // Fetch card details
    const cardRes = await axios.get(`https://api.pokemontcg.io/v2/cards/${cardID}`);
    // console.log("cardRes: ", cardRes.data, typeof cardRes.data);

    const cardImg = cardRes.data.data.images.small;
    console.log("cardImg: ", cardImg, typeof cardImg);

    // Mint the card
    const tx = await mainContract.mintCard(collectionId, userAdresse, cardID, cardImg);
    await tx.wait();
    console.log(`Card ${cardID} minted successfully`);

    // Send success response
    res.json({ success: true, message: 'Card minted successfully' });
  } catch (error) {
    console.error('Error in add_card_to_UserCollection:', error);
    res.status(500).json({ success: false, message: 'Error minting card', error: error.message });
  }
};

//booster
// "id": "swsh3-1"
// "id": "swsh3-2"
// "id": "swsh3-3"
// "id": "swsh3-4"
// "id": "swsh3-5"
const add_booster_to_UserCollection = async (req, res) => {
  try {
    const { userAdresse, index = 0, booster_count } = req.body;
    console.log("userAdresse: ", userAdresse, typeof userAdresse);
    console.log("index: ", index, typeof index);
    console.log("booster_count: ", booster_count, typeof booster_count);

    // Predefined booster packs
    const boosterPacks = {
      1: ["swsh1-1", "swsh1-2", "swsh1-3", "swsh1-4", "swsh1-5"],
      2: ["swsh2-1", "swsh2-2", "swsh2-3", "swsh2-4", "swsh2-5"],
      3: ["swsh3-1", "swsh3-2", "swsh3-3", "swsh3-4", "swsh3-5"],
      4: ["swsh4-1", "swsh4-2", "swsh4-3", "swsh4-4", "swsh4-5"],
      5: ["swsh5-1", "swsh5-2", "swsh5-3", "swsh5-4", "swsh5-5"]
    };

    // Check if the booster_count is valid
    if (!boosterPacks[booster_count]) {
      return res.status(400).json({ success: false, message: 'Invalid booster count' });
    }

    // Select the appropriate booster pack
    const selectedBoosterPack = boosterPacks[booster_count];

    // Fetch collection IDs
    const collectionIdsRes = await axios.get(`${API_BASE_URL}/getCollectionID/${userAdresse}`);
    if (!collectionIdsRes.data || !collectionIdsRes.data.collectionIDs) {
      return res.status(404).json({ success: false, message: 'No collections found for this user' });
    }
    const index_bignumber = BigInt(index);
    const collectionId = collectionIdsRes.data.collectionIDs[index];
    console.log("collectionId: ", collectionId, typeof collectionId);

    // Process each card in the selected booster pack
    for (const cardID of selectedBoosterPack) {
      try {
        // Fetch card details
        const cardRes = await axios.get(`https://api.pokemontcg.io/v2/cards/${cardID}`);
        const cardImg = cardRes.data.data.images.small;
        console.log("cardImg: ", cardImg, typeof cardImg);

        // Mint the card
        const tx = await mainContract.mintCard(collectionId, userAdresse, cardID, cardImg);
        await tx.wait();
        console.log(`Card ${cardID} minted successfully`);
      } catch (error) {
        console.error(`Error processing card ${cardID}:`, error);
        // Continue with the next card instead of stopping the entire process
      }
    }

    // Send success response
    res.json({ success: true, message: `Booster pack ${booster_count} added successfully` });
  } catch (error) {
    console.error('Error in add_booster_to_UserCollection:', error);
    res.status(500).json({ success: false, message: 'Error adding booster pack', error: error.message });
  }
};



module.exports = {
    initCollection,
    insererSetPokman_dans_collection,
    add_card_to_UserCollection
}