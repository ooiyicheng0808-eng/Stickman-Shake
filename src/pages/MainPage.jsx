import React from 'react';
import { Link } from 'react-router-dom'; // Import Link

// This component shows your main game screen
function MainPage({ onShake }) {
  return (
    <div className="main-game-screen">
      {/* (Your existing UI for level, transcend, etc.) */}
      
      <div className="bottle-area" onClick={onShake}>
        <img src="path/to/bottle.png" alt="Tickman Shake" />
      </div>

      {/* (Your existing UI for the leaderboard) */}

      {/* --- THIS IS THE KEY CHANGE --- */}
      {/* We replace <button> with <Link> to change pages */}
      <div className="navigation-buttons">
        <Link to="/upgrades" className="nav-button yellow">
          <span>SHAKE UPGRADES</span>
          <span>Shop</span>
        </Link>
        <Link to="/brewery" className="nav-button purple">
          <span>IDLE BREWERY</span>
          <span>Passive Upgrades</span>
        </Link>
        <Link to="/artifacts" className="nav-button blue">
          <span>ARTIFACTS (NFT)</span>
          <span>on-chain Shop</span>
        </Link>
      </div>
    </div>
  );
}
export default MainPage;