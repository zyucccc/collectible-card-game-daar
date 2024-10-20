const axios = require('axios');

const getPokemonSetByID = async (req,res) => {
  try {
    const setId = req.params.setId;
    const response = await axios.get(`https://api.pokemontcg.io/v2/sets/${setId}`);
    res.json({ success: true, data: response.data.data });
  } catch (error) {
    console.error('Error fetching set:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

const getPokemonSetCards = async (req,res) => {
  try {
    const setId = req.params.setId;
    const response = await axios.get(`https://api.pokemontcg.io/v2/cards?q=set.id:${setId}`);
    res.json({ success: true, data: response.data.data });
  } catch (error) {
    console.error('Error fetching set cards:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

export {
  getPokemonSetByID,
  getPokemonSetCards
}