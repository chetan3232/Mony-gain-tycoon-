import { GameState } from '../types';

const LOCAL_STORAGE_KEY = 'moneyTycoonSave';

export const saveGameLocal = (gameState: GameState) => {
  try {
    const serializedState = JSON.stringify(gameState);
    localStorage.setItem(LOCAL_STORAGE_KEY, serializedState);
    console.log("Game saved to local storage.");
  } catch (error) {
    console.error("Error saving game to local storage:", error);
  }
};

export const loadGameLocal = (): GameState | null => {
  try {
    const serializedState = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (serializedState === null) {
      console.log("No local save file found.");
      return null;
    }
    console.log("Game data loaded from local storage!");
    return JSON.parse(serializedState) as GameState;
  } catch (error) {
    console.error("Error loading game from local storage:", error);
    return null;
  }
};
