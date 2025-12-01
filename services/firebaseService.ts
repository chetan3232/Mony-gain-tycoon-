import { GameState } from '../types';

// Firebase configuration.
// IMPORTANT: Replace these placeholder values with your actual Firebase project credentials.
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

let firebaseApp: any;

export const initializeFirebase = () => {
  const isConfigValid = firebaseConfig.apiKey && !firebaseConfig.apiKey.startsWith('YOUR_');

  if (!isConfigValid) {
    console.warn("Firebase configuration is not set correctly. The game will run without saving to the cloud. Please update firebaseService.ts with your project credentials.");
    const rootEl = document.getElementById('root');
    if (rootEl && !document.getElementById('firebase-warning')) {
        const warningDiv = document.createElement('div');
        warningDiv.id = 'firebase-warning';
        warningDiv.style.cssText = "position: fixed; top: 0; left: 0; right: 0; background-color: #ffc107; color: black; padding: 10px; text-align: center; z-index: 1000; font-family: monospace; font-size: 14px; box-shadow: 0 2px 4px rgba(0,0,0,0.2);";
        warningDiv.innerText = "Firebase not configured. Progress will not be saved.";
        document.body.prepend(warningDiv);
        // Adjust main content padding to not be obscured by the banner
        const mainContent = document.querySelector('main');
        if (mainContent) {
            mainContent.style.paddingTop = '50px';
        }
    }
    return { auth: null, db: null, isEnabled: false };
  }

  // The firebase SDK is loaded via a script tag, so we access it via the window object.
  const firebase = (window as any).firebase;

  if (!firebaseApp) {
    if (!firebase.apps.length) {
        firebaseApp = firebase.initializeApp(firebaseConfig);
    } else {
        firebaseApp = firebase.app();
    }
  }
  return {
    auth: firebase.auth(),
    db: firebase.firestore(),
    isEnabled: true
  };
};

export const saveGame = async (db: any, userId: string, gameState: GameState) => {
  if (!db) return; // Silently fail if Firebase is not initialized
  try {
    await db.collection('players').doc(userId).set(gameState);
  } catch (error) {
    console.error("Error saving game: ", error);
  }
};

export const loadGame = async (db: any, userId: string): Promise<GameState | null> => {
  if (!db) return null; // Silently fail if Firebase is not initialized
  try {
    const doc = await db.collection('players').doc(userId).get();
    if (doc.exists) {
      console.log("Game data loaded!");
      return doc.data() as GameState;
    } else {
      console.log("No saved game found for this user.");
      return null;
    }
  } catch (error) {
    console.error("Error loading game: ", error);
    return null;
  }
};