const axios = require('axios');

const getPokemonCardByID = async (req,res) => {
  try {
    const cardId = req.params.cardId;
    const response = await axios.get(`https://api.pokemontcg.io/v2/cards/${cardId}`);
    res.json({ success: true, data: response.data.data });
  } catch (error) {
    console.error('Error fetching card:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

module.exports = {
  getPokemonCardByID
}