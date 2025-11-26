import React, { useState, useEffect, useMemo, useRef } from 'react';

// --- SUI / BLOCKCHAIN IMPORTS ---
import { ConnectButton, useCurrentAccount, useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';

// --- FIREBASE IMPORTS ---
import { initializeApp } from 'firebase/app';
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut,
    GoogleAuthProvider,
    signInWithPopup,
    onAuthStateChanged
} from 'firebase/auth';
import { getFirestore, doc, setDoc, updateDoc, onSnapshot, collection, increment, writeBatch, getDoc } from 'firebase/firestore';

// --- INTERNAL AUTH FORM COMPONENT ---
const AuthForm = ({ onLoginSubmit, onSignupSubmit, onGoogleLogin }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const res = isLogin ? await onLoginSubmit(email, password) : await onSignupSubmit(email, password);
        if (res.error) setError(res.error.message);
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white p-4">
            <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet" />
            <div className="w-full max-w-md bg-gray-800 p-8 rounded-2xl shadow-2xl border border-purple-500/30">
                <h2 className="text-3xl font-extrabold text-center mb-6 text-yellow-400">{isLogin ? 'LOGIN' : 'SIGN UP'}</h2>
                {error && <div className="bg-red-500/20 text-red-200 p-3 rounded mb-4 text-sm text-center border border-red-500/50">{error}</div>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div><label className="block text-xs font-bold text-gray-400 uppercase mb-1">Email</label><input type="email" className="w-full bg-gray-900 border border-gray-700 rounded p-3 text-white focus:border-yellow-400 focus:outline-none transition" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
                    <div><label className="block text-xs font-bold text-gray-400 uppercase mb-1">Password</label><input type="password" className="w-full bg-gray-900 border border-gray-700 rounded p-3 text-white focus:border-yellow-400 focus:outline-none transition" value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
                    <button type="submit" className="w-full bg-gradient-to-r from-yellow-600 to-yellow-500 text-gray-900 font-bold py-3 rounded-lg hover:from-yellow-500 hover:to-yellow-400 transition transform active:scale-95">{isLogin ? 'ENTER THE ARENA' : 'JOIN THE FIGHT'}</button>
                </form>
                <div className="mt-4 flex items-center justify-between"><div className="h-px bg-gray-700 flex-1"></div><span className="px-2 text-gray-500 text-xs">OR</span><div className="h-px bg-gray-700 flex-1"></div></div>
                <button onClick={onGoogleLogin} className="w-full mt-4 bg-white text-gray-900 font-bold py-3 rounded-lg hover:bg-gray-200 transition transform active:scale-95 flex items-center justify-center">Continue with Google</button>
                <div className="mt-6 text-center"><button onClick={() => setIsLogin(!isLogin)} className="text-purple-400 hover:text-purple-300 text-sm font-bold transition">{isLogin ? "Need an account? Create one" : "Already have an account? Login"}</button></div>
            </div>
        </div>
    );
};

// --- CONFIGURATION ---
const firebaseConfig = { apiKey: "AIzaSyC1-oRxy187L6_JMI54-Lp9vOXVEtcXO8Q", authDomain: "chess-2d9c3.firebaseapp.com", projectId: "chess-2d9c3", storageBucket: "chess-2d9c3.firebasestorage.app", messagingSenderId: "1023612889919", appId: "1:1023612889919:web:da47993b6bb07710b9018a", measurementId: "G-80EHLY36VG" };
const PACKAGE_ID = "0x681e28a7ffa06ad63176ff877ebbf157507ac9fcb84b0ce853b486c7635d251c";
const LEADERBOARD_ID = "0x2f5ad0cd5d3552ff16d9c1688f09ecc6fc0a6c900dc431fa36ec59e4092d92b6";
const LOCAL_APP_ID = "stickman-shake-v1";
const COLLECTION_PATH = (appId) => `/artifacts/${appId}/public/data/stickman_leaderboard`;

// --- GAME CONFIG ---
const GAME_CONFIG = {
    LEVEL_SCALING_FACTOR: 500, 
    transcend_requirement: 10000, 
    shake_power: { id: 'shake', base_cost: 25, growth_rate: 1.15, effect_per_level: 1 },
    idle_brewery: { id: 'brewery', base_cost: 100, growth_rate: 1.2, effect_per_level: 1 },
    artifacts: { 'artifact_of_might': { effect_type: 'shake_multiplier', effect_value: 0.5, name: 'Artifact of Might', essence_cost: 1000 }, 'artifact_of_flow': { effect_type: 'idle_bonus', effect_value: 10, name: 'Artifact of Flow', essence_cost: 1000 } },
    backgrounds: {
        'bg_default': { name: 'Void Purple', cost: 0, css: 'linear-gradient(180deg, #30154D 0%, #150A24 100%)' },
        'bg_fire': { name: 'Inferno', cost: 5000, css: 'linear-gradient(180deg, #520000 0%, #8B0000 50%, #FF4500 100%)' },
        'bg_water': { name: 'Abyssal Ocean', cost: 8000, css: 'linear-gradient(180deg, #000033 0%, #004e92 100%)' },
        'bg_cyber': { name: 'Cyber City', cost: 12000, css: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)' }
    },
    bottles: {
        'bottle_default': { name: 'Standard Flask', cost: 0, path: 'M10,10 L90,10 L90,100 C90,122 72,140 50,140 C28,140 10,122 10,100 Z', corkX: 30, corkW: 40 },
        'bottle_round': { name: 'Alchemist Pot', cost: 2500, path: 'M35,10 L65,10 L65,50 C85,50 95,70 95,100 C95,125 75,145 50,145 C25,145 5,125 5,100 C5,70 15,50 35,50 Z', corkX: 35, corkW: 30 },
        'bottle_jar': { name: 'Mason Jar', cost: 6000, path: 'M20,10 L80,10 L80,140 L20,140 Z', corkX: 25, corkW: 50 },
        'bottle_tri': { name: 'Erlenmeyer', cost: 9000, path: 'M35,10 L65,10 L65,40 L90,140 L10,140 L35,40 Z', corkX: 40, corkW: 20 }
    },
    skins: {
        'skin_default': { name: 'Standard', cost: 0, color: '#222' },
        'skin_gold': { name: 'Midas Touch', cost: 5000, color: '#FFD700' },
        'skin_alien': { name: 'Martian', cost: 8000, color: '#39FF14' },
        'skin_ghost': { name: 'Poltergeist', cost: 12000, color: 'rgba(255, 255, 255, 0.5)' }
    }
};

