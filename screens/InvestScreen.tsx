
import React, { useState, useContext, useMemo, useEffect } from 'react';
import { GameContext } from '../contexts/GameContext';
import { formatCurrency, formatCompact } from '../utils/formatters';
import { AreaChart, Area, Tooltip, ResponsiveContainer, YAxis, XAxis, CartesianGrid } from 'recharts';
import Icon from '../components/Icon';
import { Stock, Crypto, Car } from '../types';

type InvestTab = 'stocks' | 'estate' | 'crypto' | 'cars';
type SortBy = 'name' | 'price' | 'change' | 'cap';
type SortOrder = 'asc' | 'desc';

// --- Constants & Helpers ---

const MARKET_NEWS = [
    "BREAKING: Federal Reserve hints at interest rate cuts later this year.",
    "TECH: AI sector rallies as major breakthroughs announced in quantum computing.",
    "CRYPTO: Bitcoin surges past key resistance levels on institutional demand.",
    "ENERGY: Oil prices stabilize following OPEC+ meeting outcome.",
    "AUTO: Electric Vehicle sales hit all-time high in Asian markets.",
    "RETAIL: Consumer confidence index rises unexpectedly in Q3.",
    "HOUSING: Real Estate market cools down as mortgage rates fluctuate.",
    "FINANCE: Major banks report record profits despite global uncertainty.",
    "LOGISTICS: Global supply chain disruptions ease, boosting manufacturing.",
    "PHARMA: Biotech stocks volatile after new drug trial results."
];

const NewsTicker = () => {
    return (
        <div className="bg-blue-950/30 border-y border-blue-500/10 py-2 overflow-hidden relative mb-2">
             <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-gray-950 to-transparent z-10"></div>
             <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-gray-950 to-transparent z-10"></div>
             <div className="flex animate-marquee whitespace-nowrap">
                {MARKET_NEWS.map((news, i) => (
                    <span key={i} className="text-xs font-mono text-blue-300 mx-8 flex items-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-2 animate-pulse"></span>
                        {news}
                    </span>
                ))}
                {/* Duplicate for seamless loop */}
                {MARKET_NEWS.map((news, i) => (
                    <span key={`dup-${i}`} className="text-xs font-mono text-blue-300 mx-8 flex items-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-2 animate-pulse"></span>
                        {news}
                    </span>
                ))}
             </div>
        </div>
    );
};

// Simple SVG Sparkline Component for Lists
const Sparkline = ({ data, color, width = 60, height = 20 }: { data: number[], color: string, width?: number, height?: number }) => {
    if (!data || data.length < 2) return <div style={{ width, height }} />;
    
    // Take last 20 points for sparkline to match visual relevance
    const recentData = data.slice(-20);
    const min = Math.min(...recentData);
    const max = Math.max(...recentData);
    const range = max - min || 1;

    const points = recentData.map((d, i) => {
        const x = (i / (recentData.length - 1)) * width;
        const y = height - ((d - min) / range) * height; // Invert Y because SVG 0 is top
        return `${x},${y}`;
    }).join(' ');

    return (
        <svg width={width} height={height} className="overflow-visible opacity-80">
            <polyline 
                points={points} 
                fill="none" 
                stroke={color} 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
            />
        </svg>
    );
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-gray-900/90 p-3 border border-gray-700 rounded-lg shadow-xl backdrop-blur-md z-50">
         <p className="text-gray-500 text-[10px] mb-1 font-mono uppercase">
            {new Date(data.time).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour12: true })}
        </p>
        <p className="text-gray-400 text-xs mb-0.5">Price</p>
        <p className="text-white font-bold text-lg font-mono">{formatCurrency(payload[0].value)}</p>
      </div>
    );
  }
  return null;
};

const PriceChange = ({ history, price }: { history: number[], price: number }) => {
    if (history.length < 2) return null;
    const previousPrice = history[history.length - 2];
    const change = price - previousPrice;
    const percentageChange = (change / previousPrice) * 100;
    const color = change >= 0 ? 'text-green-400' : 'text-red-400';
    const icon = change >= 0 ? 'fa-caret-up' : 'fa-caret-down';

    return (
        <span className={`flex items-center justify-end text-xs font-mono ${color} font-bold`}>
            <Icon iconName={icon} className="mr-1" />
            {percentageChange.toFixed(2)}%
        </span>
    );
};

