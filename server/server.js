const express = require('express');
const cors = require('cors');
const app = express();
const port = 6854;

app.use(cors());
app.use(express.json());

// mockdate
const CardMetaData = {
  "1": {
    "cardNumber": 1,
    "ImgField": "https://example.com/images/card1.png"
  },
  "2": {
    "cardNumber": 2,
    "ImgField": "https://example.com/images/card2.png"
  },
};

//API router
app.get('/api/nft/:id', (req, res) => {
  // console.log(`Received request for NFT ID: ${req.params.id}`);
  const id = req.params.id;
  // console.log(`Looking up NFT with ID: ${id}`);
  const nft = CardMetaData[id];
  if (nft) {
    // console.log(`Found NFT: ${JSON.stringify(nft)}`);
    res.json(nft);
  } else {
    // console.log(`NFT with ID ${id} not found`);
    res.status(404).json({ error: "NFT not found" });
  }
});

app.listen(port, () => {
  console.log(`NFT Metadata API listening at http://localhost:${port}`);
});
