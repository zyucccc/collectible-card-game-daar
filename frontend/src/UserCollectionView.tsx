import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:6854';

//meme interface pour les cartes
interface CardMetaData {
  cardNumber: string;
  ImgField: string;
}

//interface pour les collections
interface CollectionInfo {
  id: string;
  name: string;
  cardCount: string;
  cards: CardMetaData[];
}

//la vue pour afficher la collection de l'utilisateur
export const UserCollectionView: React.FC = () => {
  const [collectionInfo, setCollectionInfo] = useState<CollectionInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userAddress, setUserAddress] = useState<string>('');
  const [isAddressSubmitted, setIsAddressSubmitted] = useState(false);

  const fetchUserCollection = async (address: string) => {
    setIsLoading(true);
    setError(null);

    try {
      //appel API pour obtenir la collection de l'utilisateur
      const response = await axios.get(`${API_BASE_URL}/getUserCollection/${address}`);
      if (response.data.success) {
        setCollectionInfo(response.data.collectionInfo);
      } else {
        setError(response.data.error || 'Failed to fetch collection info');
      }
    } catch (err) {
      console.error('Error fetching user collection:', err);
      setError('Failed to fetch your collection. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  //traiter le submit du formulaire
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (userAddress) {
      setIsAddressSubmitted(true);
      fetchUserCollection(userAddress);
    }
  };

  //si l'adresse n'est pas encore soumise,afficher le formulaire
  if (!isAddressSubmitted) {
    return (
      <div>
        <h1>Enter Your Ethereum Address</h1>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={userAddress}
            onChange={(e) => setUserAddress(e.target.value)}
            placeholder="Enter your Ethereum address"
            style={{ width: '300px', padding: '5px' }}
          />
          <button type="submit">View Collection</button>
        </form>
      </div>
    );
  }

  if (isLoading) {
    return <div>Loading your collection...</div>;
  }

  if (error) {
    return (
      <div>
        <p>Error: {error}</p>
        <button onClick={() => setIsAddressSubmitted(false)}>Try Another Address</button>
      </div>
    );
  }

  if (!collectionInfo) {
    return (
      <div>
        <p>No collection found for this address.</p>
        <button onClick={() => setIsAddressSubmitted(false)}>Try Another Address</button>
      </div>
    );
  }

  //si tout est bon,afficher la collection correspondante
  return (
    <div>
      <h1>Your Collection</h1>
      <p>Address: {userAddress}</p>
      <h2>Collection Name: {collectionInfo.name}</h2>
      <p>Collection ID: {collectionInfo.id}</p>
      <p>Total Cards: {collectionInfo.cardCount}</p>
      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        {collectionInfo.cards.map((card, index) => (
          <div key={index} style={{ margin: '10px', textAlign: 'center' }}>
            <img src={card.ImgField} alt={`Card ${card.cardNumber}`} style={{ width: '200px', height: '300px' }} />
            <p>Card Number: {card.cardNumber}</p>
          </div>
        ))}
      </div>
      <button onClick={() => setIsAddressSubmitted(false)}>View Another Collection</button>
    </div>
  );
};