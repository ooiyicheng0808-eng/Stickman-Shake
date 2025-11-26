import React from 'react';
import ReactDOM from 'react-dom/client';
// Standard Sui Kit CSS
import '@mysten/dapp-kit/dist/index.css'; 

import { SuiClientProvider, WalletProvider, createNetworkConfig } from '@mysten/dapp-kit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';

// --- THIS IS THE FIX ---
// We define a custom network called 'onechain' using the URL you just found.
const { networkConfig } = createNetworkConfig({
	onechain: { 
        url: 'https://rpc-testnet.onelabs.cc/' 
    },
});

const queryClient = new QueryClient();

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      {/* We tell the App to default to 'onechain' instead of 'testnet' */}
      <SuiClientProvider networks={networkConfig} defaultNetwork="onechain">
        <WalletProvider>
          <App />
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  </React.StrictMode>
);