import React, { useContext, useMemo } from 'react';
import { GameContext } from '../contexts/GameContext';
import { formatCurrency, formatCompact } from '../utils/formatters';
import Icon from '../components/Icon';
import ProgressBar from '../components/ProgressBar';
import { Task } from '../types';

const TasksScreen: React.FC = () => {
    const context = useContext(GameContext);
    if (!context) return null;
    const { gameState, updateGameState } = context;

    const calculateTotalFortune = useMemo(() => {
        const { balance, businesses, investments, collections } = gameState;
        const businessValue = businesses.reduce((total, b) => total + (b.baseCost * b.level), 0);
        const stockValue = investments.stocks.reduce((total, s) => total + (s.price * s.shares), 0);
        const estateValue = investments.realEstate.reduce((total, r) => total + (r.cost * r.owned), 0);
        const carValue = investments.cars.reduce((total, c) => total + (c.cost * c.owned), 0);
        const cryptoValue = investments.crypto.reduce((total, c) => total + (c.price * c.owned), 0);
        const collectionValue = collections.reduce((total, item) => {
            let itemValue = 0;
            for (let i = 0; i < item.level; i++) {
                itemValue += item.baseCost * Math.pow(1.5, i);
            }
            return total + itemValue;
        }, 0);
        return balance + businessValue + stockValue + estateValue + carValue + cryptoValue + collectionValue;
    }, [gameState]);

    const getTaskProgress = (task: Task) => {
        switch (task.type) {
            case 'balance':
                return { current: gameState.balance, goal: task.goal };
            case 'autoIncome':
                return { current: gameState.autoIncomePerSecond, goal: task.goal };
            case 'businessLevel':
                const business = gameState.businesses.find(b => b.id === task.targetId);
                return { current: business?.level || 0, goal: task.goal };
            case 'ownRealEstate':
                const estate = gameState.investments.realEstate.find(r => r.id === task.targetId);
                return { current: estate?.owned || 0, goal: task.goal };
            case 'totalFortune':
                return { current: calculateTotalFortune, goal: task.goal };
            case 'upgradeLevel':
                const upgrade = gameState.upgrades[task.targetId as keyof typeof gameState.upgrades];
                return { current: upgrade?.level || 0, goal: task.goal };
            case 'stockShares':
                const stock = gameState.investments.stocks.find(s => s.id === task.targetId);
                return { current: stock?.shares || 0, goal: task.goal };
            case 'ownCar':
                const car = gameState.investments.cars.find(c => c.id === task.targetId);
                return { current: car?.owned || 0, goal: task.goal };
            default:
                return { current: 0, goal: 1 };
        }
    };

    const claimReward = (taskId: string) => {
        updateGameState(prev => {
            const task = prev.tasks.find(t => t.id === taskId);
            if (!task || !task.isCompleted || task.isClaimed) return prev;

            const newTasks = prev.tasks.map(t =>
                t.id === taskId ? { ...t, isClaimed: true } : t
            );

            return {
                ...prev,
                balance: prev.balance + task.reward,
                tasks: newTasks
            };
        });
    };

    const sortedTasks = [...gameState.tasks].sort((a, b) => {
        if (a.isClaimed && !b.isClaimed) return 1;
        if (!a.isClaimed && b.isClaimed) return -1;
        return 0;
    });

    return (
        <div className="p-4 bg-gray-900 min-h-full">
            <h1 className="text-3xl font-bold mb-6 text-center text-blue-brand">Player Tasks</h1>
            <div className="space-y-4">
                {sortedTasks.map(task => {
                    const progress = getTaskProgress(task);
                    const canClaim = task.isCompleted && !task.isClaimed;
                    return (
                        <div key={task.id} className={`bg-gray-950 p-4 rounded-lg shadow-md transition-opacity ${task.isClaimed ? 'opacity-50' : ''}`}>
                            <div className="flex justify-between items-start">
                                <div className="flex-grow pr-4">
                                    <h2 className="font-bold text-lg">{task.description}</h2>
                                    <p className="text-sm text-yellow-400 mt-1">Reward: {formatCurrency(task.reward)}</p>
                                </div>
                                <button
                                    onClick={() => claimReward(task.id)}
                                    disabled={!canClaim}
                                    className={`w-24 text-center px-3 py-2 rounded-md font-bold text-sm transition-colors ${canClaim ? 'bg-green-brand hover:bg-green-600' : (task.isClaimed ? 'bg-blue-brand' : 'bg-gray-700 cursor-not-allowed')}`}
                                >
                                    {task.isClaimed ? 'Claimed' : (canClaim ? 'Claim' : 'Locked')}
                                </button>
                            </div>
                            {!task.isClaimed && (
                                <div className="mt-3">
                                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                                        <span>Progress</span>
                                        <span>{formatCompact(progress.current)} / {formatCompact(progress.goal)}</span>
                                    </div>
                                    <ProgressBar current={progress.current} max={progress.goal} />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default TasksScreen;