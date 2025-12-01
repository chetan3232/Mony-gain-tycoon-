
import React, { useState, useEffect, useCallback } from 'react';
import BottomNav from './components/BottomNav';
import HomeScreen from './screens/HomeScreen';
import BusinessScreen from './screens/BusinessScreen';
import InvestScreen from './screens/InvestScreen';
import ItemsScreen from './screens/ItemsScreen';
import ProfileScreen from './screens/ProfileScreen';
import TasksScreen from './screens/TasksScreen';
import { GameState, Stock, Crypto, Car } from './types';
import { saveGameLocal, loadGameLocal } from './services/localStoreService';
import { GameContext } from './contexts/GameContext';

// Helper to generate Real Stocks
const generateRealStocks = (): Stock[] => {
    const stockData = [
        { t: 'NEXO', n: 'Nexo', d: 'nexo.io', p: 5, supply: 5000000, i: 'Finance' },
        { t: 'AAPL', n: 'Apple Inc.', d: 'apple.com', p: 180, i: 'Technology' },
        { t: 'MSFT', n: 'Microsoft', d: 'microsoft.com', p: 400, i: 'Technology' },
        { t: 'GOOGL', n: 'Alphabet', d: 'google.com', p: 160, i: 'Technology' },
        { t: 'AMZN', n: 'Amazon', d: 'amazon.com', p: 170, i: 'Technology' },
        { t: 'NVDA', n: 'Nvidia', d: 'nvidia.com', p: 800, i: 'Technology' },
        { t: 'META', n: 'Meta', d: 'meta.com', p: 480, i: 'Technology' },
        { t: 'TSLA', n: 'Tesla', d: 'tesla.com', p: 175, i: 'Automotive' },
        { t: 'BRK.B', n: 'Berkshire', d: 'berkshirehathaway.com', p: 420, i: 'Finance' },
        { t: 'LLY', n: 'Eli Lilly', d: 'lilly.com', p: 780, i: 'Healthcare' },
        { t: 'V', n: 'Visa', d: 'visa.com', p: 280, i: 'Finance' },
        { t: 'JPM', n: 'JPMorgan', d: 'jpmorganchase.com', p: 200, i: 'Finance' },
        { t: 'WMT', n: 'Walmart', d: 'walmart.com', p: 60, i: 'Retail' },
        { t: 'XOM', n: 'Exxon Mobil', d: 'exxonmobil.com', p: 120, i: 'Energy' },
        { t: 'MA', n: 'Mastercard', d: 'mastercard.com', p: 470, i: 'Finance' },
        { t: 'PG', n: 'Procter & Gamble', d: 'pg.com', p: 160, i: 'Consumer' },
        { t: 'COST', n: 'Costco', d: 'costco.com', p: 750, i: 'Retail' },
        { t: 'JNJ', n: 'Johnson & Johnson', d: 'jnj.com', p: 150, i: 'Healthcare' },
        { t: 'ORCL', n: 'Oracle', d: 'oracle.com', p: 125, i: 'Technology' },
        { t: 'HD', n: 'Home Depot', d: 'homedepot.com', p: 370, i: 'Retail' },
        { t: 'BAC', n: 'Bank of America', d: 'bankofamerica.com', p: 35, i: 'Finance' },
        { t: 'KO', n: 'Coca-Cola', d: 'coca-colacompany.com', p: 60, i: 'Consumer' },
        { t: 'NFLX', n: 'Netflix', d: 'netflix.com', p: 620, i: 'Entertainment' },
        { t: 'AMD', n: 'AMD', d: 'amd.com', p: 180, i: 'Technology' },
        { t: 'PEP', n: 'PepsiCo', d: 'pepsico.com', p: 165, i: 'Consumer' },
        { t: 'ADBE', n: 'Adobe', d: 'adobe.com', p: 490, i: 'Technology' },
        { t: 'CRM', n: 'Salesforce', d: 'salesforce.com', p: 300, i: 'Technology' },
        { t: 'DIS', n: 'Disney', d: 'thewaltdisneycompany.com', p: 110, i: 'Entertainment' },
        { t: 'NKE', n: 'Nike', d: 'nike.com', p: 95, i: 'Consumer' },
        { t: 'INTC', n: 'Intel', d: 'intel.com', p: 30, i: 'Technology' },
        { t: 'T', n: 'AT&T', d: 'att.com', p: 17, i: 'Telecom' },
        { t: 'VZ', n: 'Verizon', d: 'verizon.com', p: 40, i: 'Telecom' },
        { t: 'CSCO', n: 'Cisco', d: 'cisco.com', p: 48, i: 'Technology' },
        { t: 'PFE', n: 'Pfizer', d: 'pfizer.com', p: 26, i: 'Healthcare' },
        { t: 'WFC', n: 'Wells Fargo', d: 'wellsfargo.com', p: 58, i: 'Finance' },
        { t: 'MCD', n: 'McDonalds', d: 'mcdonalds.com', p: 270, i: 'Retail' },
        { t: 'ABT', n: 'Abbott', d: 'abbott.com', p: 110, i: 'Healthcare' },
        { t: 'TM', n: 'Toyota', d: 'toyota-global.com', p: 240, i: 'Automotive' },
        { t: 'NVS', n: 'Novartis', d: 'novartis.com', p: 100, i: 'Healthcare' },
        { t: 'SHEL', n: 'Shell', d: 'shell.com', p: 70, i: 'Energy' },
        { t: 'AZN', n: 'AstraZeneca', d: 'astrazeneca.com', p: 75, i: 'Healthcare' },
        { t: 'SAP', n: 'SAP SE', d: 'sap.com', p: 190, i: 'Technology' },
        { t: 'ASML', n: 'ASML', d: 'asml.com', p: 950, i: 'Technology' },
        { t: 'BABA', n: 'Alibaba', d: 'alibabagroup.com', p: 72, i: 'Technology' },
        { t: 'SONY', n: 'Sony', d: 'sony.com', p: 85, i: 'Technology' },
        { t: 'BP', n: 'BP', d: 'bp.com', p: 38, i: 'Energy' },
        { t: 'UBER', n: 'Uber', d: 'uber.com', p: 75, i: 'Technology' },
        { t: 'ABNB', n: 'Airbnb', d: 'airbnb.com', p: 160, i: 'Technology' },
        { t: 'PYPL', n: 'PayPal', d: 'paypal.com', p: 65, i: 'Finance' },
        { t: 'SQ', n: 'Block', d: 'block.xyz', p: 80, i: 'Finance' },
        { t: 'COIN', n: 'Coinbase', d: 'coinbase.com', p: 250, i: 'Finance' },
    ];

    return stockData.map(s => {
        // Random supply between 5M and 50M unless specified
        const supply = s.supply ? s.supply : Math.floor(Math.random() * 45000000) + 5000000;
        return {
            id: s.t,
            name: s.n,
            domain: s.d,
            industry: s.i || 'Other',
            shares: 0,
            price: s.p,
            dividendPerShare: s.p * 0.005, // 0.5% dividend yield proxy
            history: [s.p],
            totalSupply: supply,
            availableSupply: supply, // Starts fully available
        };
    });
};

