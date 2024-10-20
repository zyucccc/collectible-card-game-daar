import React from 'react';
// @ts-ignore
import { Link } from 'react-router-dom';

export const HomePage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-blue-100 to-purple-100 p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-6">
          Welcome to Collective Card Game
        </h1>
        <div className="space-y-4">
          <Link
            to="/all-collections"
            className="block w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105 text-center"
          >
            All collections
          </Link>
          <Link
            to="/my-collection"
            className="block w-full bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 px-4 rounded-lg transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105 text-center"
          >
            User collection
          </Link>
        </div>
      </div>
    </div>
  );
};