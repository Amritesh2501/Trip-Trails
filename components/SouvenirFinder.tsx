
import React, { useState, useRef, useEffect } from 'react';
import { generateSouvenirs } from '../services/geminiService';
import { SouvenirGuide } from '../types';
import { ShoppingBag, Search, Plane, Globe, ShieldAlert, CheckCircle2, DollarSign, Target, Scan, Box, MapPin, ArrowRight, RefreshCw, Stamp, CreditCard, Clock, FileText, AlertTriangle, X, Download, BadgeCheck, Radar, User, Store, Sparkles, Package, Minus, Plus, Camera, Briefcase, Cloud, Eye, Mountain, PenTool, Hash, LocateFixed, Ship, Car, Train, Anchor, Info, Check, Map as MapIcon, Crosshair, Zap, Lock } from 'lucide-react';
import { applyTheme } from '../utils/theme';

const html2canvas = (window as any).html2canvas;
const jsPDF = (window as any).jspdf.jsPDF;

const BUDGETS = [
    { label: "Thrifty", val: "Budget ($)", color: "bg-neo-green" }, 
    { label: "Standard", val: "Moderate ($$)", color: "bg-neo-blue" }, 
    { label: "Lavish", val: "Splurge ($$$)", color: "bg-neo-pink" }
];

const DURATIONS = [
    { id: "Day", label: "Day Trip", sub: "< 24h" },
    { id: "Weekend", label: "Weekend", sub: "2-3 Days" },
    { id: "Week", label: "Week", sub: "5-7 Days" },
    { id: "Extended", label: "Extended", sub: "7+ Days" },
];

const SCAN_MESSAGES = [
    "TRIANGULATING SIGNALS...",
    "ACCESSING LOCAL GRID...",
    "DETECTING AUTHENTICITY...",
    "FILTERING TOURIST TRAPS...",
    "LOCATING HIDDEN GEMS...",
    "COMPILING ARTIFACT DATA..."
];

