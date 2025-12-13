import React, { useState, useRef, useEffect } from 'react';
import { generateSouvenirs } from '../services/geminiService';
import { SouvenirGuide, Souvenir } from '../types';
import { ShoppingBag, Search, RefreshCw, Tag, AlertCircle, TrendingDown, Ban, DollarSign, ShieldAlert, CheckCircle2, Stamp, Filter, Download, Plane, Globe, CheckSquare, Square, FileCheck, Star, Zap, Smile, Cloud, Gift, Sparkles, Map, MapPin, Gem, Coins, Crown } from 'lucide-react';
import { applyTheme } from '../utils/theme';

const html2canvas = (window as any).html2canvas;
const jsPDF = (window as any).jspdf.jsPDF;

const BUDGETS = ["Budget ($)", "Moderate ($$)", "Splurge ($$$)"];
const CATEGORIES = ["All", "Traditional", "Food", "Art", "Modern", "Kitsch"];
const DURATIONS = ["Day Trip", "Weekend (2-3 days)", "Week (5-7 days)", "Extended (2+ weeks)"];

const LOADING_TEXTS = [
    "UNLOCKING VAULT...",
    "APPRAISING GEMS...",
    "POLISHING ARTIFACTS...",
    "DISCOVERING LOOT...",
    "AUTHENTICATING FINDS..."
];

const TREASURE_ICONS = [
    { Icon: Gem, color: 'text-neo-pink' },
    { Icon: Coins, color: 'text-neo-yellow' },
    { Icon: Crown, color: 'text-neo-blue' },
    { Icon: Star, color: 'text-neo-green' },
    { Icon: Map, color: 'text-neo-purple' }
];

