import React from 'react';
import { Link } from 'react-router-dom';

// We pass down currentEssence and onBuy, just like the ShakeUpgrades page
// This is because it's also an OFF-CHAIN shop that uses "Essence"

function IdleBrewery({ currentEssence, onBuy }) {
  
  // Example function for a test purchase
  const handleTestBuy = () => {
    const cost = 100; // Example cost for a passive upgrade
    const success = onBuy(cost); // Call the global function from App.jsx
    
    if (success) {
      console.log("Idle upgrade purchased!");
    } else {
      console.log("Not enough essence!");
    }
  };

  return (
    <div className="idle-brewery-screen">
      <h1>Idle Brewery</h1>
      <p>Your Current Essence: {currentEssence}</p>

      {/* This is where your list of passive upgrades will go */}
      <div className="upgrade-list">
        <div className="upgrade-item">
          <span>+1 Essence per Second (Cost: 100)</span>
          <button onClick={handleTestBuy}>Buy</button>
        </div>
        {/* Add more idle upgrades here */}
      </div>

      {/* Link to navigate back to the main page */}
      <Link to="/">
        <button>Back to Game</button>
      </Link>
    </div>
  );
}

export default IdleBrewery;