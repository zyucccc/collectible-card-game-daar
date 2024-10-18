import React from 'react';
// @ts-ignore
import { Link } from 'react-router-dom';

export const HomePage: React.FC = () => {
  return (
    <div>
      <h1>Welcome to NFT Collections</h1>
      <p>Choose an option:</p>
      <ul>
        <li>
          <Link to="/all-collections">View All Collections</Link>
        </li>
        <li>
          <Link to="/my-collection">View My Collection</Link>
        </li>
      </ul>
    </div>
  );
};