// Helper to generate Real Crypto
const generateRealCrypto = (): Crypto[] => {
    const cryptoData = [
        { id: 'BTC', n: 'Bitcoin', p: 65000 },
        { id: 'ETH', n: 'Ethereum', p: 3500 },
        { id: 'BNB', n: 'Binance Coin', p: 600 },
        { id: 'SOL', n: 'Solana', p: 180 },
        { id: 'XRP', n: 'Ripple', p: 0.60 },
        { id: 'DOGE', n: 'Dogecoin', p: 0.18 },
        { id: 'ADA', n: 'Cardano', p: 0.50 },
        { id: 'AVAX', n: 'Avalanche', p: 50 },
        { id: 'SHIB', n: 'Shiba Inu', p: 0.00002 },
        { id: 'DOT', n: 'Polkadot', p: 8 },
        { id: 'LINK', n: 'Chainlink', p: 18 },
        { id: 'MATIC', n: 'Polygon', p: 0.90 },
        { id: 'TRX', n: 'Tron', p: 0.12 },
        { id: 'BCH', n: 'Bitcoin Cash', p: 400 },
        { id: 'UNI', n: 'Uniswap', p: 10 },
        { id: 'LTC', n: 'Litecoin', p: 85 },
        { id: 'NEAR', n: 'NEAR Protocol', p: 7 },
        { id: 'LEO', n: 'UNUS SED LEO', p: 6 },
        { id: 'DAI', n: 'Dai', p: 1.0 },
        { id: 'ETC', n: 'Ethereum Classic', p: 30 },
        { id: 'ICP', n: 'Internet Comp.', p: 14 },
        { id: 'FIL', n: 'Filecoin', p: 8 },
        { id: 'APT', n: 'Aptos', p: 12 },
        { id: 'CRO', n: 'Cronos', p: 0.14 },
        { id: 'ATOM', n: 'Cosmos', p: 11 },
        { id: 'IMX', n: 'Immutable', p: 2.5 },
        { id: 'HBAR', n: 'Hedera', p: 0.10 },
        { id: 'OKB', n: 'OKB', p: 55 },
        { id: 'XLM', n: 'Stellar', p: 0.12 },
        { id: 'KAS', n: 'Kaspa', p: 0.13 },
        { id: 'VET', n: 'VeChain', p: 0.04 },
        { id: 'INJ', n: 'Injective', p: 35 },
        { id: 'OP', n: 'Optimism', p: 3 },
        { id: 'PEPE', n: 'Pepe', p: 0.000007 },
        { id: 'GRT', n: 'The Graph', p: 0.30 },
        { id: 'RNDR', n: 'Render', p: 10 },
        { id: 'STX', n: 'Stacks', p: 3 },
        { id: 'AR', n: 'Arweave', p: 35 },
        { id: 'MKR', n: 'Maker', p: 3000 },
        { id: 'THETA', n: 'Theta Network', p: 2.5 },
        { id: 'FTM', n: 'Fantom', p: 0.8 },
        { id: 'ALGO', n: 'Algorand', p: 0.22 },
        { id: 'AAVE', n: 'Aave', p: 120 },
        { id: 'FLOW', n: 'Flow', p: 1.2 },
        { id: 'EGLD', n: 'MultiversX', p: 55 },
        { id: 'AXS', n: 'Axie Infinity', p: 9 },
        { id: 'SAND', n: 'The Sandbox', p: 0.6 },
        { id: 'MANA', n: 'Decentraland', p: 0.6 },
        { id: 'EOS', n: 'EOS', p: 0.9 },
        { id: 'GALA', n: 'Gala', p: 0.05 },
    ];

    return cryptoData.map(c => ({
        id: c.id,
        name: c.n,
        owned: 0,
        price: c.p,
        history: [c.p],
        logoUrl: `https://cryptologos.cc/logos/${c.n.toLowerCase().replace(' ', '-')}-${c.id.toLowerCase()}-logo.png`
    }));
};

