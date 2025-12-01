
import React, { useContext, useState, useEffect, useRef, useMemo } from 'react';
import { GameContext } from '../contexts/GameContext';
import { formatCurrency, formatCompact } from '../utils/formatters';
import Icon from '../components/Icon';
import { CreditCardTier, GameState } from '../types';

interface HomeScreenProps {
    setActiveTab?: (tab: string) => void;
}

// Memoized MomentumChart to isolate high-frequency animation from parent re-renders
const MomentumChart = React.memo(({ momentumRef, baseClickIncome }: { momentumRef: React.MutableRefObject<number>, baseClickIncome: number }) => {
    const [chartHistory, setChartHistory] = useState<number[]>(new Array(20).fill(0)); // Reduced points for performance
    const [displayMomentum, setDisplayMomentum] = useState(0);

    const generateChartPath = (data: number[], width: number, height: number) => {
        if (data.length < 2) return "";
        const maxX = data.length - 1;
        const points = data.map((val, i) => {
            const x = (i / maxX) * width;
            const normalizedVal = val / 100;
            const y = height - (normalizedVal * (height * 0.8)) - (height * 0.1);
            return `${x},${y}`;
        });
        return `M 0,${height} L ${points[0]} ` + points.slice(1).map(p => `L ${p}`).join(' ') + ` L ${width},${height} Z`;
    };

    const generateLinePath = (data: number[], width: number, height: number) => {
        if (data.length < 2) return "";
        const maxX = data.length - 1;
        const points = data.map((val, i) => {
            const x = (i / maxX) * width;
            const normalizedVal = val / 100;
            const y = height - (normalizedVal * (height * 0.8)) - (height * 0.1);
            return `${x},${y}`;
        });
        return `M ${points.join(' L ')}`;
    };

    useEffect(() => {
        let animationFrameId: number;
        let lastTime = performance.now();
        const decayRatePerSec = 37.5; 

        const animate = (time: number) => {
            const deltaTime = time - lastTime;
            
            // Reduced FPS from ~30 to ~24 (42ms) to save CPU for taps
            if (deltaTime >= 42) { 
                if (momentumRef.current > 0) {
                    const decay = decayRatePerSec * (deltaTime / 1000);
                    momentumRef.current = Math.max(0, momentumRef.current - decay);
                }

                const noise = (Math.random() - 0.5) * 2;
                const currentVal = Math.max(0, Math.min(100, momentumRef.current + noise));

                setChartHistory(prev => {
                    // Optimized array operation
                    const newHistory = new Array(prev.length);
                    for (let i = 0; i < prev.length - 1; i++) {
                        newHistory[i] = prev[i + 1];
                    }
                    newHistory[prev.length - 1] = currentVal;
                    return newHistory;
                });
                setDisplayMomentum(momentumRef.current);
                lastTime = time;
            }
            animationFrameId = requestAnimationFrame(animate);
        };

        animationFrameId = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animationFrameId);
    }, []);

    const currentMultiplier = 1 + (displayMomentum / 25);

    return (
        <div className="relative w-full h-32 bg-gray-900/80 rounded-2xl shadow-lg overflow-hidden border border-white/5 mb-6 group">
            <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent opacity-50"></div>

            <svg viewBox="0 0 100 50" className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                <defs>
                    <linearGradient id="chartFill" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                    </linearGradient>
                </defs>
                <path d={generateChartPath(chartHistory, 100, 50)} fill="url(#chartFill)" className="transition-all duration-75 ease-linear" />
                <path d={generateLinePath(chartHistory, 100, 50)} fill="none" stroke="#60a5fa" strokeWidth="1" className="transition-all duration-75 ease-linear drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
            </svg>

            <div className="absolute top-3 left-4 right-4 flex justify-between items-center z-10">
                <div>
                    <span className="text-[10px] text-blue-400/80 font-bold tracking-wider uppercase">Market Speed</span>
                    <div className="flex items-baseline space-x-1">
                        <span className={`text-xl font-bold font-mono transition-colors ${displayMomentum > 80 ? 'text-orange-400' : 'text-white'}`}>
                            x{currentMultiplier.toFixed(2)}
                        </span>
                    </div>
                </div>
                <div className="text-right">
                    <span className="text-[10px] text-gray-500 font-bold uppercase">Earn / Tap</span>
                    <div className="text-white text-lg font-bold">
                        +${formatCompact(baseClickIncome * currentMultiplier)}
                    </div>
                </div>
            </div>
        </div>
    );
});

