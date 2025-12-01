
import { createContext } from 'react';
import { GameState } from '../types';

interface GameContextType {
  gameState: GameState;
  updateGameState: (updater: (prevState: GameState) => GameState) => void;
  incrementBalance: (amount: number) => void;
  manualSaveGame: () => void;
}

export const GameContext = createContext<GameContextType | undefined>(undefined);
