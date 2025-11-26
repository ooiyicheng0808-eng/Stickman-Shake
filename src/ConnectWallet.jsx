import React, { useState } from 'react';

// NOTE: This component expects a prop function 'onWalletConnected' 
// from the parent App to handle what happens after a successful connection.
const ConnectWallet = ({ onWalletConnected }) => {
    const [isConnecting, setIsConnecting] = useState(false);
    const [error, setError] = useState(null);
    const [connectedAddress, setConnectedAddress] = useState(null);

    const handleConnect = async () => {
        setIsConnecting(true);
        setError(null);

        // SIMULATION: This simulates the OneWallet SDK handshake
        // In the real hackathon, you would use: window.oneWallet.connect()
        try {
            await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay

            // Mock successful response
            // Generate a random-looking address for realism
            const mockAddress = "0x" + Array(40).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('');
            
            setConnectedAddress(mockAddress);
            setIsConnecting(false);
        } catch (err) {
            setError("Failed to connect OneWallet. Please try again.");
            setIsConnecting(false);
        }
    };

    const handleContinue = () => {
        if (onWalletConnected && connectedAddress) {
            onWalletConnected(connectedAddress);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 p-4 font-sans">
             {/* Tailwind is assumed to be loaded in the parent App/index.html */}
            <div className="w-full max-w-md p-8 bg-gray-800 rounded-2xl shadow-2xl border border-indigo-500/30 relative overflow-hidden">
                
                {/* Background decoration */}
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>

                <div className="text-center mb-8">
                    <div className="mx-auto w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mb-4 shadow-inner border border-gray-600">
                        {/* Simple Wallet Icon */}
                        <svg className="w-8 h-8 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-white">Connect OneWallet</h2>
                    <p className="text-gray-400 mt-2 text-sm">
                        Link your wallet to store your ELO and receive crypto rewards for ranking in the top 5.
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-3 bg-red-900/30 border border-red-500/50 rounded-lg text-red-200 text-sm text-center">
                        {error}
                    </div>
                )}

                {!connectedAddress ? (
                    <button
                        onClick={handleConnect}
                        disabled={isConnecting}
                        className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all duration-200 flex items-center justify-center
                            ${isConnecting 
                                ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
                                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 active:scale-95'
                            }`}
                    >
                        {isConnecting ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Connecting...
                            </>
                        ) : (
                            "Connect OneWallet"
                        )}
                    </button>
                ) : (
                    <div className="animate-fade-in-up">
                        <div className="bg-gray-900/50 p-4 rounded-lg border border-green-500/30 mb-6 text-center">
                            <p className="text-green-400 text-sm font-bold mb-1">✓ Wallet Connected</p>
                            <p className="text-gray-300 font-mono text-xs break-all">{connectedAddress}</p>
                        </div>
                        <button
                            onClick={handleContinue}
                            className="w-full py-4 px-6 bg-green-600 hover:bg-green-500 text-white rounded-xl font-bold text-lg shadow-lg shadow-green-500/25 transition-all duration-200"
                        >
                            Continue to Game
                        </button>
                    </div>
                )}

                <div className="mt-6 text-center">
                    <button className="text-xs text-gray-500 hover:text-gray-400 underline">
                        What is OneWallet?
                    </button>
                </div>
            </div>
        </div>
    );
};

// Default export for use in your main App
export default ConnectWallet;