const SouvenirFinder: React.FC = () => {
    // Core State
    const [viewState, setViewState] = useState<'config' | 'loading' | 'results'>('config');
    const [destination, setDestination] = useState('');
    const [budget, setBudget] = useState('Moderate ($$)');
    const [duration, setDuration] = useState('Week');
    const [guide, setGuide] = useState<SouvenirGuide | null>(null);
    const [error, setError] = useState<string | null>(null);
    
    // Result View State
    const [activeSection, setActiveSection] = useState<'artifacts' | 'passport'>('artifacts');
    const [foundItems, setFoundItems] = useState<Set<string>>(new Set());
    
    // Stamp Logic
    const [collectedStamps, setCollectedStamps] = useState<Record<string, number>>({});
    const [customStamps, setCustomStamps] = useState<Array<{name: string, location: string, date: string, color: string, style: number}>>([]);
    const [isAddingStamp, setIsAddingStamp] = useState(false);
    const [newStampLocation, setNewStampLocation] = useState('');

    // Visual Feedback State for Stamps (Particles)
    const [particles, setParticles] = useState<{id: number, x: number, y: number, text: string, color: string}[]>([]);
    
    // Animation specific state
    const [loadingStage, setLoadingStage] = useState<'folded' | 'unfolding' | 'searching' | 'centering' | 'locking' | 'zooming' | 'scanning'>('folded');
    const [targetCoords, setTargetCoords] = useState({ x: 50, y: 50 });
    const [scanMessageIndex, setScanMessageIndex] = useState(0);
    
    const passportRef = useRef<HTMLDivElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // --- LOGIC ---

    // Convert Latitude/Longitude to Percentage
    const getCoordinates = (lat: number, lng: number) => {
        const safeLat = Math.max(-90, Math.min(90, lat));
        const safeLng = Math.max(-180, Math.min(180, lng));
        
        const x = ((safeLng + 180) / 360) * 100;
        const y = ((90 - safeLat) / 180) * 100;
        return { x, y };
    };

    const handleScout = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!destination) return;
        
        applyTheme(destination);
        setViewState('loading');
        setLoadingStage('folded'); 
        setError(null);
        setScanMessageIndex(0);
        
        // 1. Unfold
        setTimeout(() => {
            setLoadingStage('unfolding');
            
            // 2. Searching (Panning)
            setTimeout(() => {
                setLoadingStage('searching');
            }, 800);
        }, 100);

        try {
            const results = await generateSouvenirs(destination, budget, duration);
            
            if (results && results.coordinates) {
                 const { lat, lng } = results.coordinates;
                 const coords = getCoordinates(lat, lng);
                 setTargetCoords(coords);
            }

            setGuide(results);
            setFoundItems(new Set());
            setCollectedStamps({});
            setCustomStamps([]);

            setTimeout(() => {
                setLoadingStage('centering'); 

                setTimeout(() => {
                    setLoadingStage('locking'); 

                    setTimeout(() => {
                        setLoadingStage('zooming');

                        setTimeout(() => {
                            setLoadingStage('scanning');

                            // Message Cycling
                            let msgIdx = 0;
                            const msgInterval = setInterval(() => {
                                msgIdx++;
                                if (msgIdx < SCAN_MESSAGES.length) {
                                    setScanMessageIndex(msgIdx);
                                }
                            }, 800);

                            // 7. Results
                            setTimeout(() => {
                                clearInterval(msgInterval);
                                setViewState('results');
                                setActiveSection('artifacts');
                            }, 5000); 

                        }, 2000); // Zoom duration

                    }, 100); // Locking frame delay

                }, 1500); // Centering duration

            }, 2500); // Minimum search duration

        } catch (err) {
            console.error(err);
            setError("Satellite Connection Lost. Please Try Again.");
            setViewState('config'); 
        }
    };

    const handleReset = () => {
        setViewState('config');
        setGuide(null);
        setDestination('');
        setError(null);
    };

    const toggleFound = (itemName: string) => {
        const next = new Set(foundItems);
        if (next.has(itemName)) next.delete(itemName);
        else next.add(itemName);
        setFoundItems(next);
    };

    const updateStampCount = (e: React.MouseEvent | null, stampId: string, delta: number) => {
        if(e) e.stopPropagation();

        setCollectedStamps(prev => {
            const current = prev[stampId] || 0;
            const next = Math.max(0, current + delta);
            const newState = { ...prev };
            
            if (next === 0) delete newState[stampId];
            else newState[stampId] = next;
            
            return newState;
        });

        if (delta > 0 && e) {
            const colors = ["#FF90E8", "#B0FF90", "#90F2FF", "#FFCE63"];
            const randomColor = colors[Math.floor(Math.random() * colors.length)];
            
            const newParticle = {
                id: Date.now(),
                x: e.clientX,
                y: e.clientY,
                text: "STAMPED!",
                color: randomColor
            };
            setParticles(prev => [...prev, newParticle]);
            setTimeout(() => {
                setParticles(prev => prev.filter(p => p.id !== newParticle.id));
            }, 800);
        }
    };

    const handleAddCustomStamp = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newStampLocation.trim()) return;

        const colors = ['text-blue-900 border-blue-900', 'text-red-900 border-red-900', 'text-emerald-900 border-emerald-900', 'text-indigo-900 border-indigo-900'];

        const newStamp = {
            name: 'Custom Visa',
            location: newStampLocation,
            date: new Date().toLocaleDateString(),
            color: colors[Math.floor(Math.random() * colors.length)],
            style: Math.floor(Math.random() * 5)
        };

        setCustomStamps(prev => [...prev, newStamp]);
        setNewStampLocation('');
        setIsAddingStamp(false);
        
        const id = `custom-${newStamp.location}`;
        updateStampCount(null, id, 1);
    };

    const handleDownloadPassport = async () => {
        if (!passportRef.current) return;
        try {
            const element = passportRef.current;
            const canvas = await html2canvas(element, { scale: 2, useCORS: true, backgroundColor: null });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('l', 'mm', 'a4'); 
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`${destination}_Passport.pdf`);
        } catch (err) { console.error("Passport export failed", err); } 
    };

    const getRarityColor = (index: number) => {
        if (index % 3 === 0) return "border-neo-blue bg-neo-blue/10 text-neo-blue"; 
        if (index % 3 === 1) return "border-neo-pink bg-neo-pink/10 text-neo-pink"; 
        return "border-neo-yellow bg-neo-yellow/10 text-neo-yellow"; 
    };

    const renderUniqueStamp = (stamp: any, index: number, count: number, onClick: (() => void) | undefined) => {
        const rotation = (index * 7 + (stamp.name.length * 3)) % 40 - 20;
        const colors = ["text-blue-800 border-blue-800", "text-red-800 border-red-800", "text-emerald-800 border-emerald-800", "text-indigo-800 border-indigo-800"];
        const colorClass = colors[index % colors.length];

        return (
            <div 
                key={index}
                onClick={onClick}
                className={`relative w-24 h-24 md:w-32 md:h-32 border-4 rounded-full flex flex-col items-center justify-center p-2 text-center select-none stamp-3d ${colorClass} ink-multiply`}
                style={{ transform: `rotate(${rotation}deg)` }}
            >
                <div className="absolute inset-1 border border-dashed border-current opacity-50 rounded-full"></div>
                <div className="font-black text-[8px] md:text-[10px] uppercase tracking-widest border-b-2 border-current mb-1 pb-0.5 opacity-80">
                    {stamp.location}
                </div>
                <div className="font-serif font-black text-xs md:text-sm uppercase leading-none mb-1 max-w-full overflow-hidden text-ellipsis">
                    {stamp.name}
                </div>
                <div className="font-mono text-[8px] opacity-70">
                    {new Date().toLocaleDateString()}
                </div>
                {count > 1 && (
                    <div className="absolute -top-2 -right-2 bg-red-600 text-white w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs border-2 border-white shadow-md z-10 transform -rotate-12">
                        {count}
                    </div>
                )}
            </div>
        );
    };

    const renderUniqueCustomStamp = (stamp: any, index: number, count: number) => {
        const rotation = (index * 13) % 30 - 15;
        const shapeClass = stamp.style % 2 === 0 ? "rounded-full" : "rounded-lg";

        return (
            <div 
                key={`custom-${index}`}
                className={`relative w-24 h-24 md:w-32 md:h-32 border-4 ${shapeClass} flex flex-col items-center justify-center p-2 text-center select-none stamp-3d ${stamp.color} ink-multiply`}
                style={{ transform: `rotate(${rotation}deg)` }}
            >
                <div className="absolute inset-1 border-2 border-dotted border-current opacity-30"></div>
                <div className="font-black text-[8px] md:text-[10px] uppercase tracking-widest border-b-2 border-current mb-1 pb-0.5 opacity-80">
                    VISA ENTRY
                </div>
                <div className="font-serif font-black text-xs md:text-sm uppercase leading-none mb-1">
                    {stamp.location}
                </div>
                <div className="font-mono text-[8px] opacity-70">
                    {stamp.date}
                </div>
                 {count > 1 && (
                    <div className="absolute -top-2 -right-2 bg-red-600 text-white w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs border-2 border-white shadow-md z-10 transform -rotate-12">
                        {count}
                    </div>
                )}
            </div>
        );
    };

    const totalCollected = guide ? Object.values(collectedStamps).length : 0;

    return (
        <div className="w-full h-full relative bg-neo-white dark:bg-[#0a0a0a] overflow-hidden flex flex-col font-sans">
            <style>{`
                /* --- PASSPORT VISUALS --- */
                .passport-bg {
                    background-color: #fcfbf9;
                    background-image: 
                        linear-gradient(90deg, transparent 49%, rgba(0,0,0,0.05) 50%, transparent 51%),
                        radial-gradient(#e5e5e5 1px, transparent 1px);
                    background-size: 100% 100%, 20px 20px;
                }
                
                .stamp-3d {
                    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    transform-style: preserve-3d;
                }
                .stamp-3d:hover {
                    transform: translateY(-8px) rotateX(15deg) rotateY(-5deg) scale(1.1);
                    z-index: 50;
                    filter: drop-shadow(0px 15px 10px rgba(0,0,0,0.2));
                }
                .stamp-3d:active {
                    transform: scale(0.95);
                }

                .ink-multiply { mix-blend-mode: multiply; }
                .dark .ink-multiply { mix-blend-mode: normal; }
                
                @keyframes radar-sweep {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                
                @keyframes grid-pan {
                    0% { transform: scale(1.2) translate(0, 0); }
                    25% { transform: scale(1.2) translate(-5px, 5px); }
                    50% { transform: scale(1.2) translate(5px, -5px); }
                    75% { transform: scale(1.2) translate(-5px, 5px); }
                    100% { transform: scale(1.2) translate(0, 0); }
                }

                @keyframes grid-move {
                    0% { background-position: 0 0; }
                    100% { background-position: 50px 50px; }
                }
                
                @keyframes scan-line {
                    0% { top: 0%; opacity: 0; }
                    10% { opacity: 1; }
                    90% { opacity: 1; }
                    100% { top: 100%; opacity: 0; }
                }

                .scan-line {
                    animation: scan-line 2s linear infinite;
                }
            `}</style>

            {particles.map(p => (
                <div 
                    key={p.id}
                    className="fixed z-[100] pointer-events-none feedback-pop font-black text-3xl tracking-widest uppercase border-4 border-current px-4 py-2 rotate-12 shadow-xl"
                    style={{ left: p.x, top: p.y, color: p.color, backgroundColor: 'rgba(255,255,255,0.9)' }}
                >
                    {p.text}
                </div>
            ))}

            {viewState === 'config' && (
                <div className="flex-1 flex flex-col items-center justify-center p-4 animate-slide-up relative z-10 overflow-y-auto">
                    <div className="w-full max-w-lg bg-white dark:bg-[#151515] border-4 border-neo-black dark:border-gray-600 shadow-neo-lg dark:shadow-none p-8 relative">
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-neo-yellow border-2 border-neo-black px-4 py-1 font-black text-xs uppercase tracking-widest shadow-sm">
                            Mission Config
                        </div>

                        <h1 className="text-4xl md:text-5xl font-black font-display uppercase text-center mb-2 text-neo-black dark:text-white leading-none">
                            Souvenir<br/><span className="text-neo-blue">Scout</span>
                        </h1>
                        <p className="text-center font-mono text-xs text-gray-500 mb-8">AUTHENTICITY VERIFICATION // LOCAL ASSETS</p>

                        <form onSubmit={handleScout} className="space-y-6">
                            <div className="relative group">
                                <div className="absolute top-0 left-0 w-full h-full bg-neo-black translate-x-1 translate-y-1 transition-transform group-hover:translate-x-2 group-hover:translate-y-2"></div>
                                <div className="relative bg-white dark:bg-[#222] border-2 border-neo-black dark:border-gray-500 flex items-center p-1">
                                    <div className="bg-neo-black dark:bg-white text-white dark:text-black p-3">
                                        <MapPin size={24} />
                                    </div>
                                    <input 
                                        type="text"
                                        value={destination}
                                        onChange={(e) => setDestination(e.target.value)}
                                        placeholder="TARGET CITY..."
                                        className="flex-1 p-3 font-black uppercase text-base md:text-lg outline-none bg-transparent text-neo-black dark:text-white placeholder:text-gray-300"
                                        autoFocus
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase text-gray-400">Budget Intel</label>
                                    <div className="space-y-1">
                                        {BUDGETS.map(b => (
                                            <button
                                                key={b.val}
                                                type="button"
                                                onClick={() => setBudget(b.val)}
                                                className={`w-full text-left px-3 py-2 border-2 text-xs font-bold uppercase transition-all flex items-center justify-between
                                                    ${budget === b.val ? 'border-neo-black bg-neo-black text-white' : 'border-gray-200 text-gray-400 hover:border-gray-400'}
                                                `}
                                            >
                                                <span>{b.label}</span>
                                                {budget === b.val && <div className={`w-2 h-2 rounded-full ${b.color}`}></div>}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase text-gray-400">Time Window</label>
                                    <div className="grid grid-cols-2 gap-1">
                                        {DURATIONS.map(d => (
                                            <button
                                                key={d.id}
                                                type="button"
                                                onClick={() => setDuration(d.label)}
                                                className={`px-1 py-2 border-2 text-[10px] font-bold uppercase transition-all text-center
                                                    ${duration === d.label ? 'border-neo-blue bg-neo-blue text-neo-black' : 'border-gray-200 text-gray-400 hover:border-gray-400'}
                                                `}
                                            >
                                                {d.id}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <button 
                                type="submit" 
                                disabled={!destination}
                                className="w-full bg-neo-green border-2 border-neo-black p-4 font-black text-xl uppercase hover:translate-y-1 hover:shadow-none shadow-neo transition-all flex items-center justify-center gap-2 group mt-4 text-neo-black"
                            >
                                <Search size={24} className="group-hover:scale-110 transition-transform" />
                                Start Expedition
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {viewState === 'loading' && (
                <div className="fixed inset-0 z-50 bg-[#050505] flex items-center justify-center overflow-hidden perspective-[1000px]">
                    
                    {/* The Map Sheet Container */}
                    <div 
                        className={`
                            relative bg-[#0a0a0a] shadow-[0px_0px_50px_rgba(0,0,0,0.5)] overflow-hidden transition-all duration-1000 ease-in-out border-4 border-neo-green
                            ${loadingStage === 'folded' ? 'w-64 h-48 rotate-6 scale-90' : 'w-[90vw] h-[60vh] md:h-[45vw] max-w-[1200px] max-h-[600px] rotate-0 scale-100'}
                        `}
                    >
                         {/* Map Texture (Blue Marble - Equirectangular) */}
                         <div className="absolute inset-0 w-full h-full overflow-hidden bg-black">
                             <div 
                                className="w-full h-full will-change-transform"
                                style={{
                                    backgroundImage: `url("https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Blue_Marble_2002.png/2000px-Blue_Marble_2002.png")`,
                                    backgroundSize: '100% 100%',
                                    backgroundRepeat: 'no-repeat',
                                    backgroundPosition: 'center',
                                    transformOrigin: (loadingStage === 'zooming' || loadingStage === 'scanning' || loadingStage === 'locking') 
                                        ? `${targetCoords.x}% ${targetCoords.y}%` 
                                        : '50% 50%',
                                    transform: loadingStage === 'searching' 
                                        ? 'scale(1.2)' 
                                        : (loadingStage === 'zooming' || loadingStage === 'scanning') ? 'scale(8)' : 'scale(1)',
                                    transition: loadingStage === 'locking' 
                                        ? 'none' 
                                        : 'transform 1.5s cubic-bezier(0.4, 0, 0.2, 1)',
                                    animation: loadingStage === 'searching' ? 'grid-pan 4s ease-in-out infinite alternate' : 'none',
                                    filter: 'grayscale(1) brightness(0.6) contrast(1.4) sepia(1) hue-rotate(90deg) saturate(2)'
                                }}
                             >
                                 {/* Digital Grid Overlay - ANIMATED */}
                                 <div className="w-full h-full opacity-40 mix-blend-overlay" 
                                    style={{ 
                                        backgroundImage: 'linear-gradient(transparent 95%, #0F0 95%), linear-gradient(90deg, transparent 95%, #0F0 95%)', 
                                        backgroundSize: '50px 50px',
                                        animation: 'grid-move 3s linear infinite'
                                    }} 
                                 />
                             </div>
                         </div>

                         {/* Targeting Reticle */}
                         {(loadingStage === 'locking' || loadingStage === 'zooming' || loadingStage === 'scanning') && (
                             <div 
                                className="absolute z-30 pointer-events-none"
                                style={{
                                    left: `${targetCoords.x}%`,
                                    top: `${targetCoords.y}%`,
                                    transform: 'translate(-50%, -50%)'
                                }}
                             >
                                 <div className={`w-32 h-32 border-2 border-neo-green/60 rounded-full flex items-center justify-center ${loadingStage === 'locking' ? 'scale-150 opacity-0' : 'scale-100 opacity-100 transition-all duration-500'}`}>
                                     <Crosshair className="text-neo-green animate-spin-slow" size={40} strokeWidth={1} />
                                     <div className="absolute w-full h-full border border-neo-green rounded-full animate-ping opacity-30"></div>
                                     <div className="absolute -top-4 text-[10px] font-mono text-neo-green bg-black px-1">TARGET LOCKED</div>
                                 </div>
                             </div>
                         )}

                         {/* Scanner Overlay */}
                         {loadingStage === 'scanning' && (
                             <>
                                 <div className="absolute inset-0 z-20 pointer-events-none">
                                     <div className="w-full h-1 bg-neo-green/50 shadow-[0_0_15px_#0F0] absolute scan-line"></div>
                                 </div>

                                 {/* Radar UI */}
                                 <div className="absolute top-4 right-4 w-24 h-24 rounded-full border border-neo-green/50 bg-black/50 overflow-hidden flex items-center justify-center z-30">
                                      <div className="w-full h-full rounded-full border border-neo-green/20 absolute"></div>
                                      <div className="w-[1px] h-1/2 bg-neo-green/80 absolute top-0 left-1/2 origin-bottom animate-[radar-sweep_2s_linear_infinite] shadow-[0_0_10px_#0F0]"></div>
                                      <div className="w-full h-full bg-[radial-gradient(circle,_rgba(0,255,0,0.1)_0%,_transparent_70%)]"></div>
                                 </div>

                                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40 w-[90%] max-w-[300px]">
                                     {/* HUD Text Panel */}
                                     <div className="bg-black/90 backdrop-blur-md px-6 py-4 border-2 border-neo-green text-neo-green shadow-[0_0_30px_rgba(0,255,0,0.2)] text-center clip-path-polygon">
                                         <div className="flex items-center gap-2 mb-3 justify-center border-b border-neo-green/30 pb-2">
                                             <Scan size={18} className="animate-pulse" />
                                             <span className="font-mono font-bold text-xs tracking-[0.2em] animate-pulse text-neo-white">
                                                 SYSTEM_ANALYSIS
                                             </span>
                                         </div>
                                         <div className="text-white font-black text-3xl uppercase tracking-wider mb-1 drop-shadow-md truncate">{destination}</div>
                                         <div className="text-[10px] font-mono text-neo-green/70 flex justify-between gap-4 mb-3">
                                             <span>LAT: {targetCoords.y.toFixed(4)}</span>
                                             <span>LNG: {targetCoords.x.toFixed(4)}</span>
                                         </div>
                                         
                                         <div className="bg-black border border-neo-green/30 p-2 mb-2">
                                            <div className="font-mono text-xs font-bold text-neo-green animate-pulse">
                                                {SCAN_MESSAGES[scanMessageIndex]}
                                            </div>
                                         </div>

                                         {/* Progress Bar */}
                                         <div className="w-full h-2 bg-gray-900 border border-neo-green/30 rounded-full overflow-hidden">
                                             <div 
                                                className="h-full bg-neo-green shadow-[0_0_10px_#0F0] transition-all duration-300" 
                                                style={{ width: `${(scanMessageIndex + 1) / SCAN_MESSAGES.length * 100}%` }}
                                             ></div>
                                         </div>
                                     </div>
                                 </div>
                             </>
                         )}
                         
                         {/* Searching Overlay */}
                         {loadingStage === 'searching' && (
                             <div className="absolute top-4 left-4 z-20">
                                 <div className="bg-black/80 text-neo-green border border-neo-green px-3 py-1 font-mono text-xs animate-pulse flex items-center gap-2 shadow-[0_0_10px_rgba(0,255,0,0.3)]">
                                     <Globe size={12} className="animate-spin-slow"/> GLOBAL_SCAN_INITIATED...
                                 </div>
                             </div>
                         )}

                         {/* Map HUD Elements (Decorations) */}
                         <div className="absolute bottom-4 left-4 font-mono text-[10px] text-neo-green/60 bg-black/40 px-2 py-1 border border-neo-green/20">
                             COORDS: {loadingStage === 'zooming' || loadingStage === 'scanning' ? `${targetCoords.x.toFixed(2)}, ${targetCoords.y.toFixed(2)}` : 'SCANNING...'}
                         </div>
                    </div>

                    {/* Folded State Cover (The Packet Look) - REFINED */}
                    <div className={`absolute transition-all duration-700 ease-in-out ${loadingStage !== 'folded' ? 'opacity-0 scale-150 pointer-events-none' : 'opacity-100 scale-100'}`}>
                         <div className="bg-[#e6cba8] w-72 h-56 border-t-8 border-b-2 border-l-2 border-r-2 border-[#d4b48d] flex flex-col items-center justify-center shadow-2xl relative rotate-3">
                             {/* Envelope Flap Shadow */}
                             <div className="absolute top-0 w-full h-4 bg-black/10"></div>
                             
                             {/* Top Secret Stamp */}
                             <div className="border-4 border-red-700 text-red-700 px-4 py-2 font-black text-2xl uppercase tracking-widest -rotate-12 opacity-80 mix-blend-multiply" style={{ maskImage: 'url(https://grainy-gradients.vercel.app/noise.svg)' }}>
                                 TOP SECRET
                             </div>

                             {/* Destination Label */}
                             <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-white px-4 py-1 shadow-sm transform -rotate-1 font-mono text-sm text-black border border-gray-300 min-w-[150px] text-center">
                                 CASE: {destination.toUpperCase()}
                             </div>

                             {/* Tape */}
                             <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-16 h-8 bg-yellow-100/80 rotate-2 border-l border-r border-white/50"></div>
                             
                             {/* Security Badge */}
                             <div className="absolute top-4 right-4 text-neo-black opacity-50">
                                 <Lock size={24} />
                             </div>
                         </div>
                    </div>

                </div>
            )}


            {/* =======================
                VIEW 3: DISCOVERY DASHBOARD
               ======================= */}
            {viewState === 'results' && guide && (
                <div className="w-full h-full flex flex-col animate-slide-up relative bg-[#f8f8f8] dark:bg-[#111]">
                    
                    {/* --- Top Bar --- */}
                    <div className="bg-neo-black dark:bg-[#121212] text-white p-4 border-b-4 border-neo-blue flex flex-col md:flex-row justify-between items-center gap-4 shrink-0 z-20">
                        <div className="flex items-center gap-4 w-full md:w-auto">
                            <button onClick={handleReset} className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors shrink-0">
                                <ArrowRight size={20} className="rotate-180" />
                            </button>
                            <div className="min-w-0">
                                <h1 className="text-2xl font-black uppercase leading-none truncate">{destination}</h1>
                                <div className="flex gap-2 text-[10px] font-mono opacity-70 mt-1">
                                    <span>{guide.items.length} ARTIFACTS</span>
                                    <span>•</span>
                                    <span>{totalCollected} COLLECTED</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-[#222] p-1 rounded-full border border-gray-700 flex shrink-0 w-full md:w-auto justify-center">
                            <button 
                                onClick={() => setActiveSection('artifacts')}
                                className={`flex-1 md:flex-none justify-center px-4 md:px-6 py-2 rounded-full font-bold text-xs uppercase transition-all flex items-center gap-2 ${activeSection === 'artifacts' ? 'bg-neo-blue text-neo-black shadow-sm' : 'text-gray-400 hover:text-white'}`}
                            >
                                <Box size={14}/> Artifacts
                            </button>
                            <button 
                                onClick={() => setActiveSection('passport')}
                                className={`flex-1 md:flex-none justify-center px-4 md:px-6 py-2 rounded-full font-bold text-xs uppercase transition-all flex items-center gap-2 ${activeSection === 'passport' ? 'bg-neo-pink text-neo-black shadow-sm' : 'text-gray-400 hover:text-white'}`}
                            >
                                <Stamp size={14}/> Passport
                            </button>
                        </div>
                    </div>

                    {/* --- Main Content Area --- */}
                    <div ref={scrollContainerRef} className="flex-1 overflow-y-auto custom-scrollbar min-h-0">
                        <div className="p-4 md:p-8 pb-32">
                            
                            {/* SECTION: ARTIFACTS (Keep existing) */}
                            {activeSection === 'artifacts' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
                                    {guide.items.map((item, i) => {
                                        const isFound = foundItems.has(item.name);
                                        const borderColor = getRarityColor(i);
                                        return (
                                            <div key={i} onClick={() => toggleFound(item.name)} className={`relative group cursor-pointer transition-all duration-300 ${isFound ? 'translate-y-1' : 'hover:-translate-y-2'}`}>
                                                <div className={`bg-white dark:bg-[#1a1a1a] border-2 h-full flex flex-col shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_#333] transition-colors ${isFound ? 'border-neo-green ring-4 ring-neo-green/20' : 'border-neo-black dark:border-gray-600'}`}>
                                                    <div className={`flex justify-between items-center p-3 border-b-2 bg-gray-50 dark:bg-[#151515] ${isFound ? 'border-neo-green' : 'border-neo-black dark:border-gray-600'}`}>
                                                        <span className="text-[10px] font-black uppercase text-gray-400">{item.category}</span>
                                                        <div className={`px-2 py-0.5 text-[9px] font-bold uppercase border rounded-full ${borderColor}`}>
                                                            {i % 3 === 0 ? "Common" : i % 3 === 1 ? "Rare" : "Legendary"}
                                                        </div>
                                                    </div>
                                                    <div className="p-4 flex-1 flex flex-col gap-3 relative overflow-hidden">
                                                        {isFound && (
                                                            <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none animate-[stamp-slam_0.3s_ease-out_forwards]">
                                                                <div className="border-4 border-neo-green text-neo-green rounded-lg px-4 py-2 -rotate-12 flex flex-col items-center justify-center bg-white/90 dark:bg-black/90 shadow-lg backdrop-blur-sm">
                                                                    <span className="font-black text-xl uppercase tracking-widest">ACQUIRED</span>
                                                                </div>
                                                            </div>
                                                        )}
                                                        <div className={isFound ? 'opacity-40 blur-[1px]' : ''}>
                                                            <h3 className="text-xl font-black uppercase leading-tight mb-1 text-neo-black dark:text-white">{item.name}</h3>
                                                            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-3">{item.description}</p>
                                                        </div>
                                                        <div className="mt-auto pt-3 border-t border-dashed border-gray-300 dark:border-gray-700 flex justify-between items-end">
                                                             <div className="text-xs font-mono font-bold bg-gray-100 dark:bg-[#222] px-2 py-1 rounded dark:text-gray-300">{item.priceRange}</div>
                                                             {isFound ? <CheckCircle2 size={24} className="text-neo-green"/> : <CheckCircle2 size={20} className="text-gray-300"/>}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* SECTION: PASSPORT (OPEN BOOK LAYOUT) */}
                            {activeSection === 'passport' && (
                                <div className="flex flex-col items-center min-h-full">
                                    
                                    <div ref={passportRef} className="w-full max-w-7xl flex flex-col md:flex-row shadow-2xl relative min-h-[85vh] border border-gray-400 bg-gray-800 rounded-md overflow-hidden perspective-[2000px]">
                                        
                                        {/* LEFT PAGE: MY VISAS (Collected) */}
                                        <div className="w-full md:w-1/2 passport-bg p-8 md:p-12 relative border-b md:border-b-0 md:border-r border-gray-300/50 shadow-inner order-1">
                                            <div className="border-b-2 border-neo-black/10 pb-4 mb-10 flex justify-between items-end opacity-70">
                                                <div className="font-serif italic text-base text-gray-600 font-bold">My Visas / Collected</div>
                                                <div className="font-mono text-xs text-gray-400">P. 1</div>
                                            </div>

                                            {/* Render ONLY collected stamps here */}
                                            <div className="grid grid-cols-2 gap-8 md:gap-20 place-items-center content-start">
                                                 {guide.collectibleStamps.map((stamp, i) => {
                                                     const count = collectedStamps[stamp.name] || 0;
                                                     if (count > 0) {
                                                         return renderUniqueStamp(stamp, i, count, () => {}); // No click action on collected stamps
                                                     }
                                                     return null;
                                                 })}
                                                 
                                                 {customStamps.map((stamp, i) => (
                                                     renderUniqueCustomStamp(stamp, i, collectedStamps[`custom-${stamp.location}`] || 0)
                                                 ))}
                                                 
                                                 {/* Empty State Prompt */}
                                                 {Object.keys(collectedStamps).length === 0 && customStamps.length === 0 && (
                                                     <div className="col-span-2 text-center py-20 opacity-30">
                                                         <Stamp size={64} className="mx-auto mb-4"/>
                                                         <p className="font-serif italic text-lg">Your passport pages are empty.</p>
                                                         <p className="text-sm">Complete missions on the right to collect stamps.</p>
                                                     </div>
                                                 )}
                                            </div>
                                        </div>

                                        {/* CENTER SPINE */}
                                        <div className="w-full h-4 md:w-6 md:h-auto bg-gradient-to-b md:bg-gradient-to-r from-[#ddd] via-[#fff] to-[#ddd] shadow-inner z-20 order-2"></div>

                                        {/* RIGHT PAGE: BUREAU (Missions) */}
                                        <div className="w-full md:w-1/2 bg-[#f0eee9] p-8 md:p-12 relative shadow-inner overflow-y-auto order-3">
                                            <div className="border-b-2 border-neo-black/10 pb-4 mb-10 flex justify-between items-end opacity-70">
                                                <div className="font-serif italic text-base text-gray-600 font-bold">Stamp Collection Guide</div>
                                                <div className="font-mono text-xs text-gray-400">P. 2</div>
                                            </div>

                                            <div className="flex flex-col gap-6">
                                                <h3 className="text-xs font-black uppercase text-gray-400 tracking-widest border-b border-gray-300 pb-2">Available Missions</h3>
                                                
                                                {/* Render ALL guide stamps as Descriptive List Items */}
                                                {guide.collectibleStamps.map((stamp, i) => {
                                                     const isCollected = collectedStamps[stamp.name] > 0;
                                                     return (
                                                         <div key={i} className={`flex gap-4 p-4 border-2 rounded-md transition-all ${isCollected ? 'border-gray-300 bg-gray-100 opacity-60' : 'border-white bg-white shadow-sm hover:border-neo-blue'}`}>
                                                             {/* Mini Icon Representation */}
                                                             <div className="shrink-0 w-12 h-12 md:w-16 md:h-16 bg-gray-50 border-2 border-dashed border-gray-300 rounded flex items-center justify-center">
                                                                 {isCollected ? (
                                                                     <CheckCircle2 size={24} className="text-neo-green" />
                                                                 ) : (
                                                                     <Globe size={24} className="text-gray-300" />
                                                                 )}
                                                             </div>
                                                             
                                                             <div className="flex-1 min-w-0">
                                                                 <div className="flex justify-between items-start">
                                                                     <h4 className="font-bold text-sm uppercase text-neo-black truncate pr-2">{stamp.name}</h4>
                                                                     {isCollected && <span className="shrink-0 text-[10px] font-bold bg-neo-green px-1.5 rounded text-neo-black">COLLECTED</span>}
                                                                 </div>
                                                                 <div className="flex items-center gap-1 text-[10px] text-gray-500 font-bold uppercase mb-2">
                                                                     <MapPin size={10} /> {stamp.location}
                                                                 </div>
                                                                 <p className="text-xs font-serif italic text-gray-600 leading-snug mb-3 line-clamp-2">
                                                                     "{stamp.description}"
                                                                 </p>
                                                                 {!isCollected && (
                                                                     <button 
                                                                         onClick={(e) => updateStampCount(e, stamp.name, 1)}
                                                                         className="flex items-center gap-2 bg-neo-black text-white px-3 py-1.5 text-[10px] font-bold uppercase rounded-sm hover:bg-neo-blue hover:text-black transition-colors"
                                                                     >
                                                                         <Stamp size={12} /> Collect Stamp
                                                                     </button>
                                                                 )}
                                                             </div>
                                                         </div>
                                                     );
                                                })}
                                                
                                                {/* Custom Stamp Creator Button Area */}
                                                <div className="mt-8 pt-6 border-t border-gray-300">
                                                    <h3 className="text-xs font-black uppercase text-gray-400 tracking-widest mb-4">Custom Entry</h3>
                                                    {!isAddingStamp ? (
                                                        <button 
                                                            onClick={() => setIsAddingStamp(true)}
                                                            className="w-full border-2 border-dashed border-gray-400 p-4 rounded-md flex items-center justify-center gap-2 text-gray-500 hover:text-neo-blue hover:border-neo-blue hover:bg-white transition-all font-serif italic text-sm"
                                                        >
                                                            <Plus size={16}/> Create a custom visa entry
                                                        </button>
                                                    ) : (
                                                        <div className="bg-white border-2 border-neo-black p-4 rounded-md shadow-lg animate-slide-up">
                                                            <div className="flex justify-between items-center mb-3">
                                                                <span className="font-bold text-xs uppercase">New Visa Entry</span>
                                                                <button onClick={() => setIsAddingStamp(false)}><X size={14}/></button>
                                                            </div>
                                                            <input 
                                                                autoFocus
                                                                value={newStampLocation}
                                                                onChange={(e) => setNewStampLocation(e.target.value)}
                                                                placeholder="Location Name..."
                                                                className="w-full text-base font-serif italic border-b-2 border-gray-200 focus:border-neo-blue outline-none py-1 mb-3"
                                                            />
                                                            <button 
                                                                onClick={handleAddCustomStamp}
                                                                className="w-full bg-neo-black text-white py-2 text-xs font-bold uppercase rounded-sm hover:bg-neo-blue hover:text-black transition-colors"
                                                            >
                                                                Stamp Passport
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                    </div>

                                    {/* Action Footer */}
                                    <div className="mt-8 flex gap-4 pb-20">
                                        <button 
                                            onClick={handleDownloadPassport}
                                            className="bg-neo-black text-white px-6 py-3 font-black text-xs uppercase shadow-neo hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex items-center gap-2 border-2 border-white"
                                        >
                                            <Download size={16}/> Export Passport PDF
                                        </button>
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SouvenirFinder;
