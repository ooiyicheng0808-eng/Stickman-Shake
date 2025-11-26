import React, { useState } from 'react';

// This is the component your App.jsx is trying to import.
// It receives the login functions as props from App.jsx.
const AuthForm = ({ onLoginSubmit, onSignupSubmit, onGoogleLogin }) => {
    // Toggles between 'login' and 'signup' forms
    const [isLogin, setIsLogin] = useState(true);
    
    // Holds the form data
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    
    // For showing loading spinners or error messages
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // A helper function to handle Firebase error codes
    const getErrorMessage = (errorCode) => {
        switch (errorCode) {
            case 'auth/invalid-email':
                return 'Please enter a valid email address.';
            case 'auth/user-not-found':
            case 'auth/wrong-password':
                return 'Invalid email or password.';
            case 'auth/email-already-in-use':
                return 'This email is already in use. Please log in.';
            case 'auth/weak-password':
                return 'Password should be at least 6 characters long.';
            default:
                return 'An unknown error occurred. Please try again.';
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        
        let result;
        if (isLogin) {
            result = await onLoginSubmit(email, password);
        } else {
            result = await onSignupSubmit(email, password);
        }

        if (result.error) {
            setError(getErrorMessage(result.error.code));
        }
        
        setIsLoading(false);
    };

    const handleGoogle = async () => {
        setIsLoading(true);
        setError(null);
        const result = await onGoogleLogin();
        if (result.error) {
            setError(getErrorMessage(result.error.code));
        }
        setIsLoading(false);
    };

    return (
        <div 
            className="min-h-screen w-full flex items-center justify-center text-white"
            style={{ background: 'linear-gradient(180deg, #30154D 0%, #150A24 100%)' }}
        >
            <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet" />

            <div className="w-full max-w-md p-8 bg-gray-800 rounded-2xl shadow-2xl border-2 border-purple-500">
                <h1 className="text-4xl font-extrabold text-white text-center mb-4" style={{ textShadow: '0 4px 12px rgba(250, 204, 21, 0.5)' }}>
                    STICKMAN SHAKE!
                </h1>
                <h2 className="text-2xl font-bold text-white text-center mb-6">
                    {isLogin ? 'Log In' : 'Sign Up'}
                </h2>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                        />
                    </div>
                    
                    {error && (
                        <p className="text-sm text-red-400 text-center">{error}</p>
                    )}

                    <button 
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 font-bold text-gray-900 bg-yellow-400 rounded-lg shadow-lg hover:bg-yellow-300 transition duration-200 disabled:opacity-50"
                    >
                        {isLoading ? 'Loading...' : (isLogin ? 'Log In' : 'Create Account')}
                    </button>
                </form>

                <div className="my-4 flex items-center justify-center">
                    <span className="h-px bg-gray-600 flex-1"></span>
                    <span className="px-4 text-sm text-gray-400">OR</span>
                    <span className="h-px bg-gray-600 flex-1"></span>
                </div>

                <button
                    onClick={handleGoogle}
                    disabled={isLoading}
                    className="w-full py-3 font-bold text-white bg-blue-600 rounded-lg shadow-lg hover:bg-blue-500 transition duration-200 disabled:opacity-50"
                >
                    {isLoading ? 'Loading...' : 'Sign in with Google'}
                </button>

                <p className="text-center text-sm text-gray-400 mt-6">
                    {isLogin ? "Don't have an account?" : "Already have an account?"}
                    <button
                        onClick={() => {
                            setIsLogin(!isLogin);
                            setError(null);
                        }}
                        className="font-medium text-yellow-400 hover:text-yellow-300 ml-1"
                    >
                        {isLogin ? 'Sign Up' : 'Log In'}
                    </button>
                </p>
            </div>
        </div>
    );
};

export default AuthForm;