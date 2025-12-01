
import React, { useContext, useMemo, useState } from 'react';
import { GameContext } from '../contexts/GameContext';
import { formatCurrency } from '../utils/formatters';
import Icon from '../components/Icon';

const ImportExportModal = ({ 
    type, 
    code, 
    onClose, 
    onImport 
}: { 
    type: 'export' | 'import', 
    code?: string, 
    onClose: () => void, 
    onImport?: (code: string) => void 
}) => {
    const [importText, setImportText] = useState('');
    const [copySuccess, setCopySuccess] = useState(false);

    const handleCopy = () => {
        if (code) {
            navigator.clipboard.writeText(code);
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        }
    };

    const downloadFile = () => {
        if (!code) return;
        const blob = new Blob([code], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `money_tycoon_save_${new Date().toISOString().slice(0,10)}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target?.result as string;
            setImportText(text);
        };
        reader.readAsText(file);
    };

    const handleImportSubmit = () => {
        if (onImport && importText.trim()) {
            onImport(importText.trim());
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center animate-fade-in backdrop-blur-sm px-4">
            <div className="bg-[#161b22] w-full max-w-lg rounded-2xl shadow-2xl p-6 border border-gray-700 relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
                    <Icon iconName="fa-times" className="text-xl" />
                </button>
                
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Icon iconName={type === 'export' ? 'fa-file-export' : 'fa-file-import'} className="text-blue-400" />
                    {type === 'export' ? 'Export Save Data' : 'Import Save Data'}
                </h2>

                {type === 'export' ? (
                    <>
                        <p className="text-sm text-gray-400 mb-4">
                            Save your progress securely. You can copy the code or download it as a file to restore later on any device.
                        </p>
                        <div className="relative mb-4">
                            <textarea 
                                readOnly 
                                value={code} 
                                className="w-full h-24 bg-gray-900 border border-gray-700 rounded-xl p-3 text-xs font-mono text-gray-300 outline-none resize-none focus:border-blue-500/50"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <button 
                                onClick={handleCopy}
                                className={`w-full py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                                    copySuccess 
                                    ? 'bg-green-600 text-white' 
                                    : 'bg-blue-600 hover:bg-blue-500 text-white'
                                }`}
                            >
                                <Icon iconName={copySuccess ? "fa-check" : "fa-copy"} />
                                {copySuccess ? 'Copied!' : 'Copy Code'}
                            </button>
                            <button 
                                onClick={downloadFile}
                                className="w-full py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-white border border-gray-600"
                            >
                                <Icon iconName="fa-download" />
                                Download File
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                         <p className="text-sm text-gray-400 mb-4">
                            Restore your progress by pasting your save code or uploading a save file. <span className="text-red-400 font-bold block mt-1">Warning: This will overwrite your current game!</span>
                        </p>
                        
                        <div className="mb-4">
                            <textarea 
                                value={importText}
                                onChange={(e) => setImportText(e.target.value)}
                                placeholder="Paste your save code here..."
                                className="w-full h-24 bg-gray-900 border border-gray-700 rounded-xl p-3 text-xs font-mono text-white outline-none resize-none focus:border-blue-500 mb-3 placeholder-gray-600"
                            />
                            
                            <div className="relative">
                                <input 
                                    type="file" 
                                    accept=".txt" 
                                    onChange={handleFileUpload} 
                                    className="hidden" 
                                    id="file-upload"
                                />
                                <label 
                                    htmlFor="file-upload" 
                                    className="w-full py-2 rounded-xl border border-dashed border-gray-600 text-gray-400 hover:text-white hover:border-gray-500 hover:bg-gray-800/50 cursor-pointer flex items-center justify-center gap-2 transition-all text-sm font-bold"
                                >
                                    <Icon iconName="fa-upload" />
                                    Or Upload Save File (.txt)
                                </label>
                            </div>
                        </div>

                         <button 
                            onClick={handleImportSubmit}
                            disabled={!importText.trim()}
                            className="w-full bg-green-600 hover:bg-green-500 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed text-white py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-900/20"
                        >
                            <Icon iconName="fa-file-import" />
                            Load Game Data
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

const ProfileScreen: React.FC = () => {
  const context = useContext(GameContext);
  const [modalType, setModalType] = useState<'export' | 'import' | null>(null);
  const [exportCode, setExportCode] = useState('');

  if (!context) return null;
  
  const { gameState, manualSaveGame, updateGameState } = context;

  const fortune = useMemo(() => {
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

    const totalFortune = balance + businessValue + stockValue + estateValue + carValue + cryptoValue + collectionValue;

    return {
        balance,
        businessValue,
        stockValue,
        estateValue,
        carValue,
        cryptoValue,
        collectionValue,
        totalFortune
    };
  }, [gameState]);
  
  const FortuneRow: React.FC<{icon: string, label: string, value: number, total: number}> = ({ icon, label, value, total }) => {
    const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
    return (
        <div className="flex items-center space-x-4 p-3 bg-gray-800 rounded-md">
            <Icon iconName={icon} className="text-blue-brand text-2xl w-8 text-center" />
            <div className="flex-grow">
                <div className="flex justify-between items-baseline">
                    <span className="font-semibold">{label}</span>
                    <span className="text-lg font-bold">{formatCurrency(value)}</span>
                </div>
                 <div className="w-full bg-gray-700 rounded-full h-2 mt-1">
                    <div className="bg-blue-brand h-2 rounded-full" style={{width: `${percentage}%`}}></div>
                </div>
            </div>
            <span className="w-12 text-right text-gray-400 text-sm">{percentage}%</span>
        </div>
    );
  };

  const handleExportClick = () => {
      try {
          const data = btoa(JSON.stringify(gameState));
          setExportCode(data);
          setModalType('export');
      } catch (e) {
          console.error("Export failed", e);
          alert("Failed to generate export code.");
      }
  };

  const handleImportSubmit = (code: string) => {
      try {
          const parsed = JSON.parse(atob(code));
          // Basic validation to ensure it's a valid game state
          if (parsed.balance !== undefined && parsed.businesses) {
              updateGameState(() => parsed);
              setModalType(null);
              alert("Game loaded successfully!");
          } else {
              throw new Error("Invalid save format");
          }
      } catch (e) {
          console.error("Import failed", e);
          alert("Invalid save data! Please check the code or file and try again.");
      }
  };

  return (
    <div className="p-4 bg-gray-900 min-h-full">
      <div className="text-center mb-6">
        <p className="text-gray-400">Total Fortune</p>
        <h1 className="text-5xl font-bold text-blue-brand tracking-wider">{formatCurrency(fortune.totalFortune)}</h1>
      </div>

      <div className="bg-gray-950 p-4 rounded-lg space-y-3">
        <h2 className="text-xl font-bold mb-2 border-b border-gray-700 pb-2">Fortune Breakdown</h2>
        <FortuneRow icon="fa-wallet" label="Liquid Cash" value={fortune.balance} total={fortune.totalFortune} />
        <FortuneRow icon="fa-briefcase" label="Business Value" value={fortune.businessValue} total={fortune.totalFortune} />
        <FortuneRow icon="fa-arrow-trend-up" label="Stock Value" value={fortune.stockValue} total={fortune.totalFortune} />
        <FortuneRow icon="fa-building" label="Estate Value" value={fortune.estateValue} total={fortune.totalFortune} />
        <FortuneRow icon="fa-car" label="Car Collection Value" value={fortune.carValue} total={fortune.totalFortune} />
        <FortuneRow icon="fa-bitcoin-sign" label="Crypto Value" value={fortune.cryptoValue} total={fortune.totalFortune} />
        <FortuneRow icon="fa-gem" label="Collection Value" value={fortune.collectionValue} total={fortune.totalFortune} />
      </div>

      <div className="mt-6 space-y-3">
        <button
          onClick={manualSaveGame}
          className="w-full bg-green-brand hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center text-lg shadow-lg"
        >
          <Icon iconName="fa-save" className="mr-3" />
          Save Game
        </button>

        <div className="grid grid-cols-2 gap-3">
             <button
                onClick={handleExportClick}
                className="w-full bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center text-sm border border-gray-700"
              >
                <Icon iconName="fa-file-export" className="mr-2" />
                Export Data
              </button>
              <button
                onClick={() => setModalType('import')}
                className="w-full bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center text-sm border border-gray-700"
              >
                <Icon iconName="fa-file-import" className="mr-2" />
                Import Data
              </button>
        </div>
      </div>
      
      {modalType && (
          <ImportExportModal 
            type={modalType} 
            code={exportCode} 
            onClose={() => setModalType(null)} 
            onImport={handleImportSubmit}
          />
      )}
    </div>
  );
};

export default ProfileScreen;
