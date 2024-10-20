const { getTest,createCollection,mintCard,getCollection,getCollectionCount,getCollectionName,getAllCollectionCards,getCardInfo,getCollectionOwner,getUserCollection } = require('./api_contract/api_contract');
const {getSetCardCount,getPokemonSetByID,getPokemonSetCards,getPokemonNameByID} = require('./pokemon/PokemonSetApi');
const {getPokemonCardByID} = require('./pokemon/PokemonCardApi');
const {initCollection} = require('./init_script/init_script');

const express = require('express');

const cors = require('cors');
const app = express();
const port = 6854;

app.use(cors());
app.use(express.json());

/////////////////////////////////////////////////////////
//-----------------------Init--------------------------//
/////////////////////////////////////////////////////////

initCollection();

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


app.listen(port, () => {
  console.log(`NFT Metadata API listening at http://localhost:${port}`);
});