const SouvenirFinder: React.FC = () => {
    const [destination, setDestination] = useState('');
    const [budget, setBudget] = useState('Moderate ($$)');
    const [duration, setDuration] = useState('Week (5-7 days)');
    const [guide, setGuide] = useState<SouvenirGuide | null>(null);
    const [loading, setLoading] = useState(false);
    
    // View State
    const [activeTab, setActiveTab] = useState<'treasures' | 'passport'>('treasures');
    const [filterCategory, setFilterCategory] = useState('All');
    
    // Interactive State
    const [foundItems, setFoundItems] = useState<Set<string>>(new Set());
    const [collectedStamps, setCollectedStamps] = useState<Set<string>>(new Set());
    
    // Loading Animation State
    const [loadingTextIndex, setLoadingTextIndex] = useState(0);

    const passportRef = useRef<HTMLDivElement>(null);
    const checklistRef = useRef<HTMLDivElement>(null);
    const [isDownloading, setIsDownloading] = useState(false);
    const [isDownloadingList, setIsDownloadingList] = useState(false);

    useEffect(() => {
        let interval: any;
        if (loading) {
            setLoadingTextIndex(0);
            interval = setInterval(() => {
                setLoadingTextIndex(prev => (prev + 1) % LOADING_TEXTS.length);
            }, 1200);
        }
        return () => clearInterval(interval);
    }, [loading]);

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!destination) return;
        
        applyTheme(destination);
        setLoading(true);
        try {
            const results = await generateSouvenirs(destination, budget, duration);
            setGuide(results);
            setFoundItems(new Set());
            setCollectedStamps(new Set());
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const toggleFound = (itemName: string) => {
        const next = new Set(foundItems);
        if (next.has(itemName)) next.delete(itemName);
        else next.add(itemName);
        setFoundItems(next);
    };

    const toggleStamp = (stampName: string) => {
        const next = new Set(collectedStamps);
        if (next.has(stampName)) next.delete(stampName);
        else next.add(stampName);
        setCollectedStamps(next);
    };

    const handleDownloadPassport = async () => {
        if (!passportRef.current) return;
        setIsDownloading(true);
        try {
            const element = passportRef.current;
            const canvas = await html2canvas(element, { 
                scale: 2,
                useCORS: true,
                backgroundColor: null, 
            });
            
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`${destination}_Passport_Stamps.pdf`);
        } catch (err) {
            console.error("Passport export failed", err);
        } finally {
            setIsDownloading(false);
        }
    };

    const handleDownloadFoundList = async () => {
        if (!checklistRef.current || !guide) return;
        setIsDownloadingList(true);
        try {
            const element = checklistRef.current;
            
            // Capture the styled hidden container
            const canvas = await html2canvas(element, { 
                scale: 2,
                useCORS: true,
                backgroundColor: '#FFFDF5'
            });
            
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`${destination}_Souvenir_Checklist.pdf`);
        } catch (e) {
            console.error(e);
        } finally {
            setIsDownloadingList(false);
        }
    };

    const filteredItems = guide?.items.filter(item => 
        filterCategory === 'All' || item.category === filterCategory
    ) || [];

    return (
        <div className="w-full h-full flex flex-col md:flex-row gap-6 p-4 md:p-8 animate-slide-up overflow-hidden">
             <style>
                {`
                .preserve-3d { transform-style: preserve-3d; }
                
                @keyframes float-chest {
                    0%, 100% { transform: rotateX(60deg) rotateZ(30deg) translateY(0px); }
                    50% { transform: rotateX(60deg) rotateZ(30deg) translateY(-20px); }
                }

                @keyframes float-out {
                    0% { transform: translateZ(0) translateY(0) scale(0) rotate(0deg); opacity: 0; }
                    20% { opacity: 1; }
                    80% { opacity: 1; }
                    100% { transform: translateZ(180px) translateY(-120px) scale(1.5) rotate(360deg); opacity: 0; }
                }

                .chest-container {
                    animation: float-chest 3s ease-in-out infinite;
                }

                .treasure-item {
                    animation: float-out 2.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
                }
                `}
             </style>

            {/* Control Panel */}
            <div className="w-full md:w-1/3 bg-neo-white dark:bg-neo-darkgray border-4 border-neo-black dark:border-neo-white shadow-neo dark:shadow-neo-white p-6 flex flex-col gap-6 h-fit overflow-y-auto">
                <div className="border-b-4 border-neo-black dark:border-neo-white pb-4 shrink-0">
                    <h2 className="text-3xl font-black font-display uppercase leading-none text-neo-black dark:text-neo-white">SOUVENIR<br/><span className="text-neo-pink">SCOUT</span></h2>
                </div>
                
                <form onSubmit={handleGenerate} className="flex flex-col gap-4 shrink-0">
                    <div>
                        <label className="font-bold text-xs uppercase mb-1 block text-neo-black dark:text-neo-white">Destination</label>
                        <input 
                            type="text" 
                            value={destination}
                            onChange={(e) => setDestination(e.target.value)}
                            placeholder="E.G. ISTANBUL" 
                            className="w-full border-3 border-neo-black dark:border-neo-white p-3 font-mono font-bold focus:bg-neo-yellow focus:outline-none text-neo-black"
                            required
                        />
                    </div>
                    <div>
                        <label className="font-bold text-xs uppercase mb-1 block text-neo-black dark:text-neo-white">Budget Range</label>
                        <div className="flex flex-col gap-2">
                            {BUDGETS.map(b => (
                                <button
                                    key={b}
                                    type="button"
                                    onClick={() => setBudget(b)}
                                    className={`p-2 border-2 border-neo-black dark:border-neo-white text-xs font-bold uppercase transition-all text-left
                                        ${budget === b ? 'bg-neo-black text-neo-white dark:bg-neo-white dark:text-neo-black' : 'bg-white dark:bg-transparent text-neo-black dark:text-neo-white hover:bg-gray-200'}
                                    `}
                                >
                                    {b}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="font-bold text-xs uppercase mb-1 block text-neo-black dark:text-neo-white">Duration</label>
                        <select 
                            value={duration}
                            onChange={(e) => setDuration(e.target.value)}
                            className="w-full border-3 border-neo-black dark:border-neo-white p-3 font-mono font-bold bg-white text-neo-black focus:bg-neo-yellow focus:outline-none"
                        >
                            {DURATIONS.map(d => (
                                <option key={d} value={d}>{d}</option>
                            ))}
                        </select>
                    </div>
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="bg-neo-pink border-3 border-neo-black dark:border-neo-white p-4 font-black uppercase hover:shadow-neo-sm transition-all flex items-center justify-center gap-2 text-neo-black"
                    >
                        {loading ? <RefreshCw className="animate-spin" /> : <Search fill="black" size={20} />}
                        {loading ? 'Scouting...' : 'Find Treasures'}
                    </button>
                </form>

                {guide && !loading && (
                    <div className="flex flex-col gap-4 animate-slide-up">
                        {/* HAGGLE-O-METER */}
                        <div className="bg-neo-blue border-3 border-neo-black dark:border-neo-white p-4 text-neo-black">
                            <h3 className="font-black uppercase text-sm mb-2 flex items-center gap-2">
                                <DollarSign size={16}/> Haggle-o-Meter
                            </h3>
                            <div className={`
                                p-2 border-2 border-neo-black text-center font-black uppercase text-sm mb-3
                                ${guide.negotiationStyle === 'Fixed Price' ? 'bg-red-400' : 
                                  guide.negotiationStyle === 'Aggressive Bargaining' ? 'bg-green-400' : 'bg-neo-yellow'}
                            `}>
                                {guide.negotiationStyle}
                            </div>
                            <ul className="text-xs font-bold space-y-1 list-disc pl-4">
                                {guide.negotiationTips.map((tip, i) => (
                                    <li key={i}>{tip}</li>
                                ))}
                            </ul>
                        </div>

                        {/* CONTRABAND CHECK */}
                        <div className="bg-stripes-yellow-black border-3 border-neo-black dark:border-neo-white p-4 relative overflow-hidden">
                             <div className="absolute inset-0 opacity-10 bg-[repeating-linear-gradient(45deg,yellow,yellow_10px,black_10px,black_20px)]"></div>
                             <div className="relative z-10 bg-neo-white dark:bg-neo-black border-2 border-neo-black dark:border-neo-white p-3">
                                <h3 className="font-black uppercase text-sm mb-2 flex items-center gap-2 text-red-500">
                                    <Ban size={16}/> Restricted Items
                                </h3>
                                <ul className="text-xs font-mono font-bold space-y-1 text-neo-black dark:text-neo-white">
                                    {guide.restrictedItems.map((item, i) => (
                                        <li key={i} className="flex items-center gap-2">
                                            <ShieldAlert size={12} className="text-red-500"/> {item}
                                        </li>
                                    ))}
                                </ul>
                             </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Content Display */}
            <div className="flex-1 bg-neo-black dark:bg-neo-white border-4 border-neo-black dark:border-neo-white p-1 relative overflow-hidden flex flex-col">
                <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                     <Tag size={400} className="absolute -right-20 -bottom-20 text-white dark:text-black transform -rotate-12" />
                </div>

                <div className="bg-white dark:bg-neo-darkgray h-full w-full border-2 border-white dark:border-neo-black p-4 md:p-8 overflow-y-auto custom-scrollbar relative z-10">
                    {loading ? (
                         <div className="h-full flex flex-col items-center justify-center relative perspective-[1200px] overflow-hidden">
                            {/* 3D Treasure Chest 
                                Dimensions: W=48 (192px), H=32 (128px), Walls=20 (80px)
                            */}
                            <div className="relative w-48 h-32 preserve-3d mb-16 chest-container" style={{ transform: 'rotateX(60deg) rotateZ(30deg)' }}>
                                 
                                 {/* Base */}
                                 <div className="absolute inset-0 bg-neo-yellow border-4 border-neo-black shadow-lg" style={{ transform: 'translateZ(0)' }}>
                                     {/* Coin Pile Effect inside */}
                                     <div className="absolute inset-2 bg-neo-yellow border-2 border-neo-black opacity-50"></div>
                                 </div>
                                 
                                 {/* Front Wall */}
                                 <div className="absolute bottom-0 left-0 w-full h-20 bg-neo-yellow border-4 border-neo-black origin-bottom flex justify-center items-center" 
                                      style={{ transform: 'rotateX(90deg)' }}>
                                      {/* Lock */}
                                      <div className="w-8 h-10 bg-neo-black rounded-b-lg border-2 border-white/20"></div>
                                 </div>

                                 {/* Back Wall */}
                                 <div className="absolute top-0 left-0 w-full h-20 bg-amber-400 border-4 border-neo-black origin-top" 
                                      style={{ transform: 'rotateX(-90deg)' }}></div>
                                 
                                 {/* Left Wall */}
                                 <div className="absolute top-0 left-0 h-full w-20 bg-amber-300 border-4 border-neo-black origin-left" 
                                      style={{ transform: 'rotateY(-90deg)' }}></div>
                                 
                                 {/* Right Wall */}
                                 <div className="absolute top-0 right-0 h-full w-20 bg-amber-300 border-4 border-neo-black origin-right" 
                                      style={{ transform: 'rotateY(90deg)' }}></div>

                                 {/* Floating Loot Items (Animated) */}
                                 <div className="absolute inset-0 flex items-center justify-center preserve-3d">
                                      {TREASURE_ICONS.map((t, i) => (
                                          <div key={i} className="absolute treasure-item" style={{ animationDelay: `${i * 0.5}s` }}>
                                              <t.Icon size={36} className={t.color} strokeWidth={3} fill="white" style={{ filter: 'drop-shadow(2px 2px 0px rgba(0,0,0,1))' }} />
                                          </div>
                                      ))}
                                 </div>

                                 {/* Lid (Open) - Hinged at Back Top Edge (Z=80px) */}
                                 <div className="absolute top-0 left-0 w-full h-full preserve-3d origin-top" 
                                      style={{ transform: 'translateZ(80px) rotateX(-120deg)' }}>
                                      
                                      {/* Lid Inner Face */}
                                      <div className="absolute inset-0 bg-neo-yellow border-4 border-neo-black backface-hidden flex items-center justify-center">
                                          <div className="w-[80%] h-[80%] border-2 border-neo-black opacity-20"></div>
                                      </div>
                                      
                                      {/* Lid Outer Face */}
                                      <div className="absolute inset-0 bg-amber-500 border-4 border-neo-black" style={{ transform: 'translateZ(20px)' }}></div>
                                      
                                      {/* Lid Walls */}
                                      <div className="absolute top-0 w-full h-5 bg-amber-500 border-x-4 border-t-4 border-neo-black origin-top" style={{ transform: 'rotateX(90deg)' }}></div>
                                      <div className="absolute bottom-0 w-full h-5 bg-amber-500 border-x-4 border-b-4 border-neo-black origin-bottom" style={{ transform: 'rotateX(-90deg)' }}></div>
                                      <div className="absolute left-0 h-full w-5 bg-amber-600 border-y-4 border-l-4 border-neo-black origin-left" style={{ transform: 'rotateY(-90deg)' }}></div>
                                      <div className="absolute right-0 h-full w-5 bg-amber-600 border-y-4 border-r-4 border-neo-black origin-right" style={{ transform: 'rotateY(90deg)' }}></div>
                                 </div>

                            </div>

                            <div className="mt-8 font-black font-display text-2xl uppercase animate-pulse text-neo-black dark:text-neo-white text-center tracking-widest bg-neo-pink px-4 py-1 border-2 border-neo-black shadow-neo-sm transform rotate-1">
                                {LOADING_TEXTS[loadingTextIndex]}
                            </div>
                        </div>
                    ) : !guide ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-50">
                            <ShoppingBag size={64} className="mb-4" />
                            <p className="font-black font-display text-2xl uppercase">CATALOG EMPTY</p>
                        </div>
                    ) : (
                        <div>
                             <div className="flex justify-between items-end border-b-4 border-neo-black dark:border-neo-white pb-4 mb-6">
                                <div>
                                    <h3 className="font-black text-2xl md:text-4xl uppercase text-neo-black dark:text-neo-white">{destination}</h3>
                                    <div className="flex gap-2 mt-2">
                                        <button 
                                            onClick={() => setActiveTab('treasures')}
                                            className={`px-3 py-1 font-black text-xs uppercase border-2 border-neo-black dark:border-neo-white transition-all
                                                ${activeTab === 'treasures' ? 'bg-neo-blue text-neo-black shadow-neo-sm' : 'bg-transparent text-gray-500 dark:text-gray-300'}
                                            `}
                                        >
                                            Treasure Hunt
                                        </button>
                                        <button 
                                            onClick={() => setActiveTab('passport')}
                                            className={`px-3 py-1 font-black text-xs uppercase border-2 border-neo-black dark:border-neo-white transition-all
                                                ${activeTab === 'passport' ? 'bg-neo-pink text-neo-black shadow-neo-sm' : 'bg-transparent text-gray-500 dark:text-gray-300'}
                                            `}
                                        >
                                            Stamp Passport
                                        </button>
                                    </div>
                                </div>
                                <div className="text-right flex flex-col items-end">
                                    {activeTab === 'treasures' ? (
                                        <>
                                            <div className="font-mono text-xs font-bold text-neo-black dark:text-neo-white mb-2">
                                                FOUND: {foundItems.size} / {guide.items.length}
                                            </div>
                                            <button 
                                                onClick={handleDownloadFoundList}
                                                disabled={isDownloadingList}
                                                className="bg-neo-black text-white px-3 py-1 font-bold uppercase text-[10px] flex items-center gap-1 hover:bg-neo-green hover:text-black transition-colors border-2 border-transparent hover:border-neo-black"
                                            >
                                                {isDownloadingList ? <RefreshCw size={12} className="animate-spin"/> : <FileCheck size={12} />} 
                                                Export Checklist
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <div className="font-mono text-xs font-bold text-neo-black dark:text-neo-white mb-2">
                                                COLLECTED: {collectedStamps.size} / {guide.collectibleStamps.length}
                                            </div>
                                            <button 
                                                onClick={handleDownloadPassport}
                                                disabled={isDownloading}
                                                className="bg-neo-black text-white px-3 py-1 font-bold uppercase text-[10px] flex items-center gap-1 hover:bg-neo-green hover:text-black transition-colors border-2 border-transparent hover:border-neo-black"
                                            >
                                                {isDownloading ? <RefreshCw size={12} className="animate-spin"/> : <Download size={12} />} 
                                                Save PDF
                                            </button>
                                        </>
                                    )}
                                </div>
                             </div>

                             {/* SOUVENIR TREASURE HUNT VIEW */}
                             {activeTab === 'treasures' && (
                                <>
                                    {/* Filters */}
                                    <div className="flex flex-wrap gap-2 mb-6">
                                        <div className="flex items-center gap-1 text-xs font-bold uppercase text-gray-500 mr-2">
                                            <Filter size={12}/> Filter:
                                        </div>
                                        {CATEGORIES.map(cat => (
                                            <button
                                                key={cat}
                                                onClick={() => setFilterCategory(cat)}
                                                className={`
                                                    px-3 py-1 rounded-full border border-neo-black dark:border-neo-white text-[10px] font-bold uppercase transition-all
                                                    ${filterCategory === cat 
                                                        ? 'bg-neo-yellow text-neo-black' 
                                                        : 'bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-neo-black dark:text-neo-white'}
                                                `}
                                            >
                                                {cat}
                                            </button>
                                        ))}
                                    </div>

                                    {filteredItems.length === 0 ? (
                                        <div className="text-center py-10 text-gray-400 font-mono text-sm">No items found in this category.</div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {filteredItems.map((item, i) => {
                                                const isFound = foundItems.has(item.name);
                                                return (
                                                    <div 
                                                        key={i} 
                                                        className={`
                                                            border-3 border-neo-black dark:border-neo-white p-4 flex flex-col gap-2 transition-all relative group
                                                            ${isFound 
                                                                ? 'bg-gray-100 dark:bg-gray-800 opacity-70 grayscale' 
                                                                : 'bg-gray-50 dark:bg-black/20 hover:-translate-y-1 hover:shadow-neo-sm dark:hover:shadow-neo-sm-white'}
                                                        `}
                                                    >
                                                        <div className="flex items-start gap-3">
                                                            {/* Interactive Checkbox */}
                                                            <button 
                                                                onClick={(e) => { e.stopPropagation(); toggleFound(item.name); }}
                                                                className={`
                                                                    min-w-[24px] h-[24px] border-2 border-neo-black dark:border-neo-white flex items-center justify-center transition-colors hover:scale-110
                                                                    ${isFound ? 'bg-neo-green' : 'bg-white hover:bg-gray-100'}
                                                                `}
                                                            >
                                                                {isFound && <CheckSquare size={16} className="text-neo-black" />}
                                                            </button>
                                                            
                                                            <div className="flex-1">
                                                                <div className="flex justify-between items-start mb-1">
                                                                    <div className="bg-neo-black text-white px-2 py-1 text-[10px] font-bold uppercase">{item.category}</div>
                                                                    <div className="font-mono font-bold text-sm text-neo-green bg-black px-1">{item.priceRange}</div>
                                                                </div>
                                                                
                                                                <h4 className={`font-black text-xl uppercase text-neo-black dark:text-neo-white leading-tight mt-1 ${isFound ? 'line-through' : ''}`}>{item.name}</h4>
                                                                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{item.description}</p>
                                                            </div>
                                                        </div>
                                                        
                                                        {/* Authenticity Tip */}
                                                        {!isFound && (
                                                            <div className="mt-auto pt-4 pl-9">
                                                                <div className="bg-neo-yellow/30 border-l-4 border-neo-yellow p-2 text-xs text-neo-black dark:text-neo-white">
                                                                    <div className="flex items-center gap-1 font-bold mb-1 uppercase text-neo-black dark:text-neo-white">
                                                                        <AlertCircle size={12} /> Authenticity Check:
                                                                    </div>
                                                                    {item.authenticityTip}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Found Overlay Badge */}
                                                        {isFound && (
                                                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                                <div className="bg-neo-green text-neo-black font-black text-lg border-4 border-neo-black p-4 rotate-[-12deg] shadow-neo">
                                                                    COLLECTED!
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </>
                             )}

                             {/* STAMP PASSPORT VIEW */}
                             {activeTab === 'passport' && (
                                 <div ref={passportRef} className="bg-[#fdfbf7] border-4 border-neo-black p-8 min-h-[600px] relative shadow-lg mx-auto max-w-2xl">
                                     {/* Paper texture overlay hint (CSS ONLY) */}
                                     <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[radial-gradient(#000_0.5px,transparent_0.5px)] [background-size:8px_8px]"></div>
                                     <div className="absolute inset-0 opacity-[0.02] bg-yellow-500 pointer-events-none mix-blend-multiply"></div>
                                     
                                     {/* Passport Header */}
                                     <div className="border-b-4 border-double border-gray-300 pb-4 mb-8 flex justify-between items-end">
                                         <div>
                                            <div className="flex items-center gap-2 text-gray-400 mb-1">
                                                <Globe size={16} /> <span className="font-mono text-xs uppercase tracking-widest">OFFICIAL TRAVEL LOG</span>
                                            </div>
                                            <h2 className="text-4xl font-black uppercase text-neo-black tracking-tighter leading-none">
                                                {destination}
                                            </h2>
                                         </div>
                                         <div className="text-right">
                                             <div className="w-16 h-16 border-2 border-gray-300 rounded-full flex items-center justify-center">
                                                 <Plane size={24} className="text-gray-300" />
                                             </div>
                                         </div>
                                     </div>

                                     {/* Stamps Grid */}
                                     <div className="grid grid-cols-2 gap-8">
                                         {guide.collectibleStamps.map((stamp, i) => {
                                             const isCollected = collectedStamps.has(stamp.name);
                                             const rotation = Math.floor(Math.random() * 20) - 10; // Random rotation between -10 and 10
                                             const inkColor = i % 2 === 0 ? 'text-red-700' : 'text-blue-800';
                                             const borderColor = i % 2 === 0 ? 'border-red-700' : 'border-blue-800';
                                             
                                             return (
                                                 <div 
                                                    key={i} 
                                                    onClick={() => toggleStamp(stamp.name)}
                                                    className="aspect-[4/3] border-2 border-dashed border-gray-200 flex flex-col items-center justify-center p-4 text-center cursor-pointer hover:bg-black/5 transition-colors relative group"
                                                 >
                                                     {/* Watermark when empty */}
                                                     <div className={`absolute inset-0 flex flex-col items-center justify-center p-4 transition-opacity duration-500 ${isCollected ? 'opacity-0' : 'opacity-100'}`}>
                                                         <div className="w-16 h-16 rounded-full border-2 border-gray-200 mb-2"></div>
                                                         <div className="h-2 w-16 bg-gray-100 mb-1"></div>
                                                         <div className="h-2 w-10 bg-gray-100"></div>
                                                         <div className="mt-4 text-[10px] text-gray-400 font-mono uppercase tracking-widest group-hover:text-gray-600 transition-colors">Click to Stamp</div>
                                                     </div>

                                                     {/* Actual Stamp (Visible when collected) */}
                                                     <div 
                                                        className={`absolute inset-0 flex items-center justify-center p-2 transition-all duration-300 ease-out transform
                                                            ${isCollected ? 'opacity-90 scale-100' : 'opacity-0 scale-110 pointer-events-none'}
                                                        `}
                                                        style={{ transform: isCollected ? `rotate(${rotation}deg)` : 'scale(1.2)' }}
                                                     >
                                                         <div className={`w-full h-full border-4 ${borderColor} rounded-lg flex flex-col items-center justify-center p-2 relative mix-blend-multiply bg-white/10`}>
                                                             {/* Grunge texture overlay for stamp (CSS ONLY) */}
                                                             <div className="absolute inset-0 opacity-20 bg-[repeating-linear-gradient(45deg,transparent,transparent_2px,#000_2px,#000_3px)] mix-blend-overlay"></div>
                                                             
                                                             <div className={`${inkColor} font-black text-xs uppercase mb-1 tracking-widest border-b ${borderColor} pb-1 w-full text-center`}>{stamp.location}</div>
                                                             <div className={`${inkColor} font-display font-black text-lg uppercase leading-none text-center my-1`}>{stamp.name}</div>
                                                             <div className={`${inkColor} font-mono text-[8px] uppercase mt-1 flex items-center gap-1`}>
                                                                 <CheckCircle2 size={8} /> Verified
                                                             </div>
                                                             
                                                             {/* Date stamp */}
                                                             <div className={`absolute -bottom-2 -right-2 ${inkColor} text-[8px] font-mono border ${borderColor} px-1 bg-[#fdfbf7] rotate-[-5deg]`}>
                                                                 {new Date().toLocaleDateString()}
                                                             </div>
                                                         </div>
                                                     </div>
                                                 </div>
                                             );
                                         })}
                                     </div>

                                     {/* Footer */}
                                     <div className="mt-12 border-t-2 border-gray-300 pt-4 flex justify-between items-center text-gray-400 font-mono text-[10px]">
                                         <div>PAGE {Math.floor(Math.random() * 20) + 1}</div>
                                         <div className="flex flex-col items-end">
                                             <div className="tracking-[0.2em]">WANDER.OS PASSPORT</div>
                                             <div className="text-[8px] font-bold uppercase mt-1 opacity-70">Designed by Amritesh</div>
                                         </div>
                                     </div>
                                 </div>
                             )}
                        </div>
                    )}
                </div>

                {/* HIDDEN HIGH-RES CHECKLIST FOR EXPORT */}
                {guide && (
                    <div style={{ position: 'absolute', top: 0, left: '-9999px', width: '800px' }}>
                        <div ref={checklistRef} className="bg-[#FFFDF5] p-12 border-8 border-[#121212] relative font-sans text-[#121212] overflow-hidden min-h-[1100px]">
                            {/* Decorative Background Doodles */}
                            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none z-0">
                                <Zap className="absolute top-20 left-[10%] w-24 h-24 text-[#FFCE63]" />
                                <Globe className="absolute bottom-32 right-[15%] w-32 h-32 text-[#90F2FF]" />
                                <Cloud className="absolute top-[15%] right-[5%] w-40 h-40 text-[#FF90E8]" />
                                <Star className="absolute bottom-10 left-[5%] w-20 h-20 text-[#B0FF90]" />
                            </div>

                            {/* Header Section */}
                            <div className="relative z-10 border-b-4 border-[#121212] pb-6 mb-8 flex justify-between items-start">
                                <div>
                                    <div className="inline-block bg-[#FF90E8] border-2 border-[#121212] px-3 py-1 font-black text-xs uppercase mb-2 shadow-[2px_2px_0_0_#000]">
                                        OFFICIAL MANIFEST
                                    </div>
                                    <h1 className="text-6xl font-black font-display uppercase tracking-tighter leading-none mb-2">
                                        SOUVENIR<br/><span className="text-[#90F2FF] text-stroke-2">SCOUT</span>
                                    </h1>
                                    <p className="font-mono text-sm font-bold tracking-widest text-gray-500">WANDER.OS // TRAVEL_LOG</p>
                                </div>
                                <div className="text-right">
                                    <div className="w-24 h-24 bg-[#FFCE63] rounded-full border-4 border-[#121212] flex flex-col items-center justify-center shadow-[4px_4px_0_0_#000]">
                                        <span className="text-4xl font-black leading-none">{foundItems.size}</span>
                                        <span className="text-[10px] font-bold uppercase">of {guide.items.length} Found</span>
                                    </div>
                                    <div className="mt-2 font-mono text-xs font-bold">{new Date().toLocaleDateString()}</div>
                                </div>
                            </div>

                            {/* Info Bar */}
                            <div className="relative z-10 flex gap-4 mb-8">
                                <div className="flex-1 bg-[#121212] text-white p-3 font-bold uppercase flex justify-between items-center">
                                    <span>DESTINATION</span>
                                    <span className="text-[#FFCE63]">{destination}</span>
                                </div>
                                <div className="flex-1 border-4 border-[#121212] p-3 font-bold uppercase flex justify-between items-center bg-white">
                                    <span>DURATION</span>
                                    <span>{duration.split(' ')[0]}</span>
                                </div>
                            </div>

                            {/* Checklist Grid */}
                            <div className="relative z-10 grid grid-cols-1 gap-4">
                                {guide.items.map((item, i) => {
                                    const isFound = foundItems.has(item.name);
                                    return (
                                        <div key={i} className={`
                                            border-3 border-[#121212] p-4 flex items-center gap-6 relative overflow-hidden
                                            ${isFound ? 'bg-gray-100' : 'bg-white'}
                                        `}>
                                            {/* Status Box */}
                                            <div className={`
                                                w-12 h-12 border-3 border-[#121212] flex items-center justify-center shrink-0 transition-colors
                                                ${isFound ? 'bg-[#B0FF90]' : 'bg-white'}
                                            `}>
                                                {isFound ? <CheckSquare size={32} strokeWidth={3} /> : <div className="w-4 h-4 bg-gray-200 rounded-full"></div>}
                                            </div>

                                            {/* Item Details */}
                                            <div className="flex-1 relative z-10">
                                                <div className="flex justify-between items-start mb-1">
                                                     <h3 className={`font-black text-2xl uppercase leading-none ${isFound ? 'line-through decoration-4 decoration-[#FF90E8]' : ''}`}>
                                                         {item.name}
                                                     </h3>
                                                     <span className="font-mono font-bold text-xs bg-[#121212] text-white px-2 py-1">{item.priceRange}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm font-bold text-gray-600 mb-2">
                                                    <span className="uppercase bg-[#FFCE63] text-[#121212] px-1 border border-[#121212] text-[10px]">{item.category}</span>
                                                    <span>{item.description}</span>
                                                </div>
                                                <div className="text-xs font-mono text-gray-500 italic border-t border-gray-300 pt-1 mt-1">
                                                    TIP: {item.authenticityTip}
                                                </div>
                                            </div>

                                            {/* Found Stamp Overlay */}
                                            {isFound && (
                                                <div className="absolute right-20 top-1/2 -translate-y-1/2 opacity-20 transform rotate-[-12deg] pointer-events-none">
                                                    <div className="border-4 border-[#121212] p-2 font-black text-4xl uppercase tracking-tighter">
                                                        COLLECTED
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Footer */}
                            <div className="relative z-10 mt-12 pt-6 border-t-4 border-[#121212] flex justify-between items-center">
                                <div className="font-black text-xl uppercase tracking-tighter">WANDER.AI</div>
                                <div className="text-center">
                                    <div className="font-mono text-xs text-gray-500">GENERATED BY SOUVENIR SCOUT V2.0</div>
                                    <div className="font-bold text-[10px] uppercase text-gray-400 mt-1">Designed by Amritesh</div>
                                </div>
                                <div className="flex gap-1">
                                    {[...Array(10)].map((_, i) => (
                                        <div key={i} className="w-2 h-8 bg-[#121212]"></div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SouvenirFinder;