const PIXELS_TO_ESSENCE_MULTIPLIER = 0.01; 
const PIXEL_SHAKE_ESSENCE_PER_PIXEL_BASE = 1; 

const calculateUpgradeCost = (upgradeId, currentLevel) => {
    const config = GAME_CONFIG[upgradeId];
    return config ? Math.round(config.base_cost * Math.pow(config.growth_rate, currentLevel)) : Infinity;
};
const getLevelFromEssence = (total) => 1 + Math.floor(Math.sqrt((total || 0) / GAME_CONFIG.LEVEL_SCALING_FACTOR));
const getThresholdForLevel = (level) => GAME_CONFIG.LEVEL_SCALING_FACTOR * Math.pow(level - 1, 2);

const recalculateMultipliers = (upgrades, artifactId) => {
    let basePixel = PIXEL_SHAKE_ESSENCE_PER_PIXEL_BASE + ((upgrades.shake || 0) * GAME_CONFIG.shake_power.effect_per_level);
    let baseIdle = (upgrades.brewery || 0) * GAME_CONFIG.idle_brewery.effect_per_level;
    let mult = 1.0;
    if (artifactId && GAME_CONFIG.artifacts[artifactId]) {
        const art = GAME_CONFIG.artifacts[artifactId];
        if (art.effect_type === "shake_multiplier") mult += art.effect_value;
        if (art.effect_type === "idle_bonus") baseIdle += art.effect_value;
    }
    return { essence_per_shake_click: Math.floor(1 * mult), essence_per_second: baseIdle, essence_per_pixel: basePixel * mult * PIXELS_TO_ESSENCE_MULTIPLIER };
};

const ensureUserData = async (db, userId, email = null, wallet = null) => {
    if (!db || !userId) return;
    try {
        const ref = doc(db, COLLECTION_PATH(LOCAL_APP_ID), userId);
        if ((await getDoc(ref)).exists()) return; 
        const { essence_per_shake_click, essence_per_second, essence_per_pixel } = recalculateMultipliers({ shake: 0, brewery: 0 }, null);
        await setDoc(ref, {
            userId, username: email ? email.split('@')[0] : `Player_${userId.substring(0, 6)}`, email, walletAddress: wallet,
            essence: 0, totalEssenceEarned: 0, onChainEvolutionLevel: 0, level: 1, 
            essencePerShake: essence_per_shake_click, essencePerSecond: essence_per_second, upgrades: { shake: 0, brewery: 0 }, 
            artifacts: [], equippedArtifact: null, unlockedBackgrounds: ['bg_default'], equippedBackground: 'bg_default', unlockedBottles: ['bottle_default'], equippedBottle: 'bottle_default', unlockedSkins: ['skin_default'], equippedSkin: 'skin_default',
            lastActivity: new Date().toISOString(), essencePerPixel: essence_per_pixel, 
        }, { merge: true });
    } catch (e) { console.error(e); }
};

// --- UI COMPONENTS ---

// --- NEW: INFO POPUP MODAL ---
const InfoModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;
    return (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-[80] backdrop-blur-md">
            <div className="bg-gray-900 p-6 rounded-2xl shadow-2xl border-2 border-blue-500 w-80 relative">
                <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-white text-2xl">&times;</button>
                <h4 className="text-blue-400 font-bold text-lg mb-4 text-center uppercase tracking-wider">Reward System</h4>
                
                <div className="space-y-4 text-sm text-gray-300">
                    <div>
                        <strong className="text-white block mb-1">🌀 What is Transcend?</strong>
                        <p className="opacity-80">Transcending resets your Level and Essence (Temporary Progress) to 0, but permanently adds your Score to the On-Chain Leaderboard.</p>
                    </div>
                    
                    <div>
                        <strong className="text-white block mb-1">⏳ Season Reset</strong>
                        <p className="opacity-80">Leaderboard resets every 14 days. Top players at the end of the season win real prizes.</p>
                    </div>

                    <div className="bg-black/40 p-3 rounded border border-yellow-500/20">
                        <strong className="text-yellow-400 block mb-2 text-center">🏆 Season Prize Pool</strong>
                        <div className="flex justify-between"><span>🥇 1st Place:</span> <span className="text-white font-mono">$500</span></div>
                        <div className="flex justify-between"><span>🥈 2nd Place:</span> <span className="text-white font-mono">$250</span></div>
                        <div className="flex justify-between"><span>🥉 3rd Place:</span> <span className="text-white font-mono">$100</span></div>
                    </div>
                </div>
                <button onClick={onClose} className="mt-6 w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg transition">Got it!</button>
            </div>
        </div>
    );
};

const Leaderboard = ({ leaderboardData, onClick, onInfoClick }) => {
    const topThree = useMemo(() => [...leaderboardData].sort((a, b) => ((b.level || 0) - (a.level || 0)) || ((b.totalEssenceEarned || 0) - (a.totalEssenceEarned || 0))).slice(0, 3), [leaderboardData]);
    
    return (
        <div className="absolute top-24 right-4 z-10 flex flex-col items-end">
            <div 
                onClick={onClick}
                className="w-64 bg-black/50 p-4 rounded-2xl shadow-lg border-2 border-purple-400/30 backdrop-blur-sm cursor-pointer hover:bg-black/70 transition-colors group relative"
            >
                <h3 className="text-lg font-extrabold text-yellow-400 mb-3 text-center tracking-wide flex items-center justify-center">
                    <span className="mr-2">👑</span> SHAKERS
                    {/* QUESTION MARK BUTTON - Triggers Info Modal */}
                    <button 
                        onClick={(e) => {
                            e.stopPropagation(); 
                            onInfoClick(); // Open separate modal
                        }}
                        className="ml-2 w-5 h-5 flex items-center justify-center rounded-full bg-gray-700 text-white text-xs hover:bg-blue-500 transition-colors z-50"
                    >
                        ?
                    </button>
                </h3>
                <div className="space-y-2">
                    {topThree.length === 0 ? <p className="text-gray-300 text-sm text-center">Be the first shaker!</p> : topThree.map((p, i) => (
                        <div key={p.id} className="flex items-center p-2 rounded bg-black/30"><span className="w-6 text-center font-bold text-yellow-300">#{i + 1}</span><span className="flex-1 ml-2 font-semibold text-white truncate">{p.username}</span><span className="text-purple-300 font-mono">Lv {p.level || 1}</span></div>
                    ))}
                </div>
                <div className="text-center text-yellow-500/80 text-xs mt-3 font-bold group-hover:text-yellow-300 transition-colors">CLICK TO VIEW ALL ➜</div>
            </div>
        </div>
    );
};

