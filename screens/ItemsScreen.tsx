
import React, { useContext, useMemo } from 'react';
import { GameContext } from '../contexts/GameContext';
import { formatCurrency, formatCompact } from '../utils/formatters';
import Icon from '../components/Icon';
import ProgressBar from '../components/ProgressBar';

const ItemsScreen: React.FC = () => {
  const context = useContext(GameContext);
  if (!context) return null;
  const { gameState, updateGameState } = context;

  const getCollectionCost = (collectionId: string) => {
    const item = gameState.collections.find(c => c.id === collectionId);
    if (!item) return 0;
    return item.baseCost * Math.pow(1.5, item.level);
  };
  
  const buyCollectionItem = (collectionId: string) => {
    updateGameState(prev => {
        const item = prev.collections.find(c => c.id === collectionId);
        if (!item || item.level >= item.maxLevel) return prev;
        
        const cost = getCollectionCost(collectionId);

        if (prev.balance >= cost) {
            const newCollections = prev.collections.map(c => 
                c.id === collectionId ? { ...c, level: c.level + 1 } : c
            );
            return {
                ...prev,
                balance: prev.balance - cost,
                collections: newCollections,
            };
        }
        return prev;
    });
  };
  
  // Calculate total value of all collections using geometric series formula
  const totalCollectionValue = useMemo(() => {
    return gameState.collections.reduce((total, item) => {
      let itemValue = 0;
      if (item.level > 0) {
          // Sum = a * (r^n - 1) / (r - 1)
          // a = baseCost, r = 1.5, n = level
          itemValue = item.baseCost * (Math.pow(1.5, item.level) - 1) / 0.5;
      }
      return total + itemValue;
    }, 0);
  }, [gameState.collections]);

  // Calculate total active passive bonus from maxed collections
  const totalBonusIncome = useMemo(() => {
      return gameState.collections.reduce((acc, item) => {
        if (item.level >= item.maxLevel) {
            const maxCollectionValue = item.baseCost * (Math.pow(1.5, item.maxLevel) - 1) / 0.5;
            return acc + (maxCollectionValue * 0.01);
        }
        return acc;
      }, 0);
  }, [gameState.collections]);

  return (
    <div className="p-4 bg-gray-900 min-h-full pb-24">
      <h1 className="text-3xl font-bold mb-6 text-center text-blue-brand">Collections</h1>
      
      <div className="bg-gray-950 p-4 rounded-xl shadow-lg border border-gray-800 mb-8">
          <div className="grid grid-cols-2 gap-4 text-center divide-x divide-gray-800">
              <div>
                  <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Total Value</p>
                  <p className="text-lg font-bold text-white">{formatCompact(totalCollectionValue)}</p>
              </div>
              <div>
                  <p className="text-green-400 text-xs uppercase tracking-wider mb-1">Passive Bonus</p>
                  <p className="text-lg font-bold text-green-400">+{formatCurrency(totalBonusIncome)}/s</p>
              </div>
          </div>
          <p className="text-center text-xs text-gray-500 mt-3 pt-3 border-t border-gray-800">
             Max out collections to earn <span className="text-white font-bold">1%</span> of their value as passive income.
          </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {gameState.collections.map(item => {
          const cost = getCollectionCost(item.id);
          const isMaxLevel = item.level >= item.maxLevel;
          const canAfford = gameState.balance >= cost;
          
          const maxCollectionValue = item.baseCost * (Math.pow(1.5, item.maxLevel) - 1) / 0.5;
          const bonusIncome = maxCollectionValue * 0.01;

          return (
            <div 
                key={item.id} 
                className={`relative p-4 rounded-xl flex flex-col items-center text-center transition-all duration-300 ${
                    isMaxLevel 
                    ? 'bg-gray-900 border border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.2)]' 
                    : 'bg-gray-950 border border-gray-800'
                }`}
            >
              {isMaxLevel && (
                  <div className="absolute top-2 right-2 text-yellow-500 animate-pulse">
                      <Icon iconName="fa-crown" className="text-sm" />
                  </div>
              )}
              
              <div className={`mb-3 p-4 rounded-full transition-colors ${isMaxLevel ? 'bg-yellow-500/10 text-yellow-500' : 'bg-gray-800 text-blue-brand'}`}>
                <Icon iconName={item.icon} className="text-3xl" />
              </div>
              
              <h2 className={`font-bold text-lg mb-1 ${isMaxLevel ? 'text-yellow-500' : 'text-white'}`}>{item.name}</h2>
              <p className="text-xs text-gray-400 mb-3">Level: {item.level}/{item.maxLevel}</p>
              
              <div className="w-full mb-4">
                 <ProgressBar current={item.level} max={item.maxLevel} />
              </div>

              <div className="mt-auto w-full">
                  <div className="mb-3 text-xs">
                    <p className="text-gray-500 mb-1">Passive Bonus</p>
                    <p className={`font-bold ${isMaxLevel ? 'text-green-400' : 'text-gray-600'}`}>
                        +{formatCurrency(bonusIncome)}/s
                    </p>
                  </div>

                  <button
                    onClick={() => buyCollectionItem(item.id)}
                    disabled={!canAfford || isMaxLevel}
                    className={`w-full px-3 py-2 rounded-lg font-bold text-sm transition-all duration-200 ${
                        isMaxLevel 
                        ? 'bg-yellow-600/20 text-yellow-500 cursor-default border border-yellow-600/50' 
                        : (canAfford 
                            ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/50' 
                            : 'bg-gray-800 text-gray-500 cursor-not-allowed')
                    }`}
                  >
                    {isMaxLevel ? 'COMPLETED' : formatCompact(cost)}
                  </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ItemsScreen;
