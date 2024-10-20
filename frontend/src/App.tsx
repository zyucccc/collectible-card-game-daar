import React from 'react';
import { BrowserRouter as Router, Route, Link, Routes } from 'react-router-dom';
import { AllCollectionsView } from './view/AllCollectionsView';
import { UserCollectionView } from './view/UserCollectionView';
import { HomePage } from './view/HomePage';

export const App: React.FC = () => {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-gradient-to-r from-blue-100 to-purple-100">
        <nav className="bg-white shadow-md">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-between h-16">
              <div className="flex">
                <div className="flex-shrink-0 flex items-center">
                  <span className="text-xl font-bold text-gray-800">Card Game</span>
                </div>
                <div className="ml-6 flex space-x-8">
                  <Link to="/" className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 hover:text-blue-600">
                    Homepage
                  </Link>
                  <Link to="/all-collections" className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-blue-600">
                    All Collections
                  </Link>
                  <Link to="/my-collection" className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-blue-600">
                    User Collection
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </nav>

        <main className="flex-grow container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/all-collections" element={<AllCollectionsView />} />
            <Route path="/my-collection" element={<UserCollectionView />} />
          </Routes>
        </main>

        <footer className="bg-white shadow-md mt-auto">
          <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
            <p className="text-center text-sm text-gray-500">
              © 2024 MyApp.
            </p>
          </div>
        </footer>
      </div>
    </Router>
  );
};