// Memoized Background for Credit Card to avoid repainting heavy gradients on every tap
const CreditCardBackground = React.memo(({ tier }: { tier: CreditCardTier }) => {
    const getCardStyle = (tier: CreditCardTier) => {
        switch(tier) {
            case CreditCardTier.KING:
                return "bg-gradient-to-br from-gray-950 via-red-950 to-black border-red-900/50 shadow-red-950/50 ring-1 ring-red-500/20";
            case CreditCardTier.DIAMOND:
                return "bg-gradient-to-br from-cyan-900 via-blue-900 to-indigo-950 border-cyan-500/30 shadow-cyan-900/40 ring-1 ring-cyan-400/20";
            case CreditCardTier.PLATINUM:
                return "bg-gradient-to-br from-slate-200 via-slate-400 to-slate-500 border-white/40 shadow-slate-400/30 ring-1 ring-white/30 text-gray-800";
            case CreditCardTier.GOLD:
                return "bg-gradient-to-br from-yellow-600 via-yellow-700 to-yellow-900 border-yellow-500/30 shadow-yellow-900/30 ring-1 ring-yellow-400/20";
            default: // SILVER
                return "bg-gradient-to-br from-gray-700 via-gray-800 to-gray-900 border-gray-600/30 shadow-gray-900/50 ring-1 ring-white/10";
        }
    };
    
    const getTierName = (tier: CreditCardTier) => {
        if (tier === CreditCardTier.PLATINUM) return "PLATINUM";
        if (tier === CreditCardTier.DIAMOND) return "DIAMOND";
        if (tier === CreditCardTier.KING) return "KING";
        return tier;
    }

    const isLightCard = tier === CreditCardTier.PLATINUM;

    return (
        <div className={`absolute inset-0 w-full h-full rounded-2xl ${getCardStyle(tier)}`}>
             {/* Removed Noise overlay for performance on mobile */}
             {/* Shine Effect */}
             <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-transparent rounded-2xl pointer-events-none" />
             
             <div className="absolute top-6 left-6 right-6 flex justify-between items-start z-10">
                <div className={`font-mono text-xs opacity-70 tracking-widest ${isLightCard ? 'text-gray-900' : 'text-white'}`}>FINANCE TYCOON</div>
                <div className={`italic font-serif font-bold text-base ${isLightCard ? 'text-gray-700 opacity-60' : 'text-white opacity-50'}`}>{getTierName(tier)}</div>
            </div>

            {/* Chip */}
            <div className="absolute top-16 left-6 w-12 h-9 bg-gradient-to-br from-yellow-200 to-yellow-500 rounded-lg overflow-hidden border border-yellow-600/30 shadow-sm z-10">
                <div className="absolute top-1/2 w-full h-[1px] bg-yellow-700/40"></div>
                <div className="absolute left-1/2 h-full w-[1px] bg-yellow-700/40"></div>
                <div className="absolute top-1/2 left-1/2 w-4 h-4 border border-yellow-700/40 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
            </div>
            
             <div className="absolute bottom-5 left-6 right-6 flex justify-between items-end z-10">
                <div>
                    <p className={`text-[9px] uppercase mb-0.5 ${isLightCard ? 'text-gray-500' : 'text-white/50'}`}>Card Holder</p>
                    <p className={`font-mono text-sm sm:text-base tracking-widest ${isLightCard ? 'text-gray-800' : 'text-white'}`}>PLAYER ONE</p>
                </div>
                <Icon iconName="fa-wifi" className={`text-lg rotate-90 ${isLightCard ? 'text-gray-800 opacity-60' : 'text-white opacity-60'}`} />
            </div>
        </div>
    );
});

