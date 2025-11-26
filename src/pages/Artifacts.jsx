import React from 'react';
import { Link } from 'react-router-dom';

// Note: We are NOT passing the "onBuy" function here.
// Why? Because buying an NFT is a special blockchain transaction.
// It won't use the simple "handleBuyUpgrade" logic.
// We will build that logic later.

function Artifacts() {
  return (
    <div className="artifacts-screen">
      <h1>Artifacts (NFT)</h1>
      <p>This is where your ON-CHAIN shop for permanent NFT upgrades will go.</p>

      {/* This page will be the most complex.
          It will need to:
          1. Check if the Onewallet is connected.
          2. Show a list of NFTs to mint.
          3. Call a smart contract function to "mint" one.
      */}
      
      <div className="nft-list">
        <div className="nft-item">
          <span>Permanent +10% Essence Boost (NFT)</span>
          {/* This button will eventually trigger a wallet transaction */}
          <button>Mint (Cost: 0.1 ???)</button>
        </div>
      </div>

      {/* Link to navigate back to the main page */}
      <Link to="/">
        <button>Back to Game</button>
      </Link>
    </div>
  );
}

export default Artifacts;