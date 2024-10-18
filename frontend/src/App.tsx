import React from 'react';
import { BrowserRouter as Router, Route, Link, Routes } from 'react-router-dom';
import { AllCollectionsView } from './AllCollectionsView';
import { UserCollectionView } from './UserCollectionView';
import { HomePage } from './HomePage';

export const App: React.FC = () => {
  return (
    <Router>
      <div>
        <nav>
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/all-collections">All Collections</Link>
            </li>
            <li>
              <Link to="/my-collection">My Collection</Link>
            </li>
          </ul>
        </nav>

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/all-collections" element={<AllCollectionsView />} />
          <Route path="/my-collection" element={<UserCollectionView />} />
        </Routes>
      </div>
    </Router>
  );
};