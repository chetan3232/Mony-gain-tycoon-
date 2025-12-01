
export interface Upgrade {
  level: number;
  baseCost: number;
  incomePerLevel: number;
}

export interface Business {
  id: string;
  name: string;
  level: number;
  baseCost: number;
  baseIncome: number;
  icon: string;
  color?: string;
}

export interface Stock {
  id: string; // Ticker Symbol (e.g., AAPL)
  name: string;
  domain: string; // For logo fetching
  industry: string; // Industry category
  shares: number; // Owned by user
  price: number;
  dividendPerShare: number;
  history: number[];
  totalSupply: number; // 5M to 10M
  availableSupply: number; // Logic for scarcity
}

export interface RealEstate {
  id: string;
  name: string;
  owned: number;
  cost: number;
  rentalIncome: number;
  imageUrl: string;
}

export interface Car {
    id: string;
    name: string;
    owned: number;
    cost: number;
    appreciationValue: number;
    imageUrl: string;
}

export interface Crypto {
  id: string; // Symbol (e.g., BTC)
  name: string;
  owned: number;
  price: number;
  history: number[];
  logoUrl: string;
}

export interface Collection {
  id: string;
  name: string;
  level: number;
  maxLevel: number;
  baseCost: number;
  icon: string;
}

export interface Task {
  id: string;
  description: string;
  type: 'balance' | 'businessLevel' | 'autoIncome' | 'ownRealEstate' | 'totalFortune' | 'upgradeLevel' | 'stockShares' | 'ownCar';
  targetId?: string;
  goal: number;
  reward: number;
  isCompleted: boolean;
  isClaimed: boolean;
}

export enum CreditCardTier {
    SILVER = 'SILVER',
    GOLD = 'GOLD',
    PLATINUM = 'PLATINUM', // 1M+
    DIAMOND = 'DIAMOND', // 1B+
    KING = 'KING' // 100B+
}

export interface GameState {
  balance: number;
  clickIncome: number;
  autoIncomePerSecond: number;
  lastSaveTime: number;
  upgrades: {
    click_boost: Upgrade;
    auto_clicker_1: Upgrade;
  };
  businesses: Business[];
  investments: {
    stocks: Stock[];
    realEstate: RealEstate[];
    crypto: Crypto[];
    cars: Car[];
  };
  collections: Collection[];
  tasks: Task[];
}

// Types for App Store mock data (used in constants.ts)
export enum UserRole {
  ADMIN = 'ADMIN',
  DEVELOPER = 'DEVELOPER',
  USER = 'USER',
}

export enum AppStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}

export interface App {
  id: number;
  name: string;
  packageName: string;
  icon: string;
  apkPath: string;
  screenshots: string[];
  description: string;
  longDescription: string;
  status: AppStatus;
  developerId: number;
  developerName: string;
  version: string;
  size: string;
  rating: number;
  downloads: string;
}