const defaultGameState: GameState = {
  balance: 1000.00,
  clickIncome: 1.00,
  autoIncomePerSecond: 0.00,
  lastSaveTime: Date.now(),
  upgrades: {
    click_boost: { level: 0, baseCost: 50, incomePerLevel: 1 },
    auto_clicker_1: { level: 0, baseCost: 200, incomePerLevel: 0.5 }
  },
  businesses: [
    { id: 'retail', name: 'Retail Store', level: 0, baseCost: 1000, baseIncome: 2, icon: 'fa-shop', color: 'text-orange-400' },
    { id: 'manufacturing', name: 'Factory', level: 0, baseCost: 10000, baseIncome: 10, icon: 'fa-industry', color: 'text-gray-400' },
    { id: 'carsharing', name: 'Car Sharing', level: 0, baseCost: 5000, baseIncome: 5, icon: 'fa-taxi', color: 'text-yellow-400' },
    { id: 'delivery', name: 'Logistics', level: 0, baseCost: 8000, baseIncome: 8, icon: 'fa-truck-fast', color: 'text-cyan-400' },
    { id: 'realEstateDev', name: 'Real Estate Dev', level: 0, baseCost: 25000, baseIncome: 20, icon: 'fa-city', color: 'text-purple-400' },
    { id: 'tech', name: 'Tech Company', level: 0, baseCost: 50000, baseIncome: 45, icon: 'fa-microchip', color: 'text-blue-500' },
    { id: 'mining', name: 'Mining Corp', level: 0, baseCost: 100000, baseIncome: 80, icon: 'fa-cubes', color: 'text-emerald-400' }
  ],
  investments: {
    stocks: generateRealStocks(),
    realEstate: [
      { id: 'apartment', name: 'City Apartment', owned: 0, cost: 15000, rentalIncome: 15, imageUrl: 'https://images.pexels.com/photos/439391/pexels-photo-439391.jpeg?auto=compress&cs=tinysrgb&w=600' },
      { id: 'luxuryVilla', name: 'Hollywood Hills Villa', owned: 0, cost: 200000, rentalIncome: 180, imageUrl: 'https://images.pexels.com/photos/53610/large-home-residential-house-architecture-53610.jpeg?auto=compress&cs=tinysrgb&w=600' },
      { id: 'beachMansion', name: 'Malibu Mansion', owned: 0, cost: 1500000, rentalIncome: 1200, imageUrl: 'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=600' },
      { id: 'skyscraper', name: 'Burj Khalifa Floor', owned: 0, cost: 10000000, rentalIncome: 7500, imageUrl: 'https://images.pexels.com/photos/323705/pexels-photo-323705.jpeg?auto=compress&cs=tinysrgb&w=600' },
    ],
    crypto: generateRealCrypto(),
    cars: [
        { id: 'bmw_m5', name: 'BMW M5 Competition', owned: 0, cost: 140000, appreciationValue: 50, imageUrl: 'https://images.pexels.com/photos/3752194/pexels-photo-3752194.jpeg?auto=compress&cs=tinysrgb&w=600' },
        { id: 'lambo_huracan', name: 'Lamborghini Huracán', owned: 0, cost: 350000, appreciationValue: 120, imageUrl: 'https://images.pexels.com/photos/3972755/pexels-photo-3972755.jpeg?auto=compress&cs=tinysrgb&w=600' },
        { id: 'rolls_phantom', name: 'Rolls-Royce Phantom', owned: 0, cost: 600000, appreciationValue: 200, imageUrl: 'https://images.pexels.com/photos/3764984/pexels-photo-3764984.jpeg?auto=compress&cs=tinysrgb&w=600' },
        { id: 'bugatti_chiron', name: 'Bugatti Chiron', owned: 0, cost: 3500000, appreciationValue: 1500, imageUrl: 'https://images.pexels.com/photos/10394801/pexels-photo-10394801.jpeg?auto=compress&cs=tinysrgb&w=600' },
    ]
  },
  collections: [
    { id: 'stamps', name: 'Stamps', level: 0, maxLevel: 10, baseCost: 100, icon: 'fa-stamp' },
    { id: 'paintings', name: 'Paintings', level: 0, maxLevel: 20, baseCost: 1000, icon: 'fa-palette' },
    { id: 'watches', name: 'Watches', level: 0, maxLevel: 18, baseCost: 500, icon: 'fa-clock' },
    { id: 'nft', name: 'NFTs', level: 0, maxLevel: 50, baseCost: 2000, icon: 'fa-image' }
  ],
  tasks: [
    { id: 'task1', description: 'Reach $1,000 in cash', type: 'balance', goal: 1000, reward: 500, isCompleted: false, isClaimed: false },
    { id: 'task2', description: 'Achieve an income of $10/sec', type: 'autoIncome', goal: 10, reward: 1000, isCompleted: false, isClaimed: false },
    { id: 'task3', description: 'Upgrade Retail Store to Level 5', type: 'businessLevel', targetId: 'retail', goal: 5, reward: 2500, isCompleted: false, isClaimed: false },
    { id: 'task4', description: 'Buy a City Apartment', type: 'ownRealEstate', targetId: 'apartment', goal: 1, reward: 5000, isCompleted: false, isClaimed: false },
    { id: 'task5', description: 'Reach a Total Fortune of $1,000,000', type: 'totalFortune', goal: 1000000, reward: 50000, isCompleted: false, isClaimed: false },
    { id: 'task6', description: 'Reach $10,000 in cash', type: 'balance', goal: 10000, reward: 1000, isCompleted: false, isClaimed: false },
    { id: 'task7', description: 'Upgrade Click Boost to Level 10', type: 'upgradeLevel', targetId: 'click_boost', goal: 10, reward: 2000, isCompleted: false, isClaimed: false },
    { id: 'task8', description: 'Own a Factory', type: 'businessLevel', targetId: 'manufacturing', goal: 1, reward: 7500, isCompleted: false, isClaimed: false },
    { id: 'task9', description: 'Achieve an income of $100/sec', type: 'autoIncome', goal: 100, reward: 10000, isCompleted: false, isClaimed: false },
    { id: 'task10', description: 'Own 100 shares of AAPL', type: 'stockShares', targetId: 'AAPL', goal: 100, reward: 15000, isCompleted: false, isClaimed: false },
    { id: 'task11', description: 'Buy a Hollywood Villa', type: 'ownRealEstate', targetId: 'luxuryVilla', goal: 1, reward: 25000, isCompleted: false, isClaimed: false },
    { id: 'task12', description: 'Upgrade Tech Company to Level 10', type: 'businessLevel', targetId: 'tech', goal: 10, reward: 75000, isCompleted: false, isClaimed: false },
    { id: 'task13', description: 'Buy a Bugatti', type: 'ownCar', targetId: 'bugatti_chiron', goal: 1, reward: 100000, isCompleted: false, isClaimed: false },
    { id: 'task14', description: 'Reach a Total Fortune of $100,000,000', type: 'totalFortune', goal: 100000000, reward: 1000000, isCompleted: false, isClaimed: false },
    { id: 'task15', description: 'Own a Burj Khalifa Floor', type: 'ownRealEstate', targetId: 'skyscraper', goal: 1, reward: 500000, isCompleted: false, isClaimed: false },
  ]
};

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(defaultGameState);
  const [activeTab, setActiveTab] = useState('home');
  const [loading, setLoading] = useState(true);
  const [offlineEarnings, setOfflineEarnings] = useState<number | null>(null);
  const [showSaveNotification, setShowSaveNotification] = useState(false);

  const calculateAutoIncome = useCallback((state: GameState): number => {
    let total = 0;
    total += state.upgrades.auto_clicker_1.level * state.upgrades.auto_clicker_1.incomePerLevel;
    state.businesses.forEach(b => total += b.level * b.baseIncome);
    state.investments.stocks.forEach(s => total += s.shares * s.dividendPerShare);
    state.investments.realEstate.forEach(r => total += r.owned * r.rentalIncome);

    state.collections.forEach(c => {
      if (c.level >= c.maxLevel) {
        const collectionTotalValue = c.baseCost * (Math.pow(1.5, c.maxLevel) - 1) / 0.5;
        total += collectionTotalValue * 0.01;
      }
    });

    return total;
  }, []);

  const calculateTotalFortune = (state: GameState): number => {
      const balance = state.balance;
      const businessValue = state.businesses.reduce((total, b) => total + (b.baseCost * b.level), 0);
      const stockValue = state.investments.stocks.reduce((total, s) => total + (s.price * s.shares), 0);
      const estateValue = state.investments.realEstate.reduce((total, r) => total + (r.cost * r.owned), 0);
      const carValue = state.investments.cars.reduce((total, c) => total + (c.cost * c.owned), 0);
      const cryptoValue = state.investments.crypto.reduce((total, c) => total + (c.price * c.owned), 0);
      const collectionValue = state.collections.reduce((total, item) => {
          let itemValue = 0;
          for (let i = 0; i < item.level; i++) {
              itemValue += item.baseCost * Math.pow(1.5, i);
          }
          return total + itemValue;
      }, 0);
      return balance + businessValue + stockValue + estateValue + carValue + cryptoValue + collectionValue;
  }

  const checkTasks = useCallback((newState: GameState): GameState => {
      const totalFortune = calculateTotalFortune(newState);
      const updatedTasks = newState.tasks.map(task => {
          if (task.isCompleted) return task;

          let completed = false;
          switch (task.type) {
              case 'balance':
                  if (newState.balance >= task.goal) completed = true;
                  break;
              case 'businessLevel':
                  const business = newState.businesses.find(b => b.id === task.targetId);
                  if (business && business.level >= task.goal) completed = true;
                  break;
              case 'autoIncome':
                  if (newState.autoIncomePerSecond >= task.goal) completed = true;
                  break;
              case 'ownRealEstate':
                  const estate = newState.investments.realEstate.find(r => r.id === task.targetId);
                  if (estate && estate.owned >= task.goal) completed = true;
                  break;
              case 'totalFortune':
                  if (totalFortune >= task.goal) completed = true;
                  break;
              case 'upgradeLevel':
                  const upgrade = newState.upgrades[task.targetId as keyof typeof newState.upgrades];
                  if (upgrade && upgrade.level >= task.goal) completed = true;
                  break;
              case 'stockShares':
                  const stock = newState.investments.stocks.find(s => s.id === task.targetId);
                  if (stock && stock.shares >= task.goal) completed = true;
                  break;
              case 'ownCar':
                  const car = newState.investments.cars.find(c => c.id === task.targetId);
                  if (car && car.owned >= task.goal) completed = true;
                  break;
          }
          return { ...task, isCompleted: completed };
      });
      return { ...newState, tasks: updatedTasks };
  }, []);

  const processLoadedState = (loadedState: GameState | null): GameState => {
      let state = loadedState ? { ...defaultGameState, ...loadedState } : defaultGameState;
      
      const defaultStocks = generateRealStocks();

      // Ensure new stocks/crypto are merged if local save is old
      if (loadedState) {
          // Check for missing stocks like NEXO and patch industry for existing ones
          state.investments.stocks = state.investments.stocks.map(s => {
              const def = defaultStocks.find(d => d.id === s.id);
              // Patch industry if missing
              if (!s.industry && def) {
                  return { ...s, industry: def.industry };
              }
              return s;
          });

          // Patch businesses to use new icons and colors from defaultGameState
          state.businesses = state.businesses.map(b => {
             const def = defaultGameState.businesses.find(d => d.id === b.id);
             return def ? { ...b, icon: def.icon, color: def.color } : b;
          });

          defaultStocks.forEach(defStock => {
              if (!state.investments.stocks.find(s => s.id === defStock.id)) {
                  state.investments.stocks.unshift(defStock); // Add new stock to the top
              }
          });

          if (loadedState.investments.crypto.length < 20) {
              state.investments.crypto = defaultGameState.investments.crypto;
          }
      }

      if (loadedState) {
          const timeElapsed = (Date.now() - loadedState.lastSaveTime) / 1000;
          if (timeElapsed > 1) {
              const calculatedAutoIncome = calculateAutoIncome(loadedState);
              const earnings = timeElapsed * calculatedAutoIncome;
              if (earnings > 0) {
                  state = { ...state, balance: state.balance + earnings };
                  setOfflineEarnings(earnings);
              }
          }
      }
      state = { ...state, autoIncomePerSecond: calculateAutoIncome(state) };
      return checkTasks(state);
  };

  useEffect(() => {
    const initGame = () => {
      const localState = loadGameLocal();
      const finalState = processLoadedState(localState);
      setGameState(finalState);
      setLoading(false);
    };

    initGame();
  }, []);
  
  // Game loop for passive income
  useEffect(() => {
    if (loading) return;
    const incomeInterval = setInterval(() => {
      setGameState(prev => ({
        ...prev,
        balance: prev.balance + prev.autoIncomePerSecond
      }));
    }, 1000);
    return () => clearInterval(incomeInterval);
  }, [gameState.autoIncomePerSecond, loading]);

  // Game loop for market fluctuations with SCARCITY Logic
  useEffect(() => {
    if (loading) return;
    const marketInterval = setInterval(() => {
      setGameState(prev => {
        const newStocks = prev.investments.stocks.map(stock => {
          // Supply scarcity logic
          // availableSupply ranges from totalSupply down to 0
          // scarcityFactor: 0 (abundant) -> 1 (empty)
          // Default stocks start with available = total. 
          // IPO stocks might start with available = 0 (if user owns all).
          const scarcityFactor = stock.totalSupply > 0 ? 1 - (stock.availableSupply / stock.totalSupply) : 0;
          
          // Base volatility + Scarcity pressure
          // If scarcity is high (>0.8), price tends to go up significantly
          const volatility = stock.price * 0.015; // 1.5% base swing
          // INCREASED SCARCITY BIAS from 0.02 to 0.05 (5%) to make it more noticeable
          const scarcityBias = scarcityFactor * (stock.price * 0.05); 

          // Random move: -0.5 to 0.5
          // If scarcity is high, we want less downward pressure
          const randomMove = (Math.random() - (0.45 - (scarcityFactor * 0.2))); 
          
          const change = (randomMove * volatility) + scarcityBias;

          const newPrice = Math.max(0.1, stock.price + change);
          const newHistory = [...stock.history.slice(-50), newPrice];
          return { ...stock, price: newPrice, history: newHistory };
        });

        const newCryptos = prev.investments.crypto.map(crypto => {
          const change = (Math.random() - 0.48) * (crypto.price * 0.02); // High volatility
          const newPrice = Math.max(0.000001, crypto.price + change);
          const newHistory = [...crypto.history.slice(-50), newPrice];
          return { ...crypto, price: newPrice, history: newHistory };
        });
        
        const newCars = prev.investments.cars.map(car => {
          const newCost = car.cost + car.appreciationValue;
          return { ...car, cost: newCost };
        });

        return {
          ...prev,
          investments: {
            ...prev.investments,
            stocks: newStocks,
            crypto: newCryptos,
            cars: newCars
          }
        };
      });
    }, 5000); // 5 seconds interval for faster feedback
    return () => clearInterval(marketInterval);
  }, [loading]);

  // Game loop for auto-saving
  useEffect(() => {
    if (loading) return;
    const saveInterval = setInterval(() => {
      setGameState(currentGameState => {
        const stateToSave = { ...currentGameState, lastSaveTime: Date.now() };
        saveGameLocal(stateToSave);
        return stateToSave;
      });
    }, 300000);
    return () => clearInterval(saveInterval);
  }, [loading]);

  const updateGameState = (updater: (prevState: GameState) => GameState) => {
    setGameState(prev => {
        const updatedState = updater(prev);
        const newStateWithIncome = { ...updatedState, autoIncomePerSecond: calculateAutoIncome(updatedState) };
        const finalState = checkTasks(newStateWithIncome);
        return finalState;
    });
  };

  // Optimized version for simple balance updates (like clicking)
  const incrementBalance = useCallback((amount: number) => {
    setGameState(prev => {
        const newBalance = prev.balance + amount;
        // Optimization: Do NOT recalculate autoIncome here, as balance change doesn't affect it.
        const stateWithBalance = { ...prev, balance: newBalance };
        return checkTasks(stateWithBalance);
    });
  }, [checkTasks]);

  const manualSaveGame = () => {
    setGameState(currentGameState => {
      const stateToSave = { ...currentGameState, lastSaveTime: Date.now() };
      saveGameLocal(stateToSave);
      setShowSaveNotification(true);
      setTimeout(() => setShowSaveNotification(false), 2000);
      return stateToSave;
    });
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home': return <HomeScreen setActiveTab={setActiveTab} />;
      case 'business': return <BusinessScreen />;
      case 'invest': return <InvestScreen />;
      case 'tasks': return <TasksScreen />;
      case 'items': return <ItemsScreen />;
      case 'profile': return <ProfileScreen />;
      default: return <HomeScreen setActiveTab={setActiveTab} />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-950">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-5xl text-blue-brand"></i>
          <p className="mt-4 text-xl">Loading Money Tycoon...</p>
        </div>
      </div>
    );
  }

  return (
    <GameContext.Provider value={{ gameState, updateGameState, incrementBalance, manualSaveGame }}>
      <div className="h-screen w-screen flex flex-col font-sans text-gray-100 bg-gray-950">
        {offlineEarnings !== null && (
          <div className="fixed top-5 left-1/2 -translate-x-1/2 bg-green-600 p-4 rounded-xl shadow-2xl z-50 animate-slide-in border border-green-400">
            <p className="text-lg font-bold">Welcome Back, Tycoon!</p>
            <p>Your empire earned ${offlineEarnings.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} while you slept.</p>
            <button onClick={() => setOfflineEarnings(null)} className="absolute top-1 right-2 text-white/80 hover:text-white font-bold text-xl">&times;</button>
          </div>
        )}
        {showSaveNotification && (
          <div className="fixed top-5 left-1/2 -translate-x-1/2 bg-blue-600 p-3 rounded-full px-6 shadow-xl z-50 animate-slide-in flex items-center">
            <i className="fas fa-check-circle mr-2"></i> Game Saved
          </div>
        )}
        <main className="flex-grow overflow-y-auto pb-24 bg-gradient-to-b from-gray-900 to-black scroll-smooth">
          {renderContent()}
        </main>
        <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
    </GameContext.Provider>
  );
};

export default App;
