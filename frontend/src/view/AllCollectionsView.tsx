import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:6854';

interface CardMetaData {
  cardNumber: number;
  ImgField: string;
}

interface Collection {
  id: number;
  name: string;
  cards: CardMetaData[];
  owner: string;
}

export const AllCollectionsView: React.FC = () => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const collectionsPerPage = 1;

  const fetchCollections = useCallback(async () => {
    try {
      setIsLoading(true);
      const countResponse = await axios.get(`${API_BASE_URL}/getCollectionCount`);
      const count = parseInt(countResponse.data.count);

      const collectionsData: Collection[] = [];

      for (let i = 0; i < count; i++) {
        const cardsResponse = await axios.get(`${API_BASE_URL}/getAllCollectionCards/${i}`);
        const collectionName = await axios.get(`${API_BASE_URL}/getCollectionName/${i}`);
        const collectionOwner = await axios.get(`${API_BASE_URL}/getCollectionOwner/${i}`);

        collectionsData.push({
          id: i,
          name: `Collection: ${collectionName.data.name}`,
          cards: cardsResponse.data.cards,
          owner: `Owner: ${collectionOwner.data.owner}`,
        });
      }
      setCollections(collectionsData);
    } catch (err) {
      setError('Failed to fetch collections. Please try again later.');
      console.error('Error fetching collections:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo(0, 0);
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
    </div>;
  }

  if (error) {
    return <div className="text-center text-red-500 text-xl mt-10">{error}</div>;
  }

  const pageCount = Math.ceil(collections.length / collectionsPerPage);
  const offset = currentPage * collectionsPerPage;
  const currentPageData = collections.slice(offset, offset + collectionsPerPage);

  return (
    <div className="container mx-auto px-4 py-8 relative">
      <h1 className="text-4xl font-bold text-center mb-8">All Collections</h1>
      {currentPageData.map((collection) => (
        <div key={collection.id} className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-2">{collection.name}</h2>
          <h3 className="text-lg text-gray-600 mb-4">{collection.owner}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {collection.cards.map((card, index) => (
              <div key={index} className="bg-gray-100 rounded-lg p-4 text-center">
                <img src={card.ImgField} alt={`Card ${card.cardNumber}`} className="w-full h-48 object-cover rounded-lg mb-2" />
                <p className="text-sm font-medium">Card Number: {card.cardNumber}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
      <div className="flex justify-center mt-8">
        {Array.from({ length: pageCount }).map((_, index) => (
          <button
            key={index}
            onClick={() => handlePageChange(index)}
            className={`mx-1 px-4 py-2 rounded ${
              currentPage === index ? 'bg-blue-500 text-white' : 'bg-gray-200'
            }`}
          >
            {index + 1}
          </button>
        ))}
      </div>
      {/* boutton a gauche */}
      {currentPage > 0 && (
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          className="fixed left-4 top-1/2 transform -translate-y-1/2 bg-blue-500 text-white px-4 py-2 rounded-full shadow-lg hover:bg-blue-600"
        >
          ←
        </button>
      )}
      {/* boutton a droite */}
      {currentPage < pageCount - 1 && (
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          className="fixed right-4 top-1/2 transform -translate-y-1/2 bg-blue-500 text-white px-4 py-2 rounded-full shadow-lg hover:bg-blue-600"
        >
          →
        </button>
      )}
    </div>
  );
};