const AssetChart = ({ history, color, height }: { history: number[], color: string, height: number }) => {
    const data = useMemo(() => {
        const now = Date.now();
        return history.map((price, index) => {
            const timeDiff = (history.length - 1 - index) * 10000;
            return {
                time: now - timeDiff,
                price: price
            };
        });
    }, [history]);

    if (data.length < 2) {
        return (
            <div style={{ height: `${height}px` }} className="w-full bg-black/20 rounded-md flex items-center justify-center">
                <p className="text-gray-500 text-xs">Waiting for market data...</p>
            </div>
        );
    }

    const prices = data.map(d => d.price);
    const dataMin = Math.min(...prices);
    const dataMax = Math.max(...prices);
    const range = dataMax - dataMin;
    const padding = range * 0.05; // 5% padding

    return (
        <div style={{ height: `${height}px` }} className="w-full bg-[#0d1117] rounded-xl overflow-hidden border border-gray-800 shadow-inner relative">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id={`gradient-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                            <stop offset="95%" stopColor={color} stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#30363d" opacity={0.2} />
                    <XAxis 
                        dataKey="time" 
                        hide={false}
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#4b5563', fontSize: 9 }}
                        tickFormatter={(time) => new Date(time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata', hour12: false })}
                        minTickGap={40}
                        height={20}
                        dy={5}
                    />
                    <YAxis 
                        dataKey="price" 
                        hide={false}
                        orientation="right"
                        domain={[dataMin - padding, dataMax + padding]}
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#4b5563', fontSize: 9 }}
                        tickFormatter={(val) => val >= 1000 ? (val/1000).toFixed(1) + 'k' : val.toFixed(1)}
                        width={35}
                    />
                    <Tooltip
                        content={<CustomTooltip />}
                        cursor={{ stroke: 'rgba(255, 255, 255, 0.1)', strokeWidth: 1 }}
                    />
                    <Area 
                        type="monotone" 
                        dataKey="price" 
                        stroke={color} 
                        strokeWidth={2} 
                        fillOpacity={1} 
                        fill={`url(#gradient-${color.replace('#', '')})`} 
                        isAnimationActive={false} 
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

interface AssetDetailModalProps {
    asset: Stock | Crypto;
    type: 'stock' | 'crypto';
    balance: number;
    owned: number;
    availableSupply?: number;
    onClose: () => void;
    onBuy: (amount: number) => void;
    onSell: (amount: number) => void;
}

const AssetDetailModal: React.FC<AssetDetailModalProps> = ({ asset, type, balance, owned, availableSupply, onClose, onBuy, onSell }) => {
    const isUp = asset.history.length < 2 ? true : asset.price >= asset.history[asset.history.length - 2];
    const chartColor = isUp ? '#4ade80' : '#ef4444';
    
    // Trading Logic State
    const [tradeMode, setTradeMode] = useState<'buy' | 'sell'>('buy');
    const [percentage, setPercentage] = useState(0);

    // Calculate Max Limits
    const maxAffordable = Math.floor(balance / asset.price);
    // For stocks, also limit by supply. For crypto, supply is effectively infinite here (or handled elsewhere).
    const maxBuyLimit = availableSupply !== undefined ? Math.min(maxAffordable, availableSupply) : maxAffordable;
    
    const maxSellLimit = owned;

    const currentMax = tradeMode === 'buy' ? maxBuyLimit : maxSellLimit;
    
    // Calculate Amount based on percentage
    // For Stocks: integer amount. For Crypto: allows decimals.
    const amount = useMemo(() => {
        if (currentMax <= 0) return 0;
        const val = (currentMax * percentage) / 100;
        return type === 'stock' ? Math.floor(val) : val;
    }, [currentMax, percentage, type]);

    const totalValue = amount * asset.price;
    const estimatedBalance = tradeMode === 'buy' ? balance - totalValue : balance + totalValue;

    const handleTransaction = () => {
        if (amount <= 0) return;
        if (tradeMode === 'buy') {
            onBuy(amount);
        } else {
            onSell(amount);
        }
        setPercentage(0); // Reset after trade
    };

    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-end sm:items-center justify-center animate-fade-in backdrop-blur-sm" onClick={onClose}>
            <div className="bg-[#161b22] w-full sm:max-w-md max-h-[95vh] sm:h-auto overflow-y-auto rounded-t-3xl sm:rounded-3xl shadow-2xl p-6 pb-8 animate-slide-in border-t border-gray-700 ring-1 ring-white/10" onClick={e => e.stopPropagation()}>
                
                <div className="w-12 h-1 bg-gray-700 rounded-full mx-auto mb-6 sm:hidden opacity-50"></div>

                {/* Header */}
                <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center space-x-4">
                         {type === 'stock' ? (
                            <img 
                                src={`https://logo.clearbit.com/${(asset as Stock).domain}`} 
                                onError={(e) => {e.currentTarget.src = `https://ui-avatars.com/api/?name=${asset.name}&background=random`}}
                                className="w-12 h-12 rounded-full bg-white p-1" 
                                alt={asset.name} 
                                loading="lazy"
                            />
                         ) : (
                             <img src={(asset as Crypto).logoUrl} className="w-12 h-12 rounded-full" alt={asset.name} loading="lazy" />
                         )}
                        <div>
                            <h2 className="text-xl font-bold text-white tracking-tight">{asset.name}</h2>
                            <div className="flex items-center space-x-2">
                                 <span className="font-mono text-lg text-gray-200">{formatCurrency(asset.price)}</span>
                                 <PriceChange history={asset.history} price={asset.price} />
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} className="bg-gray-800 hover:bg-gray-700 text-white rounded-full p-2 transition-colors">
                        <Icon iconName="fa-xmark" className="text-lg w-5 h-5 flex items-center justify-center" />
                    </button>
                </div>
                
                <AssetChart history={asset.history} color={chartColor} height={180} />
                
                {/* Stats Row */}
                <div className="flex justify-between mt-4 mb-6 bg-gray-800/40 p-3 rounded-xl border border-white/5">
                    <div>
                        <p className="text-gray-500 text-[10px] uppercase">Your Position</p>
                        <p className="text-white font-bold">{type === 'stock' ? formatCompact(owned) : owned.toFixed(4)}</p>
                    </div>
                    <div className="text-right">
                         <p className="text-gray-500 text-[10px] uppercase">Equity Value</p>
                         <p className="text-blue-400 font-bold">{formatCompact(owned * asset.price)}</p>
                    </div>
                </div>

                {/* Trading Interface */}
                <div className="bg-gray-800/50 rounded-2xl p-4 border border-white/5">
                    
                    {/* Tabs */}
                    <div className="flex p-1 bg-gray-900 rounded-xl mb-6">
                        <button 
                            onClick={() => setTradeMode('buy')}
                            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${tradeMode === 'buy' ? 'bg-green-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            BUY
                        </button>
                        <button 
                            onClick={() => setTradeMode('sell')}
                            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${tradeMode === 'sell' ? 'bg-red-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            SELL
                        </button>
                    </div>

                    {/* Quantity Slider Control */}
                    <div className="mb-6">
                         <div className="flex justify-between text-xs mb-2">
                             <span className="text-gray-400">Amount: <span className="text-white font-mono font-bold">{type === 'stock' ? Math.floor(amount) : amount.toFixed(4)}</span></span>
                             <span className="text-gray-500">{percentage.toFixed(0)}%</span>
                         </div>
                         <input 
                            type="range" 
                            min="0" 
                            max="100" 
                            value={percentage} 
                            onChange={(e) => setPercentage(parseFloat(e.target.value))}
                            className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${tradeMode === 'buy' ? 'bg-green-900/40 accent-green-500' : 'bg-red-900/40 accent-red-500'}`}
                        />
                        <div className="flex justify-between mt-3 gap-2">
                            {[0, 25, 50, 75, 100].map(pct => (
                                <button 
                                    key={pct} 
                                    onClick={() => setPercentage(pct)}
                                    className="flex-1 bg-gray-700/50 hover:bg-gray-700 text-[10px] text-gray-300 py-1.5 rounded-md font-bold transition-colors"
                                >
                                    {pct === 100 ? 'MAX' : `${pct}%`}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Transaction Summary */}
                    <div className="space-y-2 mb-4 text-sm">
                        <div className="flex justify-between">
                             <span className="text-gray-400">Est. Total</span>
                             <span className={`font-mono font-bold ${tradeMode === 'buy' ? 'text-red-400' : 'text-green-400'}`}>
                                {tradeMode === 'buy' ? '-' : '+'}{formatCurrency(totalValue)}
                             </span>
                        </div>
                        <div className="flex justify-between pt-2 border-t border-gray-700/50">
                             <span className="text-gray-400">Balance After</span>
                             <span className="font-mono text-gray-300">{formatCurrency(estimatedBalance)}</span>
                        </div>
                    </div>

                    {/* Action Button */}
                    <button 
                        onClick={handleTransaction}
                        disabled={amount <= 0}
                        className={`w-full py-2 rounded-xl font-bold text-sm shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
                            tradeMode === 'buy' 
                            ? 'bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white shadow-green-900/30' 
                            : 'bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white shadow-red-900/30'
                        }`}
                    >
                        {tradeMode === 'buy' ? 'CONFIRM PURCHASE' : 'CONFIRM SALE'}
                    </button>
                    
                    {currentMax === 0 && (
                        <p className="text-center text-[10px] text-red-400 mt-2">
                            {tradeMode === 'buy' ? 'Insufficient funds' : 'No assets to sell'}
                        </p>
                    )}

                </div>
            </div>
        </div>
    );
};

const IPOModal = ({ onClose, onLaunch, existingTickers }: { onClose: () => void, onLaunch: (name: string, ticker: string, price: number, supply: number) => void, existingTickers: string[] }) => {
    const [name, setName] = useState('');
    const [ticker, setTicker] = useState('');
    const [price, setPrice] = useState(1);
    const [supply, setSupply] = useState(5000000);
    const [error, setError] = useState('');
    const listingFee = 1000000;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (name.length > 20) {
            setError('Company Name must be 20 characters or less.');
            return;
        }

        if (ticker.length > 5) {
            setError('Ticker must be 5 characters or less.');
            return;
        }

        if (existingTickers.includes(ticker)) {
            setError('Ticker symbol already exists.');
            return;
        }

        onLaunch(name, ticker, price, supply);
    };

    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center animate-fade-in backdrop-blur-sm px-4">
            <div className="bg-[#161b22] w-full max-w-md rounded-2xl shadow-2xl p-6 border border-gray-700">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-blue-400"><Icon iconName="fa-rocket" className="mr-2" />Launch IPO</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><Icon iconName="fa-times" /></button>
                </div>
                
                {error && (
                    <div className="bg-red-900/50 border border-red-500/50 text-red-200 p-2 rounded-lg text-xs mb-4 flex items-center">
                        <Icon iconName="fa-exclamation-circle" className="mr-2" />
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs text-gray-400 uppercase mb-1">Company Name</label>
                        <input type="text" required value={name} onChange={e => setName(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-white focus:border-blue-500 outline-none" placeholder="My Tech Corp" maxLength={20} />
                        <p className="text-[10px] text-gray-500 text-right mt-1">{name.length}/20</p>
                    </div>
                    <div>
                        <label className="block text-xs text-gray-400 uppercase mb-1">Ticker Symbol</label>
                        <input type="text" required value={ticker} onChange={e => setTicker(e.target.value.toUpperCase())} className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-white focus:border-blue-500 outline-none uppercase font-mono" placeholder="MTC" maxLength={5} />
                        <p className="text-[10px] text-gray-500 text-right mt-1">{ticker.length}/5</p>
                    </div>
                    <div>
                        <label className="block text-xs text-gray-400 uppercase mb-1">Initial Price: ${price}</label>
                        <input type="range" min="1" max="5" step="0.1" value={price} onChange={e => setPrice(parseFloat(e.target.value))} className="w-full" />
                        <div className="flex justify-between text-[10px] text-gray-500">
                            <span>$1.00</span>
                            <span>$5.00</span>
                        </div>
                    </div>
                     <div>
                        <label className="block text-xs text-gray-400 uppercase mb-1">Total Supply: {formatCompact(supply)}</label>
                        <input type="range" min="5000000" max="10000000" step="500000" value={supply} onChange={e => setSupply(parseInt(e.target.value))} className="w-full" />
                        <div className="flex justify-between text-[10px] text-gray-500">
                            <span>5M</span>
                            <span>10M</span>
                        </div>
                    </div>

                    <div className="bg-gray-800/50 p-3 rounded-lg border border-white/5 mt-4">
                         <div className="flex justify-between text-sm">
                             <span className="text-gray-400">Listing Fee</span>
                             <span className="text-red-400 font-mono">-{formatCurrency(listingFee)}</span>
                         </div>
                         <div className="flex justify-between text-sm mt-1">
                             <span className="text-gray-400">You Receive</span>
                             <span className="text-green-400 font-mono">{formatCompact(supply)} Shares (100%)</span>
                         </div>
                    </div>

                    <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-900/20 mt-2 transition-all active:scale-95">
                        Launch IPO
                    </button>
                </form>
            </div>
        </div>
    );
};

const CarSellModal = ({ car, onClose, onConfirm }: { car: Car, onClose: () => void, onConfirm: () => void }) => {
    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center animate-fade-in backdrop-blur-sm px-4">
            <div className="bg-[#161b22] w-full max-w-sm rounded-2xl shadow-2xl p-6 border border-gray-700">
                <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-white">Sell Vehicle?</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><Icon iconName="fa-times" /></button>
                </div>
                <div className="flex gap-4 mb-6">
                    <img src={car.imageUrl} alt={car.name} className="w-24 h-16 object-cover rounded-lg border border-gray-600" />
                    <div>
                         <p className="text-white font-bold text-sm">{car.name}</p>
                         <p className="text-xs text-gray-400 mt-1">Selling 1 unit</p>
                    </div>
                </div>
                <p className="text-gray-300 text-sm mb-6 text-center bg-gray-800/50 p-3 rounded-xl border border-white/5">
                    Market Value: <span className="text-green-400 font-mono font-bold">{formatCurrency(car.cost)}</span>
                    <br/>
                    <span className="text-[10px] text-gray-500">Funds will be added to your balance immediately.</span>
                </p>
                <div className="flex gap-3">
                    <button onClick={onClose} className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 rounded-xl transition-colors text-sm">Cancel</button>
                    <button onClick={onConfirm} className="flex-1 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-bold py-3 rounded-xl transition-colors shadow-lg shadow-red-900/20 text-sm">Confirm Sale</button>
                </div>
            </div>
        </div>
    )
};

// --- Sub-Components (Extracted to fix Hook Error) ---

const StockList = () => {
    const context = useContext(GameContext);
    // Removed early return to prevent React Hook "Rendered fewer hooks than expected" error
    const { gameState, updateGameState } = context!;

    const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
    const [lastPurchase, setLastPurchase] = useState<{ type: string; id: string } | null>(null);
    const [showIPOModal, setShowIPOModal] = useState(false);
    const [sortBy, setSortBy] = useState<SortBy>('name');
    const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
    const [filterIndustry, setFilterIndustry] = useState<string>('All');
    const [filterSearch, setFilterSearch] = useState('');

    const triggerPurchaseEffect = (type: string, id: string) => {
        setLastPurchase({ type, id });
        setTimeout(() => setLastPurchase(null), 700);
    };

    const buyStock = (stockId: string, amount: number) => {
        if (amount <= 0) return;
        const stock = gameState.investments.stocks.find(s => s.id === stockId);
        if (!stock) return;
        
        if (stock.availableSupply < amount) {
            alert("Not enough shares available!");
            return;
        }

        if (gameState.balance >= stock.price * amount) {
            triggerPurchaseEffect('stock', stockId);
        }
        
        updateGameState(prev => {
            const stockToBuy = prev.investments.stocks.find(s => s.id === stockId);
            if(!stockToBuy) return prev;
            const cost = stockToBuy.price * amount;
            if(prev.balance >= cost) {
                const newStocks = prev.investments.stocks.map(s => 
                    s.id === stockId ? {
                        ...s, 
                        shares: s.shares + amount,
                        availableSupply: s.availableSupply - amount 
                    } : s
                );
                return { ...prev, balance: prev.balance - cost, investments: {...prev.investments, stocks: newStocks} };
            }
            return prev;
        });
    };

    const sellStock = (stockId: string, amount: number) => {
        if (amount <= 0) return;
        triggerPurchaseEffect('stock', stockId);
        updateGameState(prev => {
            const stock = prev.investments.stocks.find(s => s.id === stockId);
            if(!stock || stock.shares < amount) return prev;
            const earnings = stock.price * amount;
            const newStocks = prev.investments.stocks.map(s => 
                s.id === stockId ? {
                    ...s, 
                    shares: s.shares - amount,
                    availableSupply: s.availableSupply + amount 
                } : s
            );
            return { ...prev, balance: prev.balance + earnings, investments: {...prev.investments, stocks: newStocks} };
        });
    };

    const launchIPO = (name: string, ticker: string, price: number, supply: number) => {
        const listingFee = 1000000;
        if (gameState.balance < listingFee) {
            alert("Insufficient funds for IPO listing fee ($1,000,000)");
            return;
        }

        updateGameState(prev => {
            const newStock: Stock = {
                id: ticker,
                name: name,
                domain: '',
                industry: 'Technology',
                shares: supply,
                price: price,
                dividendPerShare: price * 0.005,
                history: [price],
                totalSupply: supply,
                availableSupply: 0,
            };

            return {
                ...prev,
                balance: prev.balance - listingFee,
                investments: {
                    ...prev.investments,
                    stocks: [newStock, ...prev.investments.stocks]
                }
            };
        });
        setShowIPOModal(false);
    };

    const liquidatePortfolio = () => {
        // Calculate total value first to show in confirmation
        const ownedStocks = gameState.investments.stocks.filter(s => s.shares > 0);
        if (ownedStocks.length === 0) {
            alert("You don't own any stocks to sell.");
            return;
        }

        const totalValue = ownedStocks.reduce((acc, s) => acc + (s.shares * s.price), 0);
        const confirmMessage = `Are you sure you want to sell ALL your stocks?\n\nYou will receive approximately ${formatCurrency(totalValue)}.`;

        if (!window.confirm(confirmMessage)) return;

        updateGameState(prev => {
            let liquidationValue = 0;
            const newStocks = prev.investments.stocks.map(s => {
                if (s.shares > 0) {
                    liquidationValue += s.shares * s.price;
                    return { 
                        ...s, 
                        availableSupply: s.availableSupply + s.shares, // Return supply to market
                        shares: 0 
                    };
                }
                return s;
            });

            return {
                ...prev,
                balance: prev.balance + liquidationValue,
                investments: { ...prev.investments, stocks: newStocks }
            };
        });
    };

    const portfolioValue = gameState.investments.stocks.reduce((acc, s) => acc + s.shares * s.price, 0);
    const selectedStock = gameState.investments.stocks.find(s => s.id === selectedAssetId);
    const existingTickers = useMemo(() => gameState.investments.stocks.map(s => s.id), [gameState.investments.stocks]);

    const industries = useMemo(() => {
        const unique = new Set(gameState.investments.stocks.map(s => s.industry || 'Other'));
        return ['All', ...Array.from(unique)];
    }, [gameState.investments.stocks]);

    const filteredAndSortedStocks = useMemo(() => {
        let result = gameState.investments.stocks;

        if (filterSearch) {
            const lowerSearch = filterSearch.toLowerCase();
            result = result.filter(s => s.name.toLowerCase().includes(lowerSearch) || s.id.toLowerCase().includes(lowerSearch));
        }

        if (filterIndustry !== 'All') {
            result = result.filter(s => s.industry === filterIndustry);
        }

        result = [...result].sort((a, b) => {
            let valA: number | string = 0;
            let valB: number | string = 0;

            switch(sortBy) {
                case 'name': valA = a.name; valB = b.name; break;
                case 'price': valA = a.price; valB = b.price; break;
                case 'cap': valA = a.price * a.availableSupply; valB = b.price * b.availableSupply; break;
                case 'change':
                    const prevA = a.history.length > 1 ? a.history[a.history.length - 2] : a.price;
                    const prevB = b.history.length > 1 ? b.history[b.history.length - 2] : b.price;
                    valA = (a.price - prevA) / prevA;
                    valB = (b.price - prevB) / prevB;
                    break;
            }

            if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
            if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });

        return result;
    }, [gameState.investments.stocks, filterSearch, filterIndustry, sortBy, sortOrder]);

    return (
        <div className="animate-fade-in">
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-4 rounded-2xl border border-white/5 mb-4 mx-2">
                <div className="flex justify-between items-center">
                    <div>
                        <span className="block text-gray-400 text-[10px] uppercase tracking-wider mb-1">Total Stock Portfolio</span>
                        <span className="font-bold text-2xl text-white tracking-tight">{formatCurrency(portfolioValue)}</span>
                    </div>
                    <div className="flex gap-2">
                        <button 
                            onClick={() => setShowIPOModal(true)}
                            className="bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold px-3 py-2 rounded-xl shadow-lg shadow-blue-900/30 flex items-center space-x-1"
                        >
                            <Icon iconName="fa-rocket" />
                            <span>IPO</span>
                        </button>
                        <button 
                            onClick={liquidatePortfolio}
                            className="bg-red-900/40 border border-red-500/30 hover:bg-red-900/60 text-red-300 text-[10px] font-bold px-3 py-2 rounded-xl flex items-center space-x-1 transition-colors"
                        >
                            <Icon iconName="fa-sack-dollar" />
                            <span>Sell All</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="px-2 mb-4 space-y-3">
                <div className="flex gap-2">
                    <div className="relative flex-grow">
                        <Icon iconName="fa-search" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs" />
                        <input 
                            type="text" 
                            placeholder="Search stocks..." 
                            value={filterSearch}
                            onChange={(e) => setFilterSearch(e.target.value)}
                            className="w-full bg-[#161b22] border border-gray-800 rounded-xl py-2 pl-9 pr-3 text-sm text-white focus:border-blue-500 outline-none"
                        />
                    </div>
                    <div className="flex bg-[#161b22] rounded-xl border border-gray-800 overflow-hidden">
                        <select 
                            value={sortBy} 
                            onChange={(e) => setSortBy(e.target.value as SortBy)}
                            className="bg-transparent text-xs font-bold text-gray-300 px-3 py-2 outline-none cursor-pointer"
                        >
                            <option value="name">Name</option>
                            <option value="price">Price</option>
                            <option value="change">% Change</option>
                            <option value="cap">Market Cap</option>
                        </select>
                        <button 
                            onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                            className="px-3 border-l border-gray-800 hover:bg-gray-800 transition-colors"
                        >
                            <Icon iconName={sortOrder === 'asc' ? 'fa-sort-amount-up' : 'fa-sort-amount-down'} className="text-gray-400 text-xs" />
                        </button>
                    </div>
                </div>

                <div className="flex overflow-x-auto gap-2 pb-1 scrollbar-hide">
                    {industries.map(industry => (
                        <button
                            key={industry}
                            onClick={() => setFilterIndustry(industry)}
                            className={`whitespace-nowrap px-3 py-1.5 rounded-full text-[10px] font-bold border transition-colors ${
                                filterIndustry === industry 
                                ? 'bg-blue-600/20 border-blue-500/50 text-blue-400' 
                                : 'bg-[#161b22] border-gray-800 text-gray-500 hover:text-gray-300'
                            }`}
                        >
                            {industry}
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-3 px-2">
                {filteredAndSortedStocks.map(s => {
                    const isUp = s.history.length > 1 && s.price >= s.history[s.history.length - 2];
                    const scarcity = 1 - (s.availableSupply / s.totalSupply);
                    const isShortage = scarcity > 0.8;

                    return (
                        <div key={s.id} className={`bg-[#161b22] p-3 rounded-2xl flex justify-between items-center cursor-pointer active:bg-gray-800 transition-colors border border-gray-800/50 ${lastPurchase?.type === 'stock' && lastPurchase?.id === s.id ? 'ring-2 ring-green-500 bg-green-900/10' : ''}`} onClick={() => setSelectedAssetId(s.id)}>
                            <div className="flex items-center space-x-3 flex-1 min-w-0">
                                <div className="w-10 h-10 rounded-full bg-white p-1 overflow-hidden shrink-0 relative">
                                    <img 
                                        src={`https://logo.clearbit.com/${s.domain}`} 
                                        onError={(e) => {e.currentTarget.src = `https://ui-avatars.com/api/?name=${s.name}&background=random`}}
                                        alt={s.name} 
                                        className="w-full h-full object-contain"
                                        loading="lazy"
                                    />
                                    {isShortage && (
                                        <div className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center border border-[#161b22] text-[8px]" title="High Demand">
                                            <Icon iconName="fa-fire" />
                                        </div>
                                    )}
                                </div>
                                <div className="min-w-0 flex-1 pr-2">
                                    <h3 className="font-bold text-sm text-white flex items-center gap-2">
                                        {s.id}
                                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-gray-800 text-gray-400 font-normal hidden sm:inline-block">{s.industry}</span>
                                    </h3>
                                    
                                    {/* Supply Bar */}
                                    <div className="mt-1 w-full max-w-[100px] bg-gray-800 h-1 rounded-full overflow-hidden">
                                        <div 
                                            className={`h-full ${isShortage ? 'bg-red-500' : 'bg-blue-500'}`} 
                                            style={{ width: `${(s.availableSupply / s.totalSupply) * 100}%` }}
                                        ></div>
                                    </div>
                                    <div className="flex justify-between w-full max-w-[100px] text-[8px] text-gray-500 mt-0.5">
                                        <span>Avail: {formatCompact(s.availableSupply)}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="hidden sm:block mx-4">
                                <Sparkline data={s.history} color={isUp ? '#4ade80' : '#ef4444'} width={80} height={24} />
                            </div>

                            <div className="text-right shrink-0">
                                <p className="font-mono text-white font-medium text-sm">{formatCurrency(s.price)}</p>
                                <PriceChange history={s.history} price={s.price} />
                                {s.shares > 0 && <p className="text-[9px] text-blue-400 mt-0.5">Own: {formatCompact(s.shares)}</p>}
                            </div>
                        </div>
                    );
                })}
                
                {filteredAndSortedStocks.length === 0 && (
                    <div className="text-center py-8 text-gray-500 text-sm">
                        No stocks found matching your filters.
                    </div>
                )}
            </div>
            
            {selectedStock && (
                <AssetDetailModal 
                    asset={selectedStock} 
                    type="stock"
                    balance={gameState.balance}
                    owned={selectedStock.shares}
                    availableSupply={selectedStock.availableSupply}
                    onClose={() => setSelectedAssetId(null)}
                    onBuy={(amt) => buyStock(selectedStock.id, amt)}
                    onSell={(amt) => sellStock(selectedStock.id, amt)}
                />
            )}
            
            {showIPOModal && <IPOModal onClose={() => setShowIPOModal(false)} onLaunch={launchIPO} existingTickers={existingTickers} />}
        </div>
    );
};

const CryptoList = () => {
    const context = useContext(GameContext);
    const { gameState, updateGameState } = context!;
    const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
    const [lastPurchase, setLastPurchase] = useState<{ type: string; id: string } | null>(null);

    const triggerPurchaseEffect = (type: string, id: string) => {
        setLastPurchase({ type, id });
        setTimeout(() => setLastPurchase(null), 700);
    };

    const buyCrypto = (cryptoId: string, amount: number) => {
        const crypto = gameState.investments.crypto.find(c => c.id === cryptoId);
        if (!crypto) return;

        if (gameState.balance >= crypto.price * amount) {
            triggerPurchaseEffect('crypto', cryptoId);
        }

        updateGameState(prev => {
            const cryptoToBuy = prev.investments.crypto.find(c => c.id === cryptoId);
            if(!cryptoToBuy) return prev;
            const cost = cryptoToBuy.price * amount;
            if(prev.balance >= cost) {
                const newCryptos = prev.investments.crypto.map(c => 
                    c.id === cryptoId ? {...c, owned: c.owned + amount} : c
                );
                return { ...prev, balance: prev.balance - cost, investments: {...prev.investments, crypto: newCryptos} };
            }
            return prev;
        });
    };
    
    const sellCrypto = (cryptoId: string, amount: number) => {
        triggerPurchaseEffect('crypto', cryptoId);
        updateGameState(prev => {
            const crypto = prev.investments.crypto.find(c => c.id === cryptoId);
            if(!crypto || crypto.owned < amount) return prev;
            const earnings = crypto.price * amount;
            const newCryptos = prev.investments.crypto.map(c => 
                c.id === cryptoId ? {...c, owned: c.owned - amount} : c
            );
            return { ...prev, balance: prev.balance + earnings, investments: {...prev.investments, crypto: newCryptos} };
        });
    };

    const portfolioValue = gameState.investments.crypto.reduce((acc, c) => acc + c.owned * c.price, 0);
    const selectedCrypto = gameState.investments.crypto.find(c => c.id === selectedAssetId);

    return (
        <div className="animate-fade-in">
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-4 rounded-2xl border border-white/5 mb-4 mx-2">
                <span className="block text-gray-400 text-[10px] uppercase tracking-wider mb-1">Crypto Holdings</span>
                <span className="font-bold text-2xl text-white tracking-tight">{formatCurrency(portfolioValue)}</span>
            </div>
            <div className="space-y-3 px-2">
                {gameState.investments.crypto.map(c => {
                    const isUp = c.history.length > 1 && c.price >= c.history[c.history.length - 2];
                    return (
                        <div key={c.id} className={`bg-[#161b22] p-3 rounded-2xl flex justify-between items-center cursor-pointer active:bg-gray-800 transition-colors border border-gray-800/50 ${lastPurchase?.type === 'crypto' && lastPurchase?.id === c.id ? 'ring-2 ring-yellow-500 bg-yellow-900/10' : ''}`} onClick={() => setSelectedAssetId(c.id)}>
                            <div className="flex items-center space-x-3 flex-1 min-w-0">
                                <img src={c.logoUrl} alt={c.name} className="w-10 h-10 rounded-full shrink-0" onError={(e) => { e.currentTarget.src = `https://ui-avatars.com/api/?name=${c.name}&background=random` }} loading="lazy" />
                                <div className="min-w-0">
                                    <h3 className="font-bold text-sm text-white">{c.name}</h3>
                                    <p className="text-[10px] text-gray-400 font-mono">{c.owned.toFixed(4)}</p>
                                </div>
                            </div>

                            <div className="hidden sm:block mx-4">
                                <Sparkline data={c.history} color={isUp ? '#4ade80' : '#ef4444'} width={80} height={24} />
                            </div>

                            <div className="text-right shrink-0">
                                <p className="font-mono text-white font-medium text-sm">{formatCurrency(c.price)}</p>
                                <PriceChange history={c.history} price={c.price} />
                            </div>
                        </div>
                    );
                })}
            </div>
            {selectedCrypto && (
                <AssetDetailModal 
                    asset={selectedCrypto} 
                    type="crypto"
                    balance={gameState.balance}
                    owned={selectedCrypto.owned}
                    onClose={() => setSelectedAssetId(null)}
                    onBuy={(amt) => buyCrypto(selectedCrypto.id, amt)}
                    onSell={(amt) => sellCrypto(selectedCrypto.id, amt)}
                />
            )}
        </div>
    );
};

const RealEstateList = () => {
    const context = useContext(GameContext);
    const { gameState, updateGameState } = context!;
    const [lastPurchase, setLastPurchase] = useState<{ type: string; id: string } | null>(null);

    const triggerPurchaseEffect = (type: string, id: string) => {
        setLastPurchase({ type, id });
        setTimeout(() => setLastPurchase(null), 700);
    };

    const buyRealEstate = (estateId: string) => {
        const estate = gameState.investments.realEstate.find(r => r.id === estateId);
        if (!estate) return;
        if (gameState.balance >= estate.cost) {
            triggerPurchaseEffect('estate', estateId);
        }
        updateGameState(prev => {
            const estateToBuy = prev.investments.realEstate.find(r => r.id === estateId);
            if(!estateToBuy || prev.balance < estateToBuy.cost) return prev;
            const newRealEstate = prev.investments.realEstate.map(r => 
                r.id === estateId ? {...r, owned: r.owned + 1} : r
            );
            return { ...prev, balance: prev.balance - estateToBuy.cost, investments: {...prev.investments, realEstate: newRealEstate} };
        });
    };

    const propertyValue = gameState.investments.realEstate.reduce((acc, r) => acc + r.owned * r.cost, 0);
    const rentalIncome = gameState.investments.realEstate.reduce((acc, r) => acc + r.owned * r.rentalIncome, 0);

    return (
        <div className="animate-fade-in px-2">
            <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-gray-800/50 p-3 rounded-xl border border-white/5 text-center"><span className="block text-gray-400 text-[10px] uppercase tracking-wider mb-1">Property Value</span><span className="font-bold text-lg text-white">{formatCompact(propertyValue)}</span></div>
            <div className="bg-gray-800/50 p-3 rounded-xl border border-white/5 text-center"><span className="block text-gray-400 text-[10px] uppercase tracking-wider mb-1">Rental Income</span><span className="font-bold text-lg text-green-400">{formatCompact(rentalIncome)}/s</span></div>
            </div>
            {gameState.investments.realEstate.map(r => (
            <div key={r.id} className={`bg-[#161b22] rounded-2xl mb-4 overflow-hidden border border-gray-800 ${lastPurchase?.type === 'estate' && lastPurchase?.id === r.id ? 'ring-2 ring-green-500' : ''}`}>
                <div className="relative aspect-video">
                    <img src={r.imageUrl} alt={r.name} className="w-full h-full object-cover" loading="lazy"/>
                    <div className="absolute inset-0 bg-gradient-to-t from-[#161b22] to-transparent opacity-90"></div>
                    <div className="absolute bottom-4 left-4 right-4">
                        <h3 className="font-bold text-xl text-white shadow-black drop-shadow-md leading-tight">{r.name}</h3>
                    </div>
                </div>
                <div className="p-4 pt-0">
                    <div className="flex justify-between items-center mb-4 bg-gray-800/50 p-3 rounded-xl">
                        <div>
                            <p className="text-gray-400 text-[10px] uppercase">Income</p>
                            <p className="text-green-400 font-bold">{formatCurrency(r.rentalIncome)}/s</p>
                        </div>
                        <div className="text-right">
                            <p className="text-gray-400 text-[10px] uppercase">Owned</p>
                            <p className="text-white font-bold">{r.owned}</p>
                        </div>
                    </div>
                    <button onClick={() => buyRealEstate(r.id)} disabled={gameState.balance < r.cost} className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-gray-800 disabled:text-gray-600 disabled:cursor-not-allowed text-white py-3 rounded-xl font-bold text-sm transition-all active:scale-95 shadow-lg shadow-blue-900/20">
                        Buy Property • {formatCompact(r.cost)}
                    </button>
                </div>
            </div>
            ))}
        </div>
    );
};

const CarList = () => {
    const context = useContext(GameContext);
    const { gameState, updateGameState } = context!;
    const [carToSell, setCarToSell] = useState<Car | null>(null);
    const [lastPurchase, setLastPurchase] = useState<{ type: string; id: string } | null>(null);

    const triggerPurchaseEffect = (type: string, id: string) => {
        setLastPurchase({ type, id });
        setTimeout(() => setLastPurchase(null), 700);
    };

    const buyCar = (carId: string) => {
        const car = gameState.investments.cars.find(c => c.id === carId);
        if (!car) return;
        if (gameState.balance >= car.cost) {
            triggerPurchaseEffect('car', carId);
        }
        updateGameState(prev => {
            const carToBuy = prev.investments.cars.find(c => c.id === carId);
            if (!carToBuy || prev.balance < carToBuy.cost) return prev;
            const newCars = prev.investments.cars.map(c =>
                c.id === carId ? { ...c, owned: c.owned + 1 } : c
            );
            return { ...prev, balance: prev.balance - carToBuy.cost, investments: { ...prev.investments, cars: newCars } };
        });
    };

    const initiateSellCar = (carId: string) => {
        const car = gameState.investments.cars.find(c => c.id === carId);
        if (car && car.owned > 0) {
            setCarToSell(car);
        }
    };

    const confirmSellCar = () => {
        if (!carToSell) return;
        
        triggerPurchaseEffect('car', carToSell.id);
        
        updateGameState(prev => {
            const car = prev.investments.cars.find(c => c.id === carToSell.id);
            if (!car || car.owned < 1) return prev;
            const newCars = prev.investments.cars.map(c =>
                c.id === carToSell.id ? { ...c, owned: c.owned - 1 } : c
            );
            return { ...prev, balance: prev.balance + car.cost, investments: { ...prev.investments, cars: newCars } };
        });
        
        setCarToSell(null);
    };

    const carValue = gameState.investments.cars.reduce((acc, c) => acc + c.owned * c.cost, 0);

    return (
        <div className="animate-fade-in px-2">
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-4 rounded-2xl border border-white/5 mb-4 text-center">
                <span className="block text-gray-400 text-[10px] uppercase tracking-wider mb-1">Garage Value</span>
                <span className="font-bold text-2xl text-white tracking-tight">{formatCurrency(carValue)}</span>
            </div>
            <div className="space-y-6">
                {gameState.investments.cars.map(c => (
                <div key={c.id} className={`group bg-[#161b22] rounded-2xl overflow-hidden shadow-2xl border border-gray-800 ${lastPurchase?.type === 'car' && lastPurchase?.id === c.id ? 'ring-2 ring-blue-500' : ''}`}>
                    <div className="relative overflow-hidden aspect-video">
                        <img src={c.imageUrl} alt={c.name} className="w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-105" loading="lazy"/>
                        <div className="absolute inset-0 bg-gradient-to-t from-[#161b22] via-transparent to-transparent"></div>
                        <div className="absolute bottom-4 left-4">
                            <h3 className="font-bold text-white text-2xl drop-shadow-lg">{c.name}</h3>
                            <p className="text-gray-300 text-xs mt-1 bg-black/40 px-2 py-1 rounded-md inline-block backdrop-blur-sm">Owned: {c.owned}</p>
                        </div>
                    </div>
                    <div className="p-4">
                        <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                            <div className="flex flex-col bg-gray-800/50 p-3 rounded-xl border border-white/5">
                                <span className="text-gray-400 text-[10px] uppercase">Value</span>
                                <span className="font-mono font-bold text-white">{formatCompact(c.cost)}</span>
                            </div>
                            <div className="flex flex-col text-right bg-gray-800/50 p-3 rounded-xl border border-white/5">
                                <span className="text-gray-400 text-[10px] uppercase">Appreciation</span>
                                <span className="font-mono font-bold text-green-400">+{formatCompact(c.appreciationValue)}/tick</span>
                            </div>
                        </div>
                        
                        <div className="flex space-x-3">
                            <button onClick={() => initiateSellCar(c.id)} disabled={c.owned < 1} className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-500 disabled:opacity-30 disabled:cursor-not-allowed py-3 text-sm font-bold rounded-xl transition-all border border-red-500/20">Sell</button>
                            <button onClick={() => buyCar(c.id)} disabled={gameState.balance < c.cost} className="flex-[2] bg-blue-600 hover:bg-blue-500 disabled:bg-gray-800 disabled:text-gray-600 disabled:cursor-not-allowed text-white py-3 text-sm font-bold rounded-xl transition-all shadow-lg shadow-blue-900/20">Buy</button>
                        </div>
                    </div>
                </div>
                ))}
            </div>
            {carToSell && <CarSellModal car={carToSell} onClose={() => setCarToSell(null)} onConfirm={confirmSellCar} />}
        </div>
    );
};

// --- Main Screen Component ---

const InvestScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<InvestTab>('stocks');
  const context = useContext(GameContext);
  
  if (!context) return null;

  const renderTabs = () => (
    <div className="flex bg-gray-950 p-1 rounded-2xl mb-4 mx-2 border border-gray-800">
      {(['stocks', 'estate', 'crypto', 'cars'] as InvestTab[]).map(tab => (
        <button key={tab} onClick={() => setActiveTab(tab)} className={`capitalize flex-1 py-2 text-sm font-bold rounded-xl transition-all ${activeTab === tab ? 'bg-gray-800 text-white shadow-md' : 'text-gray-500 hover:text-gray-300'}`}>
          {tab}
        </button>
      ))}
    </div>
  );

  return (
    <div className="bg-gray-950 min-h-full pb-20">
      <div className="sticky top-0 bg-gray-950/80 backdrop-blur-lg z-20 border-b border-white/5 px-4 py-3 mb-2">
         <h1 className="text-xl font-bold text-white tracking-wide text-center">Market</h1>
      </div>
      
      <NewsTicker />
      
      {renderTabs()}
      
      {/* Conditionally render components - hooks inside them will only run when mounted */}
      {activeTab === 'stocks' && <StockList />}
      {activeTab === 'estate' && <RealEstateList />}
      {activeTab === 'crypto' && <CryptoList />}
      {activeTab === 'cars' && <CarList />}
      
    </div>
  );
};

export default InvestScreen;
