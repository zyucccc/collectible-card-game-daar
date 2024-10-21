import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {useWallet} from '@/hook/hook';

const API_BASE_URL = 'http://localhost:6854';

export const MintCardView = () => {
  const [userAddress, setUserAddress] = useState('');
  const [cardID, setCardID] = useState('');
  const [collectionIndex, setCollectionIndex] = useState('0');
  const [status, setStatus] = useState('');

  const wallet = useWallet();
  const walletDetails = wallet?.details;
  //use hood useWallet() pour pre-remplir le champ de l'adresse du wallet address dans la formulaire
  useEffect(() => {
    if (walletDetails && walletDetails.account) {
      setUserAddress(walletDetails.account);
    }
  }, [walletDetails]);

  const handleMint = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    setStatus('Processing...');

    try {
      const response = await axios.post(`${API_BASE_URL}/addCardToCollection`, {
        userAdresse: userAddress,
        cardID: cardID,
        index: parseInt(collectionIndex)
      });

      if (response.data.success) {
        setStatus('Card minted successfully!');
      } else {
        throw new Error(response.data.message || 'Minting failed');
      }
    } catch (error) {
      console.error('Minting failed:', error);
      setStatus('Minting failed. Please check your input information.');
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
      <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">Mint New Card</h2>
      <form onSubmit={handleMint} className="space-y-4">
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
        <div>
          <label htmlFor="cardID" className="block text-gray-700 text-sm font-bold mb-2">
            Pokemon Card ID:
          </label>
          <input
            type="text"
            id="cardID"
            value={cardID}
            onChange={(e) => setCardID(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>
        <div>
          <label htmlFor="collectionIndex" className="block text-gray-700 text-sm font-bold mb-2">
            Collection Index (Optional):
          </label>
          <input
            type="number"
            id="collectionIndex"
            value={collectionIndex}
            onChange={(e) => setCollectionIndex(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            min="0"
          />
        </div>
        <div className="flex items-center justify-between">
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Mint Card
          </button>
        </div>
      </form>
      {status && (
        <p className={`mt-4 text-center ${status.includes('successfully') ? 'text-green-600' : 'text-red-600'}`}>
          {status}
        </p>
      )}
    </div>
  );
};