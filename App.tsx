import React, { useState, useEffect } from 'react';
import TripForm from './components/TripForm';
import ItineraryDisplay from './components/ItineraryDisplay';
import MainMenu from './components/MainMenu';
import SouvenirFinder from './components/SouvenirFinder';
import SmartSuitcase from './components/SmartSuitcase';
import BackgroundLayer from './components/BackgroundLayer';
import { TripItinerary, TripPreferences } from './types';
import { generateItinerary } from './services/geminiService';
import { AlertTriangle, Globe, Moon, Sun, History, Trash2, Home } from 'lucide-react';

const SPLASH_WORDS = ["EXPLORE", "DISCOVER", "TASTE", "VIBE", "WANDER.AI"];
const SPLASH_COLORS = ["bg-neo-yellow", "bg-neo-pink", "bg-neo-green", "bg-neo-blue", "bg-neo-white"];

type AppView = 'menu' | 'planner' | 'souvenirs' | 'suitcase';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>('menu');
  const [itinerary, setItinerary] = useState<TripItinerary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAppLoaded, setIsAppLoaded] = useState(false);
  const [splashIndex, setSplashIndex] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // History
  const [tripHistory, setTripHistory] = useState<TripItinerary[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    // Load history
    const saved = localStorage.getItem('wander_history');
    if (saved) {
        try {
            setTripHistory(JSON.parse(saved));
        } catch (e) {
            console.error("Failed to load history");
        }
    }

    const interval = setInterval(() => {
      setSplashIndex((prev) => prev + 1);
    }, 500);

    const timer = setTimeout(() => {
      setIsAppLoaded(true);
      clearInterval(interval);
    }, 2500);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  const saveToHistory = (trip: TripItinerary) => {
      const newHistory = [trip, ...tripHistory].slice(0, 5); // Keep last 5
      setTripHistory(newHistory);
      localStorage.setItem('wander_history', JSON.stringify(newHistory));
  };

  const clearHistory = () => {
      setTripHistory([]);
      localStorage.removeItem('wander_history');
      setShowHistory(false);
  };

  const handleFormSubmit = async (prefs: TripPreferences) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await generateItinerary(prefs);
      setItinerary(result);
      saveToHistory(result);
    } catch (err: any) {
      let errorMessage = "SYSTEM_ERR: COULD_NOT_GENERATE";
      const errorString = err.toString();
      if (errorString.includes("xhr error") || (err.message && err.message.includes("xhr error"))) {
        errorMessage = "TIMEOUT_ERR: AI_TOOK_TOO_LONG. RETRY_REQUEST.";
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setItinerary(null);
    setError(null);
  };

  if (!isAppLoaded) {
    const currentWord = SPLASH_WORDS[Math.min(splashIndex, SPLASH_WORDS.length - 1)];
    const currentColor = SPLASH_COLORS[splashIndex % SPLASH_COLORS.length];
    
    return (
      <div className={`fixed inset-0 ${currentColor} flex flex-col items-center justify-center z-50 border-8 border-neo-black transition-colors duration-300`}>
        <div className="relative">
          <div className="absolute top-2 left-2 w-full h-full bg-neo-black -z-10"></div>
          <div className="bg-white border-4 border-neo-black p-8 shadow-neo-lg">
             <div className="text-3xl md:text-5xl lg:text-8xl font-black font-display tracking-tighter animate-pulse">
                {currentWord}
             </div>
          </div>
        </div>
        <div className="mt-12 flex gap-2">
            {[0, 1, 2].map((i) => (
                <div key={i} className={`w-4 h-4 rounded-full border-2 border-neo-black bg-neo-black animate-bounce`} style={{ animationDelay: `${i * 100}ms`}}></div>
            ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`${isDarkMode ? 'dark' : ''} h-[100dvh] w-screen overflow-hidden relative`}>
        
        {/* Dynamic Background Layer */}
        <BackgroundLayer />

        <div className="h-full w-full flex flex-col items-center justify-center bg-neo-bg dark:bg-[#050505] font-sans p-2 md:p-4 transition-colors duration-300 relative z-10">
            
            <div className={`
                transition-all duration-500 ease-in-out bg-neo-white dark:bg-[#0a0a0a] border-3 border-neo-black dark:border-gray-700 shadow-neo-lg dark:shadow-none flex flex-col overflow-hidden relative
                ${itinerary && view === 'planner'
                    ? 'w-full max-w-[1600px] h-full md:h-[95vh] rounded-sm' 
                    : 'w-full max-w-6xl h-full md:h-[90vh] rounded-sm'}
            `}>
                
                {/* Header */}
                <div className="bg-neo-black dark:bg-[#121212] text-neo-white border-b-3 border-neo-black dark:border-gray-800 p-2 md:p-3 flex justify-between items-center shrink-0 z-40">
                    <div className="flex items-center gap-2">
                        <Globe size={16} className="text-neo-blue animate-spin-slow" />
                        <span className="ml-2 font-mono font-bold tracking-wider text-sm md:text-base">WANDER_OS_V2.1.exe</span>
                    </div>
                    <div className="flex items-center gap-4">
                         {view !== 'menu' && (
                             <button 
                                onClick={() => setView('menu')}
                                className="font-mono text-xs font-bold hover:text-neo-blue flex items-center gap-1 bg-neo-darkgray border border-white/20 px-2 py-1"
                             >
                                <Home size={14} /> MENU
                             </button>
                         )}
                        {view === 'planner' && !itinerary && tripHistory.length > 0 && (
                            <button 
                                onClick={() => setShowHistory(!showHistory)}
                                className="font-mono text-xs font-bold hover:text-neo-pink flex items-center gap-1"
                            >
                                <History size={14} /> HISTORY
                            </button>
                        )}
                        <button 
                            onClick={() => setIsDarkMode(!isDarkMode)}
                            className="p-1 hover:text-neo-yellow transition-colors"
                            title="Toggle Theme"
                        >
                            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                        </button>
                    </div>
                </div>

                {/* History Dropdown */}
                {showHistory && view === 'planner' && !itinerary && (
                    <div className="absolute top-12 right-2 md:right-4 z-50 w-64 bg-neo-white dark:bg-[#1A1A1A] border-3 border-neo-black dark:border-gray-600 shadow-neo">
                        <div className="p-2 border-b-2 border-neo-black dark:border-gray-600 flex justify-between items-center bg-gray-100 dark:bg-[#222]">
                            <span className="font-black text-xs uppercase text-neo-black dark:text-white">Recent Trips</span>
                            <button onClick={clearHistory} className="text-red-500 hover:bg-red-100 dark:hover:bg-red-900 p-1 rounded"><Trash2 size={12}/></button>
                        </div>
                        <div className="max-h-64 overflow-y-auto">
                            {tripHistory.map((trip, idx) => (
                                <button 
                                    key={idx}
                                    onClick={() => { setItinerary(trip); setShowHistory(false); }}
                                    className="w-full text-left p-3 border-b border-neo-black/20 dark:border-white/10 hover:bg-neo-yellow dark:hover:bg-gray-800 transition-colors text-neo-black dark:text-gray-200"
                                >
                                    <div className="font-bold text-sm uppercase">{trip.destination}</div>
                                    <div className="text-xs font-mono opacity-70">{trip.days.length} DAYS</div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Main Content Area */}
                <div className="relative flex-1 overflow-hidden flex flex-col bg-neo-white dark:bg-[#0a0a0a]">
                    
                    {view === 'menu' && (
                        <MainMenu onSelect={(v) => setView(v)} />
                    )}

                    {view === 'souvenirs' && (
                        <SouvenirFinder />
                    )}

                    {view === 'suitcase' && (
                        <SmartSuitcase />
                    )}

                    {view === 'planner' && (
                        itinerary ? (
                            <ItineraryDisplay itinerary={itinerary} onReset={handleReset} isDarkMode={isDarkMode} />
                        ) : (
                            <div className={`p-4 md:p-10 flex flex-col items-center overflow-y-auto custom-scrollbar h-full ${isLoading ? 'justify-center' : ''} relative`}>
                                {!isLoading && (
                                    <div className="mb-4 md:mb-8 text-center relative w-full shrink-0">
                                        <div className="absolute -top-6 -right-4 bg-neo-pink text-neo-black font-black text-xs px-2 py-1 border-2 border-neo-black dark:border-neo-white shadow-neo-sm dark:shadow-neo-sm-white transform rotate-12 animate-bounce hidden md:block">
                                            NEW!
                                        </div>
                                        <h1 className="text-3xl md:text-6xl font-display font-black tracking-tighter mb-2 leading-[0.9] dark:text-neo-white">
                                            TRIP<br/>
                                            <span className="text-neo-blue text-stroke-3 dark:text-stroke-white">ADVISOR</span>
                                        </h1>
                                        <p className="font-bold text-xs md:text-lg mt-2 bg-neo-yellow text-neo-black inline-block px-4 py-1 border-2 border-neo-black dark:border-neo-white shadow-neo-sm dark:shadow-neo-sm-white">
                                            AI-POWERED ITINERARY BOT
                                        </p>
                                    </div>
                                )}

                                <div className="w-full shrink-0 relative z-10">
                                    <TripForm onSubmit={handleFormSubmit} isLoading={isLoading} />
                                </div>

                                {error && (
                                    <div className="mt-8 w-full bg-neo-pink border-3 border-neo-black dark:border-neo-white shadow-neo dark:shadow-neo-white p-4 flex items-center gap-4 animate-slide-up shrink-0 text-neo-black">
                                        <AlertTriangle size={32} strokeWidth={3} />
                                        <div>
                                            <h4 className="font-black uppercase">Error Detected</h4>
                                            <p className="font-mono text-sm font-bold">{error}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )
                    )}
                </div>
                
                {/* Footer */}
                <div className="shrink-0 border-t-3 border-neo-black dark:border-gray-800 bg-gray-100 dark:bg-[#121212] p-2 font-mono text-[10px] md:text-xs flex justify-between items-center text-gray-500 dark:text-gray-400">
                    <span>MODULE: {view.toUpperCase()}</span>
                    <span>DESIGNED BY AMRITESH</span>
                </div>
            </div>
        </div>
    </div>
  );
};

export default App;