const LeaderboardModal = ({ isOpen, onClose, leaderboardData }) => {
    if (!isOpen) return null;
    const sorted = [...leaderboardData].sort((a, b) => ((b.level || 0) - (a.level || 0)) || ((b.totalEssenceEarned || 0) - (a.totalEssenceEarned || 0)));
    return (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-[60] backdrop-blur-md">
            <div className="bg-gray-900 p-6 rounded-2xl shadow-2xl border-2 border-yellow-500 w-full max-w-2xl h-[80vh] flex flex-col relative">
                 <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl font-bold transition-colors">&times;</button>
                 <h2 className="text-3xl font-extrabold text-yellow-400 text-center mb-6 tracking-wider flex items-center justify-center"><span className="mr-2">🏆</span> GLOBAL RANKINGS</h2>
                 <div className="flex-1 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                    <div className="grid grid-cols-12 gap-2 text-gray-400 font-bold text-xs uppercase mb-2 px-3"><div className="col-span-2 text-center">Rank</div><div className="col-span-6">Player</div><div className="col-span-2 text-center">Level</div><div className="col-span-2 text-right">Total Essence</div></div>
                    {sorted.map((p, i) => (
                        <div key={p.id} className={`grid grid-cols-12 gap-2 items-center p-3 rounded-lg transition-colors ${i < 3 ? 'bg-yellow-900/20 border border-yellow-500/30' : 'bg-gray-800/40 hover:bg-gray-700/40'}`}>
                            <div className="col-span-2 text-center font-bold text-xl">{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : <span className="text-gray-500 text-sm">#{i + 1}</span>}</div>
                            <div className="col-span-6 font-semibold text-white truncate flex items-center">{p.username} {p.onChainEvolutionLevel > 0 && <span className="ml-2 text-[10px] bg-purple-900/80 text-purple-300 px-1.5 py-0.5 rounded border border-purple-500/30" title="Transcended">⛓️ {p.onChainEvolutionLevel.toLocaleString()}</span>}</div>
                            <div className="col-span-2 text-center text-purple-300 font-mono font-bold text-sm">Lv {p.level || 1}</div>
                            <div className="col-span-2 text-right text-gray-400 text-xs font-mono">{(p.totalEssenceEarned || 0).toLocaleString()}</div>
                        </div>
                    ))}
                 </div>
            </div>
        </div>
    );
};

const FloatingText = ({ x, y, amount }) => (<span className="absolute font-extrabold text-yellow-300 text-2xl animate-float-up z-50" style={{ left: x, top: y, pointerEvents: 'none' }}>+{amount}</span>);

const ClickerBottle = ({ cursorPos, isShaking, velocityX, bottleId, skinId }) => {
    const liquidRotation = Math.max(-20, Math.min(20, velocityX * -0.4));
    const bottle = GAME_CONFIG.bottles[bottleId] || GAME_CONFIG.bottles['bottle_default'];
    const skin = GAME_CONFIG.skins[skinId] || GAME_CONFIG.skins['skin_default'];
    return (
        <div className="z-40 pointer-events-none" style={{ width: '180px', height: '280px', position: 'absolute', left: cursorPos.x, top: cursorPos.y, transform: 'translate(-50%, -50%)' }}>
            <svg viewBox="0 0 100 150" className="w-full h-full overflow-visible drop-shadow-2xl">
                <defs><clipPath id="bottle-interior"><path d={bottle.path} /></clipPath></defs>
                <path d={bottle.path} fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.4)" strokeWidth="2" />
                <g clipPath="url(#bottle-interior)">
                    <g style={{ transformOrigin: '50% 100%', transform: `rotate(${liquidRotation}deg)`, transition: 'transform 0.1s ease-out' }}>
                        <rect x="-50" y="60" width="200" height="150" fill="url(#waterGradient)" className="animate-wobble" />
                        <path d="M-50,60 Q0,50 50,60 T150,60 V150 H-50 Z" fill="rgba(64, 196, 255, 0.6)" className="animate-wave-slow" />
                        <path d="M-50,60 Q0,70 50,60 T150,60 V150 H-50 Z" fill="rgba(0, 140, 255, 0.4)" className="animate-wave-fast" />
                        <g transform="translate(50, 100)" className={isShaking ? "animate-panic" : "animate-float"}>
                            <circle cx="0" cy="-30" r="10" fill={skin.color} />
                            <line x1="0" y1="-20" x2="0" y2="10" stroke={skin.color} strokeWidth="4" strokeLinecap="round" />
                            <line x1="0" y1="-15" x2="-15" y2="-25" stroke={skin.color} strokeWidth="3" strokeLinecap="round" className={isShaking ? "limb-flail-left" : ""} />
                            <line x1="0" y1="-15" x2="15" y2="-25" stroke={skin.color} strokeWidth="3" strokeLinecap="round" className={isShaking ? "limb-flail-right" : ""} />
                            <line x1="0" y1="10" x2="-10" y2="30" stroke={skin.color} strokeWidth="3" strokeLinecap="round" className={isShaking ? "limb-kick-left" : ""} />
                            <line x1="0" y1="10" x2="10" y2="30" stroke={skin.color} strokeWidth="3" strokeLinecap="round" className={isShaking ? "limb-kick-right" : ""} />
                        </g>
                    </g>
                </g>
                <path d="M15,20 V100 C15,110 20,125 30,130" stroke="rgba(255,255,255,0.5)" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.5" />
                <rect x={bottle.corkX} y="-5" width={bottle.corkW} height="15" rx="2" fill="#8B4513" stroke="#5D2906" strokeWidth="2" />
                <linearGradient id="waterGradient" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#00C6FF" /><stop offset="100%" stopColor="#0072FF" /></linearGradient>
            </svg>
        </div>
    );
};

