import React from 'react';
import { Link } from 'react-router-dom'; // Import Link to go back

function ShakeUpgrades() {
  return (
    <div className="shake-upgrades-screen">
      <h1>Shake Upgrades</h1>
      <p>This is where the list of upgrades will go.</p>
      
      {/* A button to go back to the main page */}
      <Link to="/">
        <button>Back</button>
      </Link>
    </div>
  );
}
export default ShakeUpgrades;