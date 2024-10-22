const { getTest,createCollection,mintCard,getCollection,getCollectionCount,getCollectionName,getAllCollectionCards,getCardInfo,getCollectionOwner,getUserCollection,getCollectionID,redeemBooster,getBoosterCards} = require('./api_contract/api_contract');
const {getSetCardCount,getPokemonSetByID,getPokemonSetCards,getPokemonNameByID} = require('./pokemon/PokemonSetApi');
const {getPokemonCardByID} = require('./pokemon/PokemonCardApi');
const {initCollection,insererSetPokman_dans_collection,add_card_to_UserCollection,creation_vide_collection} = require('./init_script/api_pokemon_contract_script');

const express = require('express');

const cors = require('cors');
const app = express();
const port = 6854;

app.use(cors());
app.use(express.json());


/////////////////////////////////////////////////////////
//-----------------------Init--------------------------//
/////////////////////////////////////////////////////////

async function init(){
  try {
    //init une collection avec le set de pokemon quand on demarre le serveur
    await initCollection();
    await creation_vide_collection("0x70997970C51812dc3A010C7d01b50e0d17dc79C8");

    //inserer un set de pokemon dans une collection
    // await insererSetPokman_dans_collection("swsh2", "0x70997970C51812dc3A010C7d01b50e0d17dc79C8");
    // await insererSetPokman_dans_collection("swsh3", "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC");
    // await insererSetPokman_dans_collection("swsh4", "0x90F79bf6EB2c4f870365E785982E1f101E93b906");
  }
  catch(error){
    console.error('Error init:', error);
  }
  }
init();

/////////////////////////////////////////////////////////
//----------------------Pokemon------------------------//
/////////////////////////////////////////////////////////

//--------------------Pokemon Set----------------------//

//get Pokemon Set By ID
app.get('/getPokemonSetByID/:setId', getPokemonSetByID);

//get Pokemon Set Cards
app.get('/getPokemonSetCards/:setId', getPokemonSetCards);

//get Pokemon Set Card Count
app.get('/getSetCardCount/:setId', getSetCardCount);

//get Pokemon name by ID
app.get('/getPokemonNameByID/:setId', getPokemonNameByID);

//----------------------Pokemon Card----------------------//

app.get('/getPokemonCardByID/:cardId', getPokemonCardByID);

/////////////////////////////////////////////////////////
//--------------------API Contract---------------------//
/////////////////////////////////////////////////////////

//test
app.get('/test', getTest);

//creer un contract Collection
app.post('/createCollection', createCollection);

//mint card
app.post('/mintCard', mintCard);

//get collection
app.get('/getCollection/:collectionID', getCollection);

//get collection count
app.get('/getCollectionCount', getCollectionCount);

//get Collection Name
app.get('/getCollectionName/:collectionID', getCollectionName);

//get All cards of un collection
app.get('/getAllCollectionCards/:collectionID', getAllCollectionCards);

//get card info
app.get('/getCardInfo/:collectionID/:tokenId', getCardInfo);

//get Collection Owner
app.get('/getCollectionOwner/:collectionID', getCollectionOwner);

// getUserCollection API
app.get('/getUserCollection/:userAddress', getUserCollection);

//get Collection ID
app.get('/getCollectionID/:userAddress', getCollectionID);

//redeem Booster
app.post('/redeemBooster', redeemBooster);

//get Booster Cards
app.get('/getBoosterCards/:boosterID', getBoosterCards);

//add a card into collection
app.post('/addCardToCollection', add_card_to_UserCollection);

app.listen(port, () => {
  console.log(`NFT Metadata API listening at http://localhost:${port}`);
});