const BottomNav = ({ onUpgradeClick }) => (
    <div className="flex justify-around items-center w-full px-4 py-6 z-10">
        <button onClick={() => onUpgradeClick('shake')} className="flex-1 max-w-xs mx-2 bg-gradient-to-t from-yellow-600 to-yellow-400 text-gray-900 font-extrabold p-4 rounded-2xl shadow-lg border-2 border-yellow-300 transition-transform duration-200 hover:scale-105 active:scale-95"><div className="text-3xl">🖱️</div><div className="text-xl">SHAKE UPGRADES</div></button>
        <button onClick={() => onUpgradeClick('brewery')} className="flex-1 max-w-xs mx-2 bg-gradient-to-t from-purple-600 to-purple-400 text-white font-extrabold p-4 rounded-2xl shadow-lg border-2 border-purple-300 transition-transform duration-200 hover:scale-105 active:scale-95"><div className="text-3xl">⏰</div><div className="text-xl">IDLE BREWERY</div></button>
        <button onClick={() => onUpgradeClick('artifacts')} className="flex-1 max-w-xs mx-2 bg-gradient-to-t from-blue-600 to-blue-400 text-white font-extrabold p-4 rounded-2xl shadow-lg border-2 border-blue-300 transition-transform duration-200 hover:scale-105 active:scale-95"><div className="text-3xl">🔑</div><div className="text-xl">SHOP & NFTs</div></button>
    </div>
);