// Extracted CreditCard component for better organization and optimization
const CreditCard = ({ balance, tier }: { balance: number, tier: CreditCardTier }) => {
    const [rotation, setRotation] = useState({ x: 0, y: 0 });
    const isLightCard = tier === CreditCardTier.PLATINUM;

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const card = e.currentTarget;
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        // Reduced rotation multiplier for less layout shift feeling
        const rotateX = ((y - centerY) / centerY) * -5; 
        const rotateY = ((x - centerX) / centerX) * 5;
        
        setRotation({ x: rotateX, y: rotateY });
    };
    
    const resetRotation = () => setRotation({ x: 0, y: 0 });

    return (
        <div className="flex justify-center mb-6 pt-2 perspective-1000 w-full">
            <div 
               className="relative w-full max-w-[400px] aspect-[1.586/1] rounded-2xl p-6 shadow-2xl transition-transform duration-100 ease-out"
               style={{ transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)` }}
               onMouseMove={handleMouseMove}
               onMouseLeave={resetRotation}
            >
                <CreditCardBackground tier={tier} />

                {/* Balance Content - Only this should visually update heavily on tap */}
                <div className="absolute top-[45%] left-6 right-6 z-20">
                    <p className={`text-[10px] uppercase tracking-wide mb-1 ${isLightCard ? 'text-gray-600' : 'text-white/60'}`}>Total Balance</p>
                    <h1 className={`text-3xl sm:text-4xl font-mono font-bold tracking-tight drop-shadow-sm truncate ${isLightCard ? 'text-gray-900' : 'text-white'}`}>
                        {formatCurrency(balance)}
                    </h1>
                </div>
            </div>
        </div>
    );
};

const HomeScreen: React.FC<HomeScreenProps> = ({ setActiveTab }) => {
  const context = useContext(GameContext);
  const [clickScale, setClickScale] = useState(1);
  const momentumRef = useRef(0); 

  if (!context) return null;
  const { gameState, updateGameState, incrementBalance } = context;

  const totalFortune = useMemo(() => {
      const balance = gameState.balance;
      const businessValue = gameState.businesses.reduce((total, b) => total + (b.baseCost * b.level), 0);
      const stockValue = gameState.investments.stocks.reduce((total, s) => total + (s.price * s.shares), 0);
      const estateValue = gameState.investments.realEstate.reduce((total, r) => total + (r.cost * r.owned), 0);
      const carValue = gameState.investments.cars.reduce((total, c) => total + (c.cost * c.owned), 0);
      const cryptoValue = gameState.investments.crypto.reduce((total, c) => total + (c.price * c.owned), 0);
      const collectionValue = gameState.collections.reduce((total, item) => {
          let itemValue = 0;
          for (let i = 0; i < item.level; i++) {
              itemValue += item.baseCost * Math.pow(1.5, i);
          }
          return total + itemValue;
      }, 0);
      return balance + businessValue + stockValue + estateValue + carValue + cryptoValue + collectionValue;
  }, [gameState]); // Note: totalFortune re-calculates on every tap. But it's fast enough.

  const cardTier = useMemo(() => {
      if (totalFortune >= 100000000000) return CreditCardTier.KING;
      if (totalFortune >= 1000000000) return CreditCardTier.DIAMOND;
      if (totalFortune >= 1000000) return CreditCardTier.PLATINUM;
      if (totalFortune >= 100000) return CreditCardTier.GOLD;
      return CreditCardTier.SILVER;
  }, [totalFortune]);

  const handleMainClick = () => {
    const multiplier = 1 + (momentumRef.current / 25);
    const income = gameState.clickIncome * multiplier;

    momentumRef.current = Math.min(100, momentumRef.current + 8);

    // Use optimized incrementBalance to avoid heavy context recalculations
    incrementBalance(income);
    
    setClickScale(0.95); // Subtle scale for less layout thrashing
    setTimeout(() => setClickScale(1), 80);
  };

  const buyUpgrade = (upgradeId: keyof typeof gameState.upgrades) => {
    updateGameState(prev => {
      const upgrade = prev.upgrades[upgradeId];
      const cost = upgrade.baseCost * Math.pow(1.2, upgrade.level);
      if (prev.balance >= cost) {
        const newLevel = upgrade.level + 1;
        const newUpgrades = {
          ...prev.upgrades,
          [upgradeId]: { ...upgrade, level: newLevel }
        };
        
        let newClickIncome = prev.clickIncome;
        if (upgradeId === 'click_boost') {
            newClickIncome += upgrade.incomePerLevel;
        }

        return {
          ...prev,
          balance: prev.balance - cost,
          clickIncome: newClickIncome,
          upgrades: newUpgrades,
        };
      }
      return prev;
    });
  };

  const getUpgradeCost = (upgradeId: keyof typeof gameState.upgrades) => {
    const upgrade = gameState.upgrades[upgradeId];
    return upgrade.baseCost * Math.pow(1.2, upgrade.level);
  };
  
  const clickBoost = gameState.upgrades.click_boost;
  const clickBoostCost = getUpgradeCost('click_boost');
  const canAffordClickBoost = gameState.balance >= clickBoostCost;

  const autoClicker = gameState.upgrades.auto_clicker_1;
  const autoClickerCost = getUpgradeCost('auto_clicker_1');
  const canAffordAutoClicker = gameState.balance >= autoClickerCost;

  return (
    <div className="flex flex-col min-h-full bg-gray-950 px-5 pt-8 pb-24 relative overflow-hidden font-sans select-none">
      
      {/* Optimized Credit Card Component */}
      <CreditCard balance={gameState.balance} tier={cardTier} />

      {/* Optimized Momentum Chart Component */}
      <MomentumChart momentumRef={momentumRef} baseClickIncome={gameState.clickIncome} />

      {/* Floating Glass Tap Button */}
      <div className="flex justify-center mb-8 relative">
          <div className="absolute inset-0 bg-orange-500/20 blur-[50px] rounded-full transform scale-75 animate-pulse-fast"></div>
          <button
             onMouseDown={handleMainClick}
             onTouchStart={(e) => { e.preventDefault(); handleMainClick(); }}
             style={{ transform: `scale(${clickScale})` }}
             className="relative z-10 w-24 h-24 rounded-full bg-gradient-to-b from-orange-500 to-orange-700 shadow-[0_10px_30px_-5px_rgba(234,88,12,0.5)] border-[4px] border-gray-900 ring-4 ring-gray-800/50 flex items-center justify-center transition-transform duration-75 active:shadow-inner outline-none group overflow-hidden"
          >
              <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="flex flex-col items-center group-active:scale-90 transition-transform duration-100">
                <Icon iconName="fa-fingerprint" className="text-3xl text-white/90 drop-shadow-sm mb-0.5" />
                <span className="text-white/90 font-bold text-[9px] tracking-[0.2em]">TAP</span>
              </div>
          </button>
      </div>

      {/* Action Grid */}
      <div className="grid grid-cols-2 gap-3 mb-3">
         <button 
            onClick={() => setActiveTab && setActiveTab('invest')}
            className="group relative overflow-hidden bg-gray-800/40 hover:bg-gray-800/60 border border-white/5 rounded-xl p-3 flex flex-col items-center text-white transition-all active:scale-95"
         >
            <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <Icon iconName="fa-arrow-trend-up" className="text-blue-400 text-xl mb-1.5 group-hover:-translate-y-0.5 transition-transform" />
            <span className="font-bold text-xs">Invest</span>
            <span className="text-[10px] text-gray-500 mt-0.5">Grow Assets</span>
         </button>

         <button 
            onClick={() => buyUpgrade('auto_clicker_1')}
            disabled={!canAffordAutoClicker}
            className={`group relative overflow-hidden bg-gray-800/40 hover:bg-gray-800/60 border border-white/5 rounded-xl p-3 flex flex-col items-center text-white transition-all active:scale-95 ${!canAffordAutoClicker && 'opacity-60'}`}
         >
            <div className="absolute inset-0 bg-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <Icon iconName="fa-robot" className="text-green-500 text-xl mb-1.5 group-hover:-translate-y-0.5 transition-transform" />
            <span className="font-bold text-xs">Auto Bot</span>
            <span className="text-[10px] text-green-400/80 mt-0.5 font-mono">${formatCompact(autoClickerCost)}</span>
         </button>
      </div>

      {/* Bottom Upgrade Bar */}
      <div className="mt-auto bg-gray-900/60 rounded-2xl p-4 border border-white/5 shadow-lg">
        <div className="flex justify-between items-center mb-3">
            <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                    <Icon iconName="fa-bolt" className="text-blue-400 text-sm" />
                </div>
                <div>
                    <h3 className="text-white font-bold text-sm">Click Power</h3>
                    <p className="text-gray-500 text-[10px]">Level {clickBoost.level}</p>
                </div>
            </div>
            <div className="text-right">
                 <p className="text-green-400 font-bold text-sm">+${formatCompact(clickBoost.incomePerLevel)}</p>
                 <p className="text-gray-600 text-[9px] uppercase font-bold tracking-wider">Per Level</p>
            </div>
        </div>

        <button 
            onClick={() => buyUpgrade('click_boost')}
            disabled={!canAffordClickBoost}
            className={`w-full py-3 rounded-xl font-bold text-xs flex justify-between px-4 items-center shadow-lg transition-all active:scale-95 ${
                canAffordClickBoost 
                ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/20' 
                : 'bg-gray-800 text-gray-500 cursor-not-allowed'
            }`}
        >
            <span>UPGRADE</span>
            <span className="font-mono text-sm opacity-90">${formatCompact(clickBoostCost)}</span>
        </button>
      </div>
    </div>
  );
};

export default HomeScreen;
