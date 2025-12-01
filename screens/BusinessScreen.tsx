
import React, { useContext } from 'react';
import { GameContext } from '../contexts/GameContext';
import { formatCurrency, formatCompact } from '../utils/formatters';
import Icon from '../components/Icon';

const BusinessScreen: React.FC = () => {
  const context = useContext(GameContext);
  if (!context) return null;
  const { gameState, updateGameState } = context;

  const getBusinessCost = (businessId: string, levelOffset = 0) => {
    const business = gameState.businesses.find(b => b.id === businessId);
    if (!business) return 0;
    return business.baseCost * Math.pow(1.15, business.level + levelOffset);
  };
  
  const buyBusiness = (businessId: string) => {
    updateGameState(prev => {
        const business = prev.businesses.find(b => b.id === businessId);
        if (!business) return prev;
        
        const cost = getBusinessCost(businessId);

        if (prev.balance >= cost) {
            const newBusinesses = prev.businesses.map(b => 
                b.id === businessId ? { ...b, level: b.level + 1 } : b
            );
            return {
                ...prev,
                balance: prev.balance - cost,
                businesses: newBusinesses,
            };
        }
        return prev;
    });
  };

  const buyMaxBusiness = (businessId: string) => {
    updateGameState(prev => {
        const business = prev.businesses.find(b => b.id === businessId);
        if (!business) return prev;

        let affordableLevels = 0;
        let cumulativeCost = 0;
        let tempBalance = prev.balance;
        
        while(true) {
            const nextLevelCost = getBusinessCost(businessId, affordableLevels);
            if (tempBalance >= nextLevelCost) {
                tempBalance -= nextLevelCost;
                cumulativeCost += nextLevelCost;
                affordableLevels++;
            } else {
                break;
            }
        }
        
        if (affordableLevels === 0) return prev;

        const newBusinesses = prev.businesses.map(b =>
            b.id === businessId ? { ...b, level: b.level + affordableLevels } : b
        );
        
        return {
            ...prev,
            balance: prev.balance - cumulativeCost,
            businesses: newBusinesses,
        };
    });
  };


  return (
    <div className="p-4 bg-gray-900 min-h-full">
      <h1 className="text-3xl font-bold mb-6 text-center text-blue-brand">My Businesses</h1>
      <div className="space-y-4">
        {gameState.businesses.map(business => {
          const cost = getBusinessCost(business.id);
          const canAfford = gameState.balance >= cost;
          const income = business.level * business.baseIncome;

          return (
            <div key={business.id} className="bg-gray-950 p-4 rounded-lg shadow-md flex items-center space-x-4 border border-gray-800">
              <div className="bg-gray-800 p-4 rounded-lg relative overflow-hidden group">
                 <div className={`absolute inset-0 opacity-10 ${business.color ? business.color.replace('text-', 'bg-') : 'bg-blue-500'}`}></div>
                <Icon iconName={business.icon} className={`text-3xl relative z-10 ${business.color || 'text-blue-brand'}`} />
              </div>
              <div className="flex-grow">
                <h2 className={`font-bold text-lg ${business.color || 'text-white'}`}>{business.name}</h2>
                <div className="flex justify-between items-center text-sm text-gray-400">
                  <span>Level: {business.level}</span>
                  <span className="text-green-400">Income: ${formatCompact(income)}/s</span>
                </div>
              </div>
              <div className="flex flex-col space-y-2">
                <button
                  onClick={() => buyBusiness(business.id)}
                  disabled={!canAfford}
                  className={`w-28 text-center px-3 py-2 rounded-md font-bold text-sm transition-colors ${canAfford ? 'bg-green-brand hover:bg-green-600' : 'bg-gray-700 cursor-not-allowed'}`}
                >
                  <div>Upgrade</div>
                  <div className="font-normal">{formatCurrency(cost)}</div>
                </button>
                 <button
                  onClick={() => buyMaxBusiness(business.id)}
                  disabled={!canAfford}
                  className={`w-28 text-center px-3 py-2 rounded-md font-bold text-sm transition-colors ${canAfford ? 'bg-blue-brand hover:bg-blue-600' : 'bg-gray-700 cursor-not-allowed'}`}
                >
                  Buy Max
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BusinessScreen;