const UpgradeModal = ({ modalOpen, setModalOpen, userEssence, db, userId, userUpgrades, userArtifacts, equippedArtifact, unlockedBackgrounds, equippedBackground, unlockedBottles, equippedBottle, unlockedSkins, equippedSkin }) => {
    const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();
    const currentAccount = useCurrentAccount(); 
    const [txnStatus, setTxnStatus] = useState("");
    const [shopTab, setShopTab] = useState('nft');

    if (!modalOpen) return null;
    const shakeCost = calculateUpgradeCost('shake_power', userUpgrades.shake || 0);
    const breweryCost = calculateUpgradeCost('idle_brewery', userUpgrades.brewery || 0);

    const handleBuyUpgrade = async (upgradeId) => {
        if (!db || !userId) return;
        let cost = (upgradeId === 'shake') ? shakeCost : breweryCost;
        if (userEssence < cost) return alert("Not enough essence!");
        let nextUpgrades = { ...userUpgrades }; nextUpgrades[upgradeId]++;
        const { essence_per_shake_click, essence_per_second, essence_per_pixel } = recalculateMultipliers(nextUpgrades, equippedArtifact);
        try { await updateDoc(doc(db, COLLECTION_PATH(LOCAL_APP_ID), userId), { [`upgrades.${upgradeId}`]: increment(1), 'essencePerShake': essence_per_shake_click, 'essencePerSecond': essence_per_second, 'essencePerPixel': essence_per_pixel, 'essence': increment(-cost), lastActivity: new Date().toISOString() }); } catch (e) { console.error(e); }
    };
    const handleBuyArtifact = async (artifactId) => {
        if (!currentAccount) return alert("⛔ WALLET NOT CONNECTED!");
        const artifactConfig = GAME_CONFIG.artifacts[artifactId];
        const cost = artifactConfig.essence_cost || 1000;
        if (userEssence < cost) return alert(`Not enough essence! Need ${cost}.`);
        if (userArtifacts.includes(artifactId)) return alert("Already owned!");
        setTxnStatus("Check Wallet...");
        const tx = new Transaction();
        try { tx.setGasBudget(200000000); tx.moveCall({ target: `${PACKAGE_ID}::artifact::mint_artifact`, arguments: [tx.pure.string(artifactConfig.name), tx.pure.string("Legendary Item"), tx.pure.u64(artifactConfig.effect_value * 100)] }); } catch (err) { return alert("Error creating tx."); }
        signAndExecuteTransaction({ transaction: tx }, {
            onSuccess: async (result) => {
                let nextArtifacts = [...userArtifacts, artifactId];
                const { essence_per_shake_click, essence_per_second, essence_per_pixel } = recalculateMultipliers(userUpgrades, equippedArtifact);
                await updateDoc(doc(db, COLLECTION_PATH(LOCAL_APP_ID), userId), { 'artifacts': nextArtifacts, 'essencePerShake': essence_per_shake_click, 'essencePerSecond': essence_per_second, 'essencePerPixel': essence_per_pixel, 'essence': increment(-cost), lastActivity: new Date().toISOString() });
                setTxnStatus(""); alert(`Minted ${artifactConfig.name}!`);
            }, onError: (err) => { setTxnStatus(""); alert("Transaction Failed! Check Gas."); }
        });
    };
    const handleEquipToggle = async (artifactId) => {
        const newEquippedId = (equippedArtifact === artifactId) ? null : artifactId;
        const { essence_per_shake_click, essence_per_second, essence_per_pixel } = recalculateMultipliers(userUpgrades, newEquippedId);
        try { await updateDoc(doc(db, COLLECTION_PATH(LOCAL_APP_ID), userId), { equippedArtifact: newEquippedId, essencePerShake: essence_per_shake_click, essencePerSecond: essence_per_second, essencePerPixel: essence_per_pixel, lastActivity: new Date().toISOString() }); } catch (e) { console.error(e); }
    };
    const handleBuyBackground = async (bgId) => {
        const config = GAME_CONFIG.backgrounds[bgId];
        if (userEssence < config.cost) return alert("Not enough essence!");
        try { await updateDoc(doc(db, COLLECTION_PATH(LOCAL_APP_ID), userId), { unlockedBackgrounds: [...unlockedBackgrounds, bgId], essence: increment(-config.cost), lastActivity: new Date().toISOString() }); } catch(e) { console.error(e); }
    };
    const handleEquipBackground = async (bgId) => { try { await updateDoc(doc(db, COLLECTION_PATH(LOCAL_APP_ID), userId), { equippedBackground: bgId, lastActivity: new Date().toISOString() }); } catch(e) { console.error(e); } };
    const handleBuyBottle = async (bottleId) => {
        const config = GAME_CONFIG.bottles[bottleId];
        if (userEssence < config.cost) return alert("Not enough essence!");
        try { await updateDoc(doc(db, COLLECTION_PATH(LOCAL_APP_ID), userId), { unlockedBottles: [...unlockedBottles, bottleId], essence: increment(-config.cost), lastActivity: new Date().toISOString() }); } catch(e) { console.error(e); }
    };
    const handleEquipBottle = async (bottleId) => { try { await updateDoc(doc(db, COLLECTION_PATH(LOCAL_APP_ID), userId), { equippedBottle: bottleId, lastActivity: new Date().toISOString() }); } catch(e) { console.error(e); } };
    const handleBuySkin = async (skinId) => {
        const config = GAME_CONFIG.skins[skinId];
        if (userEssence < config.cost) return alert("Not enough essence!");
        try { await updateDoc(doc(db, COLLECTION_PATH(LOCAL_APP_ID), userId), { unlockedSkins: [...unlockedSkins, skinId], essence: increment(-config.cost), lastActivity: new Date().toISOString() }); } catch(e) { console.error(e); }
    };
    const handleEquipSkin = async (skinId) => { try { await updateDoc(doc(db, COLLECTION_PATH(LOCAL_APP_ID), userId), { equippedSkin: skinId, lastActivity: new Date().toISOString() }); } catch(e) { console.error(e); } };

    return (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-md">
            <div className="bg-gray-800 p-6 rounded-2xl shadow-2xl border-2 border-purple-500 w-full max-w-lg relative">
                <button onClick={() => setModalOpen(null)} className="absolute top-3 right-3 text-gray-400 hover:text-white text-3xl">&times;</button>
                <h2 className="text-3xl font-bold text-white text-center mb-6">{modalOpen === 'shake' ? 'Shake Upgrades' : modalOpen === 'brewery' ? 'Idle Brewery' : 'Item Shop'}</h2>
                {modalOpen === 'artifacts' && (
                    <div className="flex justify-center mb-4 space-x-2 flex-wrap gap-y-2">
                        <button onClick={() => setShopTab('nft')} className={`px-3 py-1 rounded font-bold text-sm ${shopTab === 'nft' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400'}`}>NFTs</button>
                        <button onClick={() => setShopTab('bg')} className={`px-3 py-1 rounded font-bold text-sm ${shopTab === 'bg' ? 'bg-pink-600 text-white' : 'bg-gray-700 text-gray-400'}`}>Backgrounds</button>
                        <button onClick={() => setShopTab('bottle')} className={`px-3 py-1 rounded font-bold text-sm ${shopTab === 'bottle' ? 'bg-orange-600 text-white' : 'bg-gray-700 text-gray-400'}`}>Bottles</button>
                        <button onClick={() => setShopTab('skin')} className={`px-3 py-1 rounded font-bold text-sm ${shopTab === 'skin' ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-400'}`}>Skins</button>
                    </div>
                )}
                {txnStatus && <div className="mb-4 p-2 bg-blue-900 text-blue-200 text-center rounded border border-blue-500 font-bold">{txnStatus}</div>}
                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                    {modalOpen === 'shake' && (<button onClick={() => handleBuyUpgrade('shake')} disabled={userEssence < shakeCost} className="w-full flex justify-between items-center p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition disabled:opacity-50"><span><span className="font-bold text-white">Potent Shake</span><span className="text-sm text-gray-400 block">+1 Essence/Pixel (Lvl {userUpgrades.shake})</span></span><span className="font-bold text-yellow-500">Cost: {shakeCost}</span></button>)}
                    {modalOpen === 'brewery' && (<button onClick={() => handleBuyUpgrade('brewery')} disabled={userEssence < breweryCost} className="w-full flex justify-between items-center p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition disabled:opacity-50"><span><span className="font-bold text-white">Auto-Brewer</span><span className="text-sm text-gray-400 block">+{GAME_CONFIG.idle_brewery.effect_per_level} EPS (Lvl {userUpgrades.brewery})</span></span><span className="font-bold text-yellow-500">Cost: {breweryCost}</span></button>)}
                    
                    {modalOpen === 'artifacts' && shopTab === 'nft' && (<div className="space-y-2">{Object.entries(GAME_CONFIG.artifacts).map(([id, artifact]) => { const isOwned = userArtifacts.includes(id); const isEquipped = equippedArtifact === id; return (<div key={id} className={`w-full flex justify-between items-center p-4 rounded-lg transition border-2 ${isEquipped ? 'bg-green-900/40 border-green-500' : 'bg-blue-900/40 border-blue-500/30'}`}><span><span className="font-bold text-white">{artifact.name}</span><span className="text-sm text-gray-400 block">{artifact.effect_type === 'shake_multiplier' ? `+${artifact.effect_value * 100}% Shake Power` : `+${artifact.effect_value} Idle Essence`}</span></span>{isOwned ? (<button onClick={() => handleEquipToggle(id)} className={`px-4 py-2 rounded font-bold text-sm shadow-lg transition-transform active:scale-95 ${isEquipped ? 'bg-red-600 hover:bg-red-500 text-white' : 'bg-green-600 hover:bg-green-500 text-white'}`}>{isEquipped ? 'UNEQUIP' : 'EQUIP'}</button>) : (<div className="flex flex-col items-end"><span className="font-bold text-yellow-500 mb-1">Cost: {artifact.essence_cost}</span><button onClick={() => handleBuyArtifact(id)} className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded text-xs font-bold">MINT</button></div>)}</div>)})}</div>)}
                    {modalOpen === 'artifacts' && shopTab === 'bg' && (<div className="space-y-2">{Object.entries(GAME_CONFIG.backgrounds).map(([id, bg]) => { const isOwned = unlockedBackgrounds.includes(id); const isEquipped = equippedBackground === id; return (<div key={id} className={`w-full flex justify-between items-center p-4 rounded-lg transition border-2 ${isEquipped ? 'bg-pink-900/40 border-pink-500' : 'bg-gray-700/40 border-gray-500/30'}`}><div><span className="font-bold text-white block">{bg.name}</span><div className="w-24 h-6 mt-1 rounded border border-white/20" style={{ background: bg.css }}></div></div>{isOwned ? (<button onClick={() => handleEquipBackground(id)} disabled={isEquipped} className={`px-4 py-2 rounded font-bold text-sm shadow-lg transition-transform active:scale-95 ${isEquipped ? 'bg-gray-500 text-white cursor-default' : 'bg-pink-600 hover:bg-pink-500 text-white'}`}>{isEquipped ? 'EQUIPPED' : 'EQUIP'}</button>) : (<div className="flex flex-col items-end"><span className="font-bold text-yellow-500 mb-1">Cost: {bg.cost}</span><button onClick={() => handleBuyBackground(id)} className="bg-yellow-600 hover:bg-yellow-500 text-black px-3 py-1 rounded text-xs font-bold">BUY</button></div>)}</div>)})}</div>)}
                    {modalOpen === 'artifacts' && shopTab === 'bottle' && (<div className="space-y-2">{Object.entries(GAME_CONFIG.bottles).map(([id, item]) => { const isOwned = unlockedBottles.includes(id); const isEquipped = equippedBottle === id; return (<div key={id} className={`w-full flex justify-between items-center p-4 rounded-lg transition border-2 ${isEquipped ? 'bg-orange-900/40 border-orange-500' : 'bg-gray-700/40 border-gray-500/30'}`}><div><span className="font-bold text-white block">{item.name}</span><span className="text-xs text-gray-400">Unique shape</span></div>{isOwned ? (<button onClick={() => handleEquipBottle(id)} disabled={isEquipped} className={`px-4 py-2 rounded font-bold text-sm shadow-lg transition-transform active:scale-95 ${isEquipped ? 'bg-gray-500 text-white cursor-default' : 'bg-orange-600 hover:bg-orange-500 text-white'}`}>{isEquipped ? 'EQUIPPED' : 'EQUIP'}</button>) : (<div className="flex flex-col items-end"><span className="font-bold text-yellow-500 mb-1">Cost: {item.cost}</span><button onClick={() => handleBuyBottle(id)} className="bg-yellow-600 hover:bg-yellow-500 text-black px-3 py-1 rounded text-xs font-bold">BUY</button></div>)}</div>)})}</div>)}
                    {modalOpen === 'artifacts' && shopTab === 'skin' && (<div className="space-y-2">{Object.entries(GAME_CONFIG.skins).map(([id, item]) => { const isOwned = unlockedSkins.includes(id); const isEquipped = equippedSkin === id; return (<div key={id} className={`w-full flex justify-between items-center p-4 rounded-lg transition border-2 ${isEquipped ? 'bg-green-900/40 border-green-500' : 'bg-gray-700/40 border-gray-500/30'}`}><div><span className="font-bold text-white block">{item.name}</span><div className="w-6 h-6 mt-1 rounded-full border border-white/20" style={{ background: item.color }}></div></div>{isOwned ? (<button onClick={() => handleEquipSkin(id)} disabled={isEquipped} className={`px-4 py-2 rounded font-bold text-sm shadow-lg transition-transform active:scale-95 ${isEquipped ? 'bg-gray-500 text-white cursor-default' : 'bg-green-600 hover:bg-green-500 text-white'}`}>{isEquipped ? 'EQUIPPED' : 'EQUIP'}</button>) : (<div className="flex flex-col items-end"><span className="font-bold text-yellow-500 mb-1">Cost: {item.cost}</span><button onClick={() => handleBuySkin(id)} className="bg-yellow-600 hover:bg-yellow-500 text-black px-3 py-1 rounded text-xs font-bold">BUY</button></div>)}</div>)})}</div>)}
                </div>
            </div>
        </div>
    );
};

// --- MAIN APP COMPONENT ---
const App = () => {
    const [db, setDb] = useState(null);
    const [auth, setAuth] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();
    const currentAccount = useCurrentAccount();

    const [appState, setAppState] = useState('LOADING'); 
    const [leaderboard, setLeaderboard] = useState([]);
    const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false); 
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false); // NEW STATE FOR INFO MODAL

    const [userEssence, setUserEssence] = useState(0);
    const [userLevel, setUserLevel] = useState(1);
    const [totalEssenceEarned, setTotalEssenceEarned] = useState(0); 
    const [onChainEvolutionLevel, setOnChainEvolutionLevel] = useState(0); 
    const [userUpgrades, setUserUpgrades] = useState({ shake: 0, brewery: 0 });
    const [userArtifacts, setUserArtifacts] = useState([]);
    const [equippedArtifact, setEquippedArtifact] = useState(null); 
    const [unlockedBackgrounds, setUnlockedBackgrounds] = useState(['bg_default']);
    const [equippedBackground, setEquippedBackground] = useState('bg_default');
    const [unlockedBottles, setUnlockedBottles] = useState(['bottle_default']);
    const [equippedBottle, setEquippedBottle] = useState('bottle_default');
    const [unlockedSkins, setUnlockedSkins] = useState(['skin_default']);
    const [equippedSkin, setEquippedSkin] = useState('skin_default');
    
    const [essencePerSecond, setEssencePerSecond] = useState(0);
    const [essencePerPixel, setEssencePerPixel] = useState(0); 
    const [modalOpen, setModalOpen] = useState(null);
    
    const [cursorPos, setCursorPos] = useState({ x: -200, y: -200 }); 
    const [isShaking, setIsShaking] = useState(false);
    const [velocityX, setVelocityX] = useState(0);

    const [clickText, setClickText] = useState(null); 
    const lastMouseX = useRef(0); const lastMouseY = useRef(0); const pixelsMoved = useRef(0); const shakeTimeoutRef = useRef(null);

    const currentLevelThreshold = useMemo(() => getThresholdForLevel(userLevel), [userLevel]);
    const nextLevelThreshold = useMemo(() => getThresholdForLevel(userLevel + 1), [userLevel]);
    const progressPercent = useMemo(() => {
        if (totalEssenceEarned < currentLevelThreshold) return 0;
        const gap = nextLevelThreshold - currentLevelThreshold;
        return Math.min(100, Math.max(0, ((totalEssenceEarned - currentLevelThreshold) / gap) * 100));
    }, [totalEssenceEarned, currentLevelThreshold, nextLevelThreshold]);

    useEffect(() => {
        try {
            const app = initializeApp(firebaseConfig);
            setDb(getFirestore(app));
            setAuth(getAuth(app));
            onAuthStateChanged(getAuth(app), (user) => {
                if (user) { setCurrentUser(user); setAppState('GAME'); }
                else { setCurrentUser(null); setAppState('AUTH'); }
            });
        } catch (e) { console.error("Firebase Init Error:", e); }
    }, []);

    const handleLogin = async (e, p) => { try { await signInWithEmailAndPassword(auth, e, p); return { success: true }; } catch(err) { return { error: err }; }};
    const handleSignup = async (e, p) => { try { const c = await createUserWithEmailAndPassword(auth, e, p); await ensureUserData(db, c.user.uid, c.user.email); return { success: true }; } catch(err) { return { error: err }; }};
    const handleGoogleLogin = async () => { try { const r = await signInWithPopup(auth, new GoogleAuthProvider()); await ensureUserData(db, r.user.uid, r.user.email); return { success: true }; } catch(err) { return { error: err }; }};
    const handleSignOut = async () => { if (auth) await signOut(auth); };

    useEffect(() => {
        if (appState !== 'GAME' || !db || !currentUser) return;
        const unsubscribe = onSnapshot(doc(db, COLLECTION_PATH(LOCAL_APP_ID), currentUser.uid), (doc) => {
            if (doc.exists()) {
                const data = doc.data();
                setUserEssence(data.essence || 0);
                setUserLevel(getLevelFromEssence(data.totalEssenceEarned || 0)); 
                setTotalEssenceEarned(data.totalEssenceEarned || 0);
                setOnChainEvolutionLevel(data.onChainEvolutionLevel || 0);
                setUserUpgrades(data.upgrades || { shake: 0, brewery: 0 });
                setUserArtifacts(data.artifacts || []);
                setEquippedArtifact(data.equippedArtifact || null); 
                setUnlockedBackgrounds(data.unlockedBackgrounds || ['bg_default']);
                setEquippedBackground(data.equippedBackground || 'bg_default');
                setUnlockedBottles(data.unlockedBottles || ['bottle_default']);
                setEquippedBottle(data.equippedBottle || 'bottle_default');
                setUnlockedSkins(data.unlockedSkins || ['skin_default']);
                setEquippedSkin(data.equippedSkin || 'skin_default');

                const { essence_per_second, essence_per_pixel } = recalculateMultipliers(data.upgrades || {}, data.equippedArtifact || null);
                setEssencePerSecond(essence_per_second);
                setEssencePerPixel(essence_per_pixel);
            } else { ensureUserData(db, currentUser.uid, currentUser.email); }
        });
        return () => unsubscribe();
    }, [appState, db, currentUser]); 

    useEffect(() => {
        if (appState !== 'GAME' || !db) return;
        const unsubscribe = onSnapshot(collection(db, COLLECTION_PATH(LOCAL_APP_ID)), (snap) => setLeaderboard(snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))));
        return () => unsubscribe();
    }, [appState, db]);

    useEffect(() => {
        if (appState !== 'GAME' || !db || !currentUser || essencePerSecond === 0) return;
        const interval = setInterval(async () => {
            try { await updateDoc(doc(db, COLLECTION_PATH(LOCAL_APP_ID), currentUser.uid), { essence: increment(essencePerSecond * 2), totalEssenceEarned: increment(essencePerSecond * 2), lastActivity: new Date().toISOString() }); } catch (e) { console.error(e); }
        }, 2000); 
        return () => clearInterval(interval);
    }, [appState, db, currentUser, essencePerSecond]); 

    const handleGlobalMouseMove = (event) => {
        if (appState !== 'GAME') return;
        const { clientX: x, clientY: y } = event;
        setCursorPos({ x, y });
        setVelocityX(x - lastMouseX.current); 
        if (essencePerPixel <= 0) return; 
        if (!shakeTimeoutRef.current) { setIsShaking(true); shakeTimeoutRef.current = setTimeout(() => { setIsShaking(false); shakeTimeoutRef.current = null; }, 200); }
        if (lastMouseX.current === 0) { lastMouseX.current = x; lastMouseY.current = y; return; }
        const dist = Math.sqrt(Math.pow(x - lastMouseX.current, 2) + Math.pow(y - lastMouseY.current, 2));
        pixelsMoved.current += dist; 
        lastMouseX.current = x; lastMouseY.current = y;
        if (pixelsMoved.current >= 100) {
            const earned = Math.floor(pixelsMoved.current * essencePerPixel);
            if (earned > 0) {
                 updateDoc(doc(db, COLLECTION_PATH(LOCAL_APP_ID), currentUser.uid), { essence: increment(earned), totalEssenceEarned: increment(earned), lastActivity: new Date().toISOString() }).catch(e => console.error(e));
                setClickText({ id: Date.now(), x: x - 15, y: y - 40, amount: earned }); setTimeout(() => setClickText(null), 1000); 
            }
            pixelsMoved.current = 0; 
        }
    };
    
    const handleTranscend = async () => {
        if (!db || !currentUser) return;
        if (!currentAccount) return alert("Connect Wallet First!");
        const evolutionScore = totalEssenceEarned; 
        if (evolutionScore < GAME_CONFIG.transcend_requirement) return alert(`Need ${GAME_CONFIG.transcend_requirement} essence!`);
        if (!window.confirm(`Transcend?`)) return;
        const tx = new Transaction();
        tx.moveCall({ target: `${PACKAGE_ID}::leaderboard::submit_score`, arguments: [tx.object(LEADERBOARD_ID), tx.pure.string(currentUser.email ? currentUser.email.split('@')[0] : "Unknown"), tx.pure.u64(evolutionScore)] });
        signAndExecuteTransaction({ transaction: tx }, {
            onSuccess: async (result) => {
                try {
                    const batch = writeBatch(db);
                    const userRef = doc(db, COLLECTION_PATH(LOCAL_APP_ID), currentUser.uid);
                    batch.update(userRef, { essence: 0, totalEssenceEarned: 0, level: 1, 'upgrades.shake': 0, 'upgrades.brewery': 0, equippedArtifact: null, lastActivity: new Date().toISOString() });
                    batch.update(userRef, { onChainEvolutionLevel: increment(evolutionScore) });
                    await batch.commit();
                    alert("Transcendence Successful!");
                } catch (e) { console.error(e); }
            }, onError: (err) => { alert("Transcend Failed."); }
        });
    };
    
    if (appState === 'LOADING') return <div className="flex items-center justify-center h-screen bg-gray-900 text-yellow-400">Loading...</div>;
    if (appState === 'AUTH' || !currentUser) return <AuthForm onLoginSubmit={handleLogin} onSignupSubmit={handleSignup} onGoogleLogin={handleGoogleLogin} />;
    
    const currentBgCss = GAME_CONFIG.backgrounds[equippedBackground] ? GAME_CONFIG.backgrounds[equippedBackground].css : GAME_CONFIG.backgrounds['bg_default'].css;

    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-between text-white font-sans overflow-hidden relative" style={{ background: currentBgCss, transition: 'background 1s ease-in-out', cursor: 'none' }} onMouseMove={handleGlobalMouseMove}>
            <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet" />
            <style>{`@keyframes wave{0%{transform:translateX(0)}100%{transform:translateX(-100px)}}.animate-wave-slow{animation:wave 3s linear infinite}.animate-wave-fast{animation:wave 2s linear infinite}@keyframes float{0%,100%{transform:translate(50px,100px)}50%{transform:translate(50px,90px)}}.animate-float{animation:float 3s ease-in-out infinite}@keyframes panic{0%{transform:translate(50px,100px) rotate(0)}25%{transform:translate(40px,95px) rotate(-10deg)}75%{transform:translate(60px,105px) rotate(10deg)}100%{transform:translate(50px,100px) rotate(0)}}.animate-panic{animation:panic 0.2s linear infinite}@keyframes flail-left{0%{transform:rotate(0)}100%{transform:rotate(40deg)}}@keyframes flail-right{0%{transform:rotate(0)}100%{transform:rotate(-40deg)}}.limb-flail-left{animation:flail-left 0.1s alternate infinite;transform-origin:0 -20px}.limb-flail-right{animation:flail-right 0.1s alternate infinite;transform-origin:0 -20px}.limb-kick-left{animation:flail-left 0.15s alternate infinite;transform-origin:0 10px}.limb-kick-right{animation:flail-right 0.15s alternate infinite;transform-origin:0 10px}.animate-float-up{animation:float-up 1s ease-out forwards}@keyframes float-up{0%{opacity:1;transform:translateY(0)}100%{opacity:0;transform:translateY(-50px)}}.custom-scrollbar::-webkit-scrollbar{width:8px}.custom-scrollbar::-webkit-scrollbar-track{background:rgba(0,0,0,0.3)}.custom-scrollbar::-webkit-scrollbar-thumb{background:rgba(255,215,0,0.3);border-radius:4px}`}</style>
            
            <h1 className="text-6xl font-extrabold text-white mt-8 z-10" style={{ textShadow: '0 4px 12px rgba(250, 204, 21, 0.5)' }}>STICKMAN SHAKE!</h1>
            
            <div className="absolute top-4 right-4 z-20"><ConnectButton /></div>
            
            <Leaderboard leaderboardData={leaderboard} onClick={() => setIsLeaderboardOpen(true)} onInfoClick={() => setIsInfoModalOpen(true)} />
            <LeaderboardModal isOpen={isLeaderboardOpen} onClose={() => setIsLeaderboardOpen(false)} leaderboardData={leaderboard} />
            <InfoModal isOpen={isInfoModalOpen} onClose={() => setIsInfoModalOpen(false)} />

            <div className="absolute top-24 left-4 w-40 text-center z-10">
                <p className="text-sm font-bold text-gray-300 mb-2">EVOLUTION</p>
                <p className="text-lg font-bold text-white mb-2">LEVEL {userLevel}</p>
                <div className="w-8 h-64 bg-black/30 rounded-full mx-auto border-2 border-purple-400/30 overflow-hidden relative group">
                     <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 text-[10px] text-white font-mono pointer-events-none">{Math.floor(progressPercent)}%</div>
                    <div className="w-full bg-gradient-to-t from-purple-500 to-pink-500 transition-all duration-500 absolute bottom-0" style={{ height: `${progressPercent}%` }}></div>
                </div>
                <div className="mt-4 space-y-1 bg-black/40 p-2 rounded-lg border border-purple-500/20 backdrop-blur-sm">
                    <p className="text-sm text-yellow-400 font-bold drop-shadow-md">{userEssence.toLocaleString()} <span className="text-[10px] text-yellow-200/70 font-normal">Essence</span></p>
                    <div className="h-px w-full bg-purple-500/30 my-1"></div>
                    <div className="flex justify-between items-center text-xs"><span className="text-blue-300" title="Essence per Pixel moved">🖱️/px</span><span className="text-white font-mono">{essencePerPixel.toFixed(2)}</span></div>
                    <div className="flex justify-between items-center text-xs"><span className="text-green-300" title="Essence per Second (Idle)">⏰/sec</span><span className="text-white font-mono">{essencePerSecond.toFixed(1)}</span></div>
                    <div className="h-px w-full bg-purple-500/30 my-1"></div>
                    <div className="text-[10px] text-gray-400 space-y-0.5 text-left px-1"><p>Total: <span className="text-gray-300 float-right">{totalEssenceEarned.toLocaleString()}</span></p><p>On-Chain: <span className="text-purple-300 float-right">{onChainEvolutionLevel.toLocaleString()}</span></p></div>
                </div>
            </div>
            
            <button onClick={handleTranscend} disabled={totalEssenceEarned < GAME_CONFIG.transcend_requirement} className="absolute bottom-40 right-4 w-64 h-24 bg-gray-800/80 rounded-2xl p-4 text-center border-2 border-purple-400/30 backdrop-blur-sm z-10 transition disabled:opacity-50 hover:bg-gray-700/80">
                <p className="text-xl font-bold text-white">TRANSCEND!</p><p className="text-xs text-yellow-400 font-bold">REQ: {GAME_CONFIG.transcend_requirement}</p>
            </button>

            <div className="relative flex-1 flex items-center justify-center min-h-[400px]"></div>
            
            <ClickerBottle cursorPos={cursorPos} isShaking={isShaking} velocityX={velocityX} bottleId={equippedBottle} skinId={equippedSkin} />
            
            {clickText && <FloatingText key={clickText.id} x={clickText.x} y={clickText.y} amount={clickText.amount} />}
            <BottomNav onUpgradeClick={(modal) => setModalOpen(modal)} />
            <UpgradeModal 
                modalOpen={modalOpen} 
                setModalOpen={setModalOpen} 
                userEssence={userEssence} 
                db={db} 
                userId={currentUser?.uid} 
                userUpgrades={userUpgrades} 
                userArtifacts={userArtifacts} 
                equippedArtifact={equippedArtifact} 
                unlockedBackgrounds={unlockedBackgrounds} 
                equippedBackground={equippedBackground}
                unlockedBottles={unlockedBottles}
                equippedBottle={equippedBottle}
                unlockedSkins={unlockedSkins}
                equippedSkin={equippedSkin}
            />
            <button onClick={handleSignOut} className="absolute bottom-4 left-4 bg-red-600 text-white text-xs font-bold py-1 px-3 rounded-lg shadow-lg z-10">Sign Out</button>
        </div>
    );
};

export default App;