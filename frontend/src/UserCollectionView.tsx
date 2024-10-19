import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:6854';

interface CardMetaData {
  cardNumber: string;
  ImgField: string;
}

interface CollectionInfo {
  id: string;
  name: string;
  cardCount: string;
  cards: CardMetaData[];
}

export const UserCollectionView: React.FC = () => {
  const [collectionsInfo, setCollectionsInfo] = useState<CollectionInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userAddress, setUserAddress] = useState<string>('');
  const [isAddressSubmitted, setIsAddressSubmitted] = useState(false);

  const fetchUserCollections = async (address: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.get(`${API_BASE_URL}/getUserCollection/${address}`);
      if (response.data.success) {
        setCollectionsInfo(response.data.collectionsInfo);
      } else {
        setError(response.data.error || 'Failed to fetch collections info');
      }
    } catch (err) {
      console.error('Error fetching user collections:', err);
      setError('Failed to fetch your collections. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (userAddress) {
      setIsAddressSubmitted(true);
      fetchUserCollections(userAddress);
    }
  };

  if (!isAddressSubmitted) {
    return (
      <div>
        <h1>Enter Your Wallet Address</h1>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={userAddress}
            onChange={(e) => setUserAddress(e.target.value)}
            placeholder="Enter your Wallet address"
            style={{ width: '300px', padding: '5px' }}
          />
          <button type="submit">View Collections</button>
        </form>
      </div>
    );
  }

  if (isLoading) {
    return <div>Loading your collections...</div>;
  }

  if (error) {
    return (
      <div>
        <p>Error: {error}</p>
        <button onClick={() => setIsAddressSubmitted(false)}>Try Another Address</button>
      </div>
    );
  }

  if (collectionsInfo.length === 0) {
    return (
      <div>
        <p>No collections found for this address.</p>
        <button onClick={() => setIsAddressSubmitted(false)}>Try Another Address</button>
      </div>
    );
  }

  return (
    <div>
      <h1>Your Collections</h1>
      <p>Wallet Address: {userAddress}</p>
      {collectionsInfo.map((collectionInfo, collectionIndex) => (
        <div key={collectionIndex}>
          <h2>Collection Name: {collectionInfo.name}</h2>
          <p>Collection ID: {collectionInfo.id}</p>
          <p>Total Cards: {collectionInfo.cardCount}</p>
          <div style={{ display: 'flex', flexWrap: 'wrap' }}>
            {collectionInfo.cards.map((card, cardIndex) => (
              <div key={cardIndex} style={{ margin: '10px', textAlign: 'center' }}>
                <img src={card.ImgField} alt={`Card ${card.cardNumber}`} style={{ width: '200px', height: '300px' }} />
                <p>Card Number: {card.cardNumber}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
      <button onClick={() => setIsAddressSubmitted(false)}>View Another Address's Collections</button>
    </div>
  );
};