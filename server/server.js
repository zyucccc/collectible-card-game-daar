const { getTest,createCollection,mintCard,getCollection,getCollectionCount,getCollectionName,getAllCollectionCards,getCardInfo,getCollectionOwner,getUserCollection } = require('./api_contract/api_contract');
const {} = require('./pokemon/PokemonSetApi');
const {} = require('./pokemon/PokemonCardApi');

const express = require('express');

const cors = require('cors');
const app = express();
const port = 6854;

app.use(cors());
app.use(express.json());

/////////////////////////////////////////////////////////
//----------------------Pokemon------------------------//
/////////////////////////////////////////////////////////


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
