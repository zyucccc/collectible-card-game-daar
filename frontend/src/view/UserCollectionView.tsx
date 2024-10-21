import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ethers } from 'ethers';
import * as ethereum from '../lib/ethereum';

const API_BASE_URL = 'http://localhost:6854';

// structure de donnees pour les cartes et les collections
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

const useWallet = () => {
  const [details, setDetails] = useState<ethereum.Details | null>(null);

  useEffect(() => {
    //get the connection info of wallet metamask
    const connectWallet = async () => {
      const details = await ethereum.connect('metamask');
      setDetails(details);
    };

    connectWallet();
    //ajoute un listener pour ecouter le changement de compte
    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length > 0) {
        setDetails(prevDetails => ({
          ...prevDetails!,
          //mise a jour le compte actuellement connecte
          account: accounts[0],
        }));
      } else {
        setDetails(null);
      }
    };

    const unsubscribe = ethereum.accountsChanged(handleAccountsChanged);

    return () => {
      unsubscribe();
    };
  }, []);

  return details;
};
//le view de user collection
export const UserCollectionView: React.FC = () => {
  const [collectionsInfo, setCollectionsInfo] = useState<CollectionInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userAddress, setUserAddress] = useState<string>('');
  const [isAddressSubmitted, setIsAddressSubmitted] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [isManualInput, setIsManualInput] = useState(false);
  const collectionsPerPage = 1;

  const walletDetails = useWallet();
  // quand le connection info de walletDetails change,on va fetch les collections correspondantes automatiquement
  useEffect(() => {
    if (walletDetails && walletDetails.account && !isManualInput) {
      setUserAddress(walletDetails.account);
      setIsAddressSubmitted(true);
      fetchUserCollections(walletDetails.account);
    }
  }, [walletDetails, isManualInput]);

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
      //une fois on veut submit l'adresse manuellement,on va changer le state de setIsManualInput(false); pour que le
      //page se rafraichir automatiquement
      setIsAddressSubmitted(true);
      setIsManualInput(false);
      fetchUserCollections(userAddress);
    }
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo(0, 0);
  };

  const resetToManualInput = () => {
    setIsAddressSubmitted(false);
    setIsManualInput(true);
    setUserAddress('');
    setCollectionsInfo([]);
    setError(null);
  };

  //if walletDetails is null,we pop to client to connect to MetaMask
  if (walletDetails === null && !isManualInput) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold mb-4">Connect to MetaMask</h1>
          <p className="mb-4">Please connect to MetaMask to view your collections.</p>
          <button
            onClick={() => ethereum.connect('metamask')}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 mb-2 w-full"
          >
            Connect to MetaMask
          </button>
          <button
            onClick={() => setIsManualInput(true)}
            className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 w-full"
          >
            Enter Address Manually
          </button>
        </div>
      </div>
    );
  }
  //dans le cas ou pas de compte connecte, on va afficher le formulaire pour entrer l'adresse manuellement
  if (!isAddressSubmitted || isManualInput) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold mb-4">Enter Your Wallet Address</h1>
          <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
            <input
              type="text"
              value={userAddress}
              onChange={(e) => setUserAddress(e.target.value)}
              placeholder="Enter your Wallet address"
              className="border rounded-md px-4 py-2 w-full"
            />
            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">
              View Collections
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center mt-10">
        <p className="text-red-500 text-xl mb-4">{error}</p>
        <button
          onClick={resetToManualInput}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
        >
          Try Another Address
        </button>
      </div>
    );
  }

  if (collectionsInfo.length === 0) {
    return (
      <div className="text-center mt-10">
        <p className="text-xl mb-4">No collections found for this address.</p>
        <button
          onClick={resetToManualInput}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
        >
          Try Another Address
        </button>
      </div>
    );
  }

  const pageCount = Math.ceil(collectionsInfo.length / collectionsPerPage);
  const offset = currentPage * collectionsPerPage;
  const currentPageData = collectionsInfo.slice(offset, offset + collectionsPerPage);

  return (
    //css-style: tilewind
    //on diviser les collections en plusieurs pages
    //on affiche les collections de chaque page
    <div className="container mx-auto px-4 py-8 relative">
      <h1 className="text-4xl font-bold text-center mb-8">Your Collections</h1>
      <p className="text-center text-gray-600 mb-8">Wallet Address: {userAddress}</p>
      {currentPageData.map((collectionInfo, collectionIndex) => (
        <div key={collectionIndex} className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-2">Collection Name: {collectionInfo.name}</h2>
          <p className="text-gray-600 mb-2">Collection ID: {collectionInfo.id}</p>
          <p className="text-gray-600 mb-4">Total Cards: {collectionInfo.cardCount}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {collectionInfo.cards.map((card, cardIndex) => (
              <div key={cardIndex} className="bg-gray-100 rounded-lg p-4 text-center">
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
      <div className="text-center mt-8">
        <button
          onClick={resetToManualInput}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
        >
          View Another Address's Collections
        </button>
      </div>
      {currentPage > 0 && (
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          className="fixed left-4 top-1/2 transform -translate-y-1/2 bg-blue-500 text-white px-4 py-2 rounded-full shadow-lg hover:bg-blue-600"
        >
          ←
        </button>
      )}
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