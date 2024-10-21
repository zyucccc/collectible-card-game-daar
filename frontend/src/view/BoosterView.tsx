import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useWallet } from '@/hook/hook';

const API_BASE_URL = 'http://localhost:6854';

interface CardData {
  id: string;
  imageUrl: string;
}

export const BoosterView: React.FC = () => {
  const [boosterCards, setBoosterCards] = useState<CardData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userAddress, setUserAddress] = useState('');
  const [status, setStatus] = useState('');

  const wallet = useWallet();
  const walletDetails = wallet?.details;

  const cardIds = ["swsh3-1", "swsh3-2", "swsh3-3", "swsh3-4", "swsh3-5"];

  useEffect(() => {
    const fetchCardImages = async () => {
      setIsLoading(true);
      try {
        const cardPromises = cardIds.map(id =>
          axios.get(`https://api.pokemontcg.io/v2/cards/${id}`)
        );
        const cardResponses = await Promise.all(cardPromises);
        const cardData = cardResponses.map(response => ({
          id: response.data.data.id,
          imageUrl: response.data.data.images.small
        }));
        setBoosterCards(cardData);
      } catch (err) {
        console.error('Error fetching card images:', err);
        setError('Failed to load booster cards. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCardImages();
  }, []);

  useEffect(() => {
    if (walletDetails && walletDetails.account) {
      setUserAddress(walletDetails.account);
    }
  }, [walletDetails]);

  const handleBoosterMint = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('Processing...');

    try {
      // @ts-ignore
      const CollectionIds = await wallet.contract.getCollectionsID(userAddress);
      await CollectionIds;
      console.log('Collection ID:', CollectionIds[0]);

      for (const cardId of cardIds) {
        const cardImg = await axios.get(`https://api.pokemontcg.io/v2/cards/${cardId}`);
        const image_lien = cardImg.data.data.images.small;
        console.log('Card ID:', cardId, 'Image:', image_lien);
        const tx = await wallet?.contract?.mintCard(CollectionIds[0], userAddress, cardId, image_lien);
        await tx.wait();
      }
      setStatus('Booster minted successfully!');
    } catch (error) {
      console.error('Booster minting failed:', error);
      setStatus('Booster minting failed. Please check your input information.');
    }
  };

  if (isLoading) {
    return <div className="text-center mt-10">Loading booster cards...</div>;
  }

  if (error) {
    return <div className="text-center mt-10 text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8">Special Booster Pack</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {boosterCards.map((card) => (
          <div key={card.id} className="bg-gray-100 rounded-lg p-4 text-center">
            <img src={card.imageUrl} alt={`Card ${card.id}`} className="w-full h-48 object-cover rounded-lg mb-2" />
            <p className="text-sm font-medium">Card ID: {card.id}</p>
          </div>
        ))}
      </div>
      <div className="max-w-md mx-auto bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">Mint Booster Pack</h2>
        <h3 className="text-2xl text-center text-gray-800">Fill the Wallet Address to add this pack</h3>
        <form onSubmit={handleBoosterMint} className="space-y-4">
          <div>
            <label htmlFor="userAddress" className="block text-gray-700 text-sm font-bold mb-2">
              Wallet Address:
            </label>
            <input
              type="text"
              id="userAddress"
              value={userAddress}
              onChange={(e) => setUserAddress(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Mint Booster Pack
            </button>
          </div>
        </form>
        {status && (
          <p className={`mt-4 text-center ${status.includes('successfully') ? 'text-green-600' : 'text-red-600'}`}>
            {status}
          </p>
        )}
      </div>
    </div>
  );
};