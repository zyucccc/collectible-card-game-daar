const axios = require('axios');
// import axios from 'axios';

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

    // retire id et images depuis la réponse
    const extractedCards = response.data.data.map(card => ({
      id: card.id,
      image: card.images.small // card.images.large
    }));

    res.json({ success: true, data: extractedCards });
  } catch (error) {
    console.error('Error fetching set cards:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

//get Pokemon Set Card Count
const getSetCardCount = async (req,res) => {
  try {
    const setId = req.params.setId;
    const response = await axios.get(`https://api.pokemontcg.io/v2/sets/${setId}`);
    res.json({ success: true, count: response.data.data.total });
  } catch (error) {
    console.error('Error fetching set cards:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

//get Pokemon name by ID
const getPokemonNameByID = async (req,res) => {
  try {
    const setId = req.params.setId;
    const response = await axios.get(`https://api.pokemontcg.io/v2/sets/${setId}`);
    res.json({ success: true, data: response.data.data.name });
  } catch (error) {
    console.error('Error fetching set:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

module.exports = {
  getPokemonSetByID,
  getPokemonSetCards,
  getSetCardCount,
  getPokemonNameByID
}