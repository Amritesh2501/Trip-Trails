import React, { useState, useEffect, useRef } from 'react';
import { generatePackingList } from '../services/geminiService';
import { PackingCategory } from '../types';
import { Briefcase, RefreshCw, Shirt, Camera, Zap, Headphones, Book, Glasses, Smartphone, Umbrella, ArrowRight, Check, MapPin, Calendar, Tag, Plane, Package, Barcode, Laptop, Sun, Mountain, Users, Coffee } from 'lucide-react';
import { applyTheme } from '../utils/theme';

const MONTHS = [
  "January", "February", "March", "April", "May", "June", 
  "July", "August", "September", "October", "November", "December"
];

const TRAVEL_TYPES = [
    { id: "Business", icon: Briefcase, label: "Business" },
    { id: "Leisure", icon: Coffee, label: "Leisure" },
    { id: "Adventure", icon: Mountain, label: "Adventure" },
    { id: "Family", icon: Users, label: "Family" }
];

// Enhanced assets with 'type' for specific 3D rendering
const PACKING_ASSETS = [
    { type: 'cloth', Icon: Shirt, color: "text-blue-600", bg: "bg-blue-100", accent: "bg-blue-300" },
    { type: 'cloth', Icon: Shirt, color: "text-red-600", bg: "bg-red-100", accent: "bg-red-300" },
    { type: 'tech', Icon: Laptop, color: "text-gray-800", bg: "bg-gray-200", accent: "bg-gray-400" },
    { type: 'tech', Icon: Camera, color: "text-zinc-800", bg: "bg-zinc-300", accent: "bg-zinc-500" },
    { type: 'item', Icon: Book, color: "text-amber-700", bg: "bg-amber-100", accent: "bg-amber-300" },
    { type: 'item', Icon: Headphones, color: "text-slate-700", bg: "bg-slate-200", accent: "bg-slate-400" },
    { type: 'cloth', Icon: Shirt, color: "text-green-600", bg: "bg-green-100", accent: "bg-green-300" },
    { type: 'item', Icon: Package, color: "text-orange-700", bg: "bg-orange-100", accent: "bg-orange-300" },
    { type: 'cloth', Icon: Shirt, color: "text-pink-600", bg: "bg-pink-100", accent: "bg-pink-300" },
    { type: 'tech', Icon: Smartphone, color: "text-indigo-800", bg: "bg-indigo-100", accent: "bg-indigo-300" },
];

const STATUS_MESSAGES = [
    "ANALYZING FORECAST...",
    "CURATING OUTFITS...",
    "OPTIMIZING SPACE...",
    "CHECKING RESTRICTIONS...",
    "FINALIZING MANIFEST..."
];

const SmartSuitcase: React.FC = () => {
    // Data State
    const [destination, setDestination] = useState('');
    const [month, setMonth] = useState(MONTHS[new Date().getMonth()]);
    const [type, setType] = useState('Leisure');
    const [list, setList] = useState<PackingCategory[]>([]);
    
    // UI Flow State
    const [phase, setPhase] = useState<'config' | 'packing' | 'results'>('config');
    const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
    
    // Animation Specific State
    const [statusIndex, setStatusIndex] = useState(0);
    const [lidOpen, setLidOpen] = useState(false);
    const [packedGridItems, setPackedGridItems] = useState<Array<{id: number, assetIndex: number, gridIndex: number}>>([]);
    const [suitcaseAnimation, setSuitcaseAnimation] = useState<'idle' | 'drop-in' | 'shake' | 'exit'>('idle');
    const [isClearing, setIsClearing] = useState(false);

    // Refs for animation loop control
    const loopRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const itemCountRef = useRef(0);

    const handlePack = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!destination) return;
        
        applyTheme(destination);
        setList([]);
        setPackedGridItems([]);
        setPhase('packing');
        setSuitcaseAnimation('drop-in');
        setLidOpen(false);
        setIsClearing(false);
        itemCountRef.current = 0;

        // 1. Open Lid Sequence
        setTimeout(() => setLidOpen(true), 1200);

        // 2. Start Infinite Fill/Clear Loop
        const startPackingLoop = () => {
            if (loopRef.current) clearInterval(loopRef.current);
            
            loopRef.current = setInterval(() => {
                // If we reached capacity (12 items), trigger clear
                if (itemCountRef.current >= 12) {
                    clearInterval(loopRef.current!);
                    setIsClearing(true); // Triggers exit animation for items
                    
                    // Wait for items to "vanish", then reset
                    setTimeout(() => {
                        setPackedGridItems([]);
                        itemCountRef.current = 0;
                        setIsClearing(false);
                        startPackingLoop(); // Restart filling
                    }, 600);
                    return;
                }

                // Add Item
                setPackedGridItems(prev => [
                    ...prev, 
                    {
                        id: Math.random(),
                        assetIndex: Math.floor(Math.random() * PACKING_ASSETS.length),
                        gridIndex: itemCountRef.current 
                    }
                ]);
                itemCountRef.current++;
            }, 200);
        };

        // Start packing after lid opens
        setTimeout(startPackingLoop, 1500);

        // Status Text Cycle
        const statusInterval = setInterval(() => {
            setStatusIndex(prev => (prev + 1) % STATUS_MESSAGES.length);
        }, 1200);

        try {
            // API CALL
            const result = await generatePackingList(destination, month, type);
            
            // Minimum wait time
            setTimeout(() => {
                clearInterval(loopRef.current!);
                clearInterval(statusInterval);
                
                // Finalize Animation
                setLidOpen(false); // Snap shut
                setIsClearing(false); // Ensure items stay visible for the "shake"
                
                setTimeout(() => {
                    setSuitcaseAnimation('shake');
                    setTimeout(() => {
                        setSuitcaseAnimation('exit');
                        setTimeout(() => {
                            setList(result);
                            setCheckedItems(new Set());
                            setPhase('results');
                        }, 600);
                    }, 1000);
                }, 800);

            }, 5500);

        } catch (error) {
            console.error("Packing failed", error);
            setPhase('config');
            if (loopRef.current) clearInterval(loopRef.current);
            clearInterval(statusInterval);
        }
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (loopRef.current) clearInterval(loopRef.current);
        };
    }, []);

    const toggleItem = (item: string) => {
        const next = new Set(checkedItems);
        if(next.has(item)) next.delete(item);
        else next.add(item);
        setCheckedItems(next);
    };

    const toggleCategory = (items: string[]) => {
        const allSelected = items.every(i => checkedItems.has(i));
        const next = new Set(checkedItems);
        items.forEach(i => allSelected ? next.delete(i) : next.add(i));
        setCheckedItems(next);
    };

    return (
        <div className="w-full h-full relative overflow-hidden bg-neo-bg dark:bg-[#0a0a0a] flex flex-col">
            <style>{`
                .preserve-3d { transform-style: preserve-3d; }
                .backface-hidden { backface-visibility: hidden; }
                
                @keyframes suitcase-drop {
                    0% { transform: translateY(-200%) rotateX(20deg); opacity: 0; }
                    60% { transform: translateY(20px) rotateX(0deg); opacity: 1; }
                    80% { transform: translateY(-10px); }
                    100% { transform: translateY(0); }
                }

                @keyframes suitcase-shake {
                    0%, 100% { transform: rotateZ(0deg); }
                    25% { transform: rotateZ(-2deg) scale(1.02); }
                    75% { transform: rotateZ(2deg) scale(1.02); }
                }

                @keyframes suitcase-exit {
                    0% { transform: translateX(0) scale(1); opacity: 1; }
                    100% { transform: translateX(200%) scale(0.8); opacity: 0; }
                }

                @keyframes pack-grid-drop {
                    0% { transform: translateZ(200px) scale(1.2); opacity: 0; }
                    70% { transform: translateZ(0px) scale(1); opacity: 1; }
                    100% { transform: translateZ(2px) scale(1); opacity: 1; } 
                }

                @keyframes pack-grid-clear {
                    0% { transform: translateZ(2px) scale(1); opacity: 1; }
                    100% { transform: translateZ(-100px) scale(0); opacity: 0; }
                }

                .anim-drop { animation: suitcase-drop 1s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
                .anim-shake { animation: suitcase-shake 0.2s ease-in-out infinite; }
                .anim-exit { animation: suitcase-exit 0.6s ease-in forwards; }
                
                .anim-pack-item { 
                    animation: pack-grid-drop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; 
                }
                .anim-clear-item {
                    animation: pack-grid-clear 0.4s ease-in forwards;
                }
            `}</style>

            {/* --- PHASE 1: CONFIGURATION --- */}
            {phase === 'config' && (
                <div className="flex-1 flex flex-col items-center justify-center p-4 animate-slide-up relative z-10 overflow-y-auto">
                    
                    <div className="w-full max-w-2xl bg-white dark:bg-[#151515] shadow-neo-lg dark:shadow-neo-lg-white border-4 border-neo-black dark:border-neo-white overflow-hidden flex flex-col md:flex-row">
                        
                        {/* Left Side: Destination & Date (The "Ticket" Stub) */}
                        <div className="w-full md:w-5/12 bg-neo-black dark:bg-[#222] text-neo-white p-6 flex flex-col justify-between relative border-b-4 md:border-b-0 md:border-r-4 border-neo-white dark:border-gray-600">
                             <div>
                                 <h2 className="text-3xl font-black font-display uppercase leading-none mb-1">TRIP<br/><span className="text-neo-blue">CONFIG</span></h2>
                                 <p className="font-mono text-[10px] opacity-60 mb-6">SECURE CHECK-IN V2.0</p>
                                 
                                 <div className="space-y-4">
                                     <div>
                                         <label className="text-[10px] font-bold uppercase text-gray-400 block mb-1">Destination</label>
                                         <div className="relative">
                                             <input 
                                                 type="text" 
                                                 value={destination}
                                                 onChange={(e) => setDestination(e.target.value)}
                                                 placeholder="CITY" 
                                                 className="w-full bg-transparent border-b-2 border-gray-500 focus:border-neo-blue text-2xl font-black uppercase text-white placeholder:text-gray-700 focus:outline-none py-1"
                                                 autoFocus
                                             />
                                             <MapPin className="absolute right-0 top-2 text-gray-500" size={16} />
                                         </div>
                                     </div>

                                     <div>
                                         <label className="text-[10px] font-bold uppercase text-gray-400 block mb-1">Season</label>
                                         <div className="relative">
                                             <select 
                                                 value={month}
                                                 onChange={(e) => setMonth(e.target.value)}
                                                 className="w-full bg-transparent border-b-2 border-gray-500 focus:border-neo-blue text-lg font-bold uppercase text-white appearance-none py-1 focus:outline-none cursor-pointer"
                                             >
                                                 {MONTHS.map(m => <option key={m} value={m} className="text-black">{m}</option>)}
                                             </select>
                                             <Calendar className="absolute right-0 top-2 text-gray-500" size={16} />
                                         </div>
                                     </div>
                                 </div>
                             </div>

                             <div className="mt-8 pt-4 border-t border-gray-700 opacity-50">
                                 <Barcode className="w-full h-8" />
                             </div>
                        </div>

                        {/* Right Side: Trip Type Selection & Submit */}
                        <div className="flex-1 p-6 bg-neo-white dark:bg-[#151515] flex flex-col">
                            
                            <div className="flex-1">
                                <label className="text-xs font-black uppercase text-neo-black dark:text-gray-400 mb-4 block flex items-center gap-2">
                                    <Tag size={14}/> Select Travel Mode
                                </label>
                                
                                <div className="grid grid-cols-2 gap-3 mb-6">
                                    {TRAVEL_TYPES.map((t) => {
                                        const isSelected = type === t.id;
                                        const Icon = t.icon;
                                        return (
                                            <button
                                                key={t.id}
                                                type="button"
                                                onClick={() => setType(t.id)}
                                                className={`
                                                    relative p-4 border-3 transition-all flex flex-col items-center justify-center gap-2
                                                    ${isSelected 
                                                        ? 'bg-neo-black border-neo-black text-neo-white shadow-[4px_4px_0px_0px_#90F2FF]' 
                                                        : 'bg-white dark:bg-transparent border-gray-200 dark:border-gray-700 text-gray-400 hover:border-neo-black dark:hover:border-white hover:text-neo-black dark:hover:text-white'}
                                                `}
                                            >
                                                <Icon size={24} strokeWidth={isSelected ? 3 : 2} />
                                                <span className="font-bold uppercase text-xs tracking-wider">{t.label}</span>
                                                {isSelected && <div className="absolute top-2 right-2 w-2 h-2 bg-neo-blue rounded-full"></div>}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <button 
                                onClick={handlePack}
                                disabled={!destination}
                                className="w-full bg-neo-green border-3 border-neo-black dark:border-white p-4 font-black text-lg uppercase hover:bg-neo-pink hover:-translate-y-1 transition-all flex items-center justify-center gap-3 shadow-neo disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:bg-neo-green disabled:cursor-not-allowed text-neo-black"
                            >
                                GENERATE MANIFEST <ArrowRight size={20} strokeWidth={3} />
                            </button>
                        </div>

                    </div>
                </div>
            )}


            {/* --- PHASE 2: PACKING ANIMATION STAGE --- */}
            {phase === 'packing' && (
                <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden perspective-[1200px]">
                    
                    {/* Background Grid */}
                    <div className="absolute inset-0 opacity-10 pointer-events-none" 
                        style={{ 
                            backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', 
                            backgroundSize: '40px 40px',
                            transform: 'rotateX(60deg) scale(2)'
                        }}>
                    </div>

                    {/* Status Text Pill */}
                    <div className="absolute top-24 text-center z-50 px-4">
                        <div className="inline-flex items-center gap-2 bg-neo-white border-3 border-neo-black px-5 py-2 rounded-full shadow-neo animate-bounce">
                            <RefreshCw size={16} className="animate-spin text-neo-pink" />
                            <span className="font-black font-mono text-sm uppercase text-neo-black">{STATUS_MESSAGES[statusIndex]}</span>
                        </div>
                    </div>

                    {/* 3D SUITCASE CONTAINER */}
                    <div className={`
                        relative w-[340px] h-[260px] preserve-3d transition-transform duration-500
                        ${suitcaseAnimation === 'drop-in' ? 'anim-drop' : ''}
                        ${suitcaseAnimation === 'shake' ? 'anim-shake' : ''}
                        ${suitcaseAnimation === 'exit' ? 'anim-exit' : ''}
                    `}
                    style={{ transform: 'rotateX(40deg) rotateZ(0deg)' }}
                    >
                        {/* === BASE === */}
                        <div className="absolute inset-0 bg-[#222] border-4 border-neo-black" style={{ transform: 'translateZ(0)' }}>
                            {/* Interior Floor */}
                            <div className="absolute inset-2 bg-neo-yellow border-2 border-black/20 overflow-hidden">
                                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#000 2px, transparent 2px)', backgroundSize: '12px 12px' }}></div>
                                
                                {/* 
                                    GRID PACKING SYSTEM 
                                    Grid: 4 cols x 3 rows = 12 slots.
                                */}
                                <div className="w-full h-full relative preserve-3d">
                                     {packedGridItems.map((item) => {
                                         const Asset = PACKING_ASSETS[item.assetIndex];
                                         
                                         // Map cumulative index to one of the 12 visible slots
                                         const slot = item.gridIndex % 12;
                                         const col = slot % 4;
                                         const row = Math.floor(slot / 4);

                                         const leftPos = col * 25; // %
                                         const topPos = row * 33.33; // %
                                         
                                         return (
                                             <div 
                                                key={item.id}
                                                className={`absolute flex items-center justify-center ${isClearing ? 'anim-clear-item' : 'anim-pack-item'}`}
                                                style={{
                                                    left: `${leftPos}%`,
                                                    top: `${topPos}%`,
                                                    width: '25%',
                                                    height: '33.33%',
                                                    zIndex: item.gridIndex,
                                                }}
                                             >
                                                 {/* 3D Item Representation */}
                                                 <div className={`
                                                    w-[85%] h-[80%] ${Asset.bg} border border-black/30 rounded-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] 
                                                    flex items-center justify-center relative preserve-3d
                                                 `}>
                                                     {/* Cloth Specific Detail: Collar */}
                                                     {Asset.type === 'cloth' && (
                                                         <div className="absolute top-0 w-1/2 h-1 bg-black/10 mx-auto rounded-b-md"></div>
                                                     )}
                                                     {Asset.type === 'cloth' && (
                                                         <div className="absolute inset-x-2 top-2 bottom-2 border-x border-black/5"></div>
                                                     )}

                                                     {/* Tech Specific Detail: Screen Reflection */}
                                                     {Asset.type === 'tech' && (
                                                         <div className="absolute inset-1 bg-black/10 rounded-sm overflow-hidden">
                                                             <div className="w-full h-[50%] bg-white/20 -skew-y-12 transform translate-y-1"></div>
                                                         </div>
                                                     )}

                                                     {/* Item Specific Detail: Book Spine/Pages */}
                                                     {Asset.type === 'item' && (
                                                         <div className="absolute right-0 h-full w-1 bg-white/50 border-l border-black/10"></div>
                                                     )}

                                                     <Asset.Icon size={20} className={`${Asset.color} relative z-10 drop-shadow-sm`} strokeWidth={2.5} />
                                                 </div>
                                             </div>
                                         );
                                     })}
                                </div>
                            </div>
                        </div>

                        {/* Front Wall */}
                        <div className="absolute bottom-0 w-full h-[60px] bg-[#1a1a1a] border-x-4 border-b-4 border-neo-black origin-bottom flex justify-between px-8 items-center" 
                             style={{ transform: 'rotateX(90deg)' }}>
                             <div className="w-10 h-10 bg-black rounded-full border-4 border-gray-700 mt-6 shadow-inner"></div>
                             <div className="w-10 h-10 bg-black rounded-full border-4 border-gray-700 mt-6 shadow-inner"></div>
                        </div>

                        {/* Back Wall */}
                        <div className="absolute top-0 w-full h-[60px] bg-[#1a1a1a] border-x-4 border-t-4 border-neo-black origin-top flex justify-center items-center" 
                             style={{ transform: 'rotateX(-90deg)' }}>
                             <div className="w-24 h-full bg-[#111] border-x-2 border-gray-700 relative">
                                 {/* Handle Bars */}
                                 <div className={`absolute bottom-full left-2 w-1.5 bg-gray-400 transition-all duration-300 ${lidOpen ? 'h-24' : 'h-3'}`}></div>
                                 <div className={`absolute bottom-full right-2 w-1.5 bg-gray-400 transition-all duration-300 ${lidOpen ? 'h-24' : 'h-3'}`}></div>
                                 {/* Handle Grip */}
                                 <div className={`absolute bottom-full left-0 right-0 h-4 bg-black border border-gray-500 rounded-sm z-20 transition-all duration-300 ${lidOpen ? 'mb-24' : 'mb-3'}`}></div>
                             </div>
                        </div>

                        {/* Left Wall */}
                        <div className="absolute left-0 h-full w-[60px] bg-[#1a1a1a] border-y-4 border-l-4 border-neo-black origin-left" 
                             style={{ transform: 'rotateY(-90deg)' }}></div>
                        
                        {/* Right Wall */}
                        <div className="absolute right-0 h-full w-[60px] bg-[#1a1a1a] border-y-4 border-r-4 border-neo-black origin-right" 
                             style={{ transform: 'rotateY(90deg)' }}></div>


                        {/* === LID (ANIMATED) === */}
                        <div className="absolute top-0 left-0 w-full h-full preserve-3d origin-top transition-transform duration-500 ease-out"
                             style={{ 
                                 transform: lidOpen 
                                    ? 'translateZ(60px) rotateX(-100deg)' 
                                    : 'translateZ(60px) rotateX(0deg)' 
                             }}>
                             
                             {/* Inner Face */}
                             <div className="absolute inset-0 bg-[#222] border-4 border-neo-black backface-hidden flex items-center justify-center">
                                 <div className="w-[90%] h-[80%] border-2 border-dashed border-gray-600 rounded flex items-center justify-center">
                                     <span className="text-gray-600 font-black text-xs -rotate-12">MESH POCKET</span>
                                 </div>
                             </div>

                             {/* Walls of Lid (Thickness 30px) */}
                             <div className="absolute top-0 w-full h-[30px] bg-[#333] border-x-4 border-t-4 border-neo-black origin-top" style={{ transform: 'rotateX(-90deg)' }}></div>
                             <div className="absolute bottom-0 w-full h-[30px] bg-[#333] border-x-4 border-b-4 border-neo-black origin-bottom" style={{ transform: 'rotateX(90deg)' }}></div>
                             <div className="absolute left-0 h-full w-[30px] bg-[#333] border-y-4 border-l-4 border-neo-black origin-left" style={{ transform: 'rotateY(-90deg)' }}></div>
                             <div className="absolute right-0 h-full w-[30px] bg-[#333] border-y-4 border-r-4 border-neo-black origin-right" style={{ transform: 'rotateY(90deg)' }}></div>

                             {/* Outer Face */}
                             <div className="absolute inset-0 bg-[#151515] border-4 border-neo-black flex items-center justify-center" style={{ transform: 'translateZ(30px) rotateY(180deg)' }}>
                                  {/* Ribbed Texture */}
                                  <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 20px, #000 20px, #000 40px)' }}></div>
                                  
                                  {/* Stickers */}
                                  <div className="absolute top-6 left-6 bg-neo-pink text-neo-black px-2 py-1 font-black text-xs rotate-[-15deg] border border-white shadow-md">FRAGILE</div>
                                  <div className="absolute bottom-6 right-6 w-16 h-16 bg-neo-blue rounded-full border-2 border-white flex items-center justify-center rotate-12 shadow-md">
                                      <Plane size={24} className="text-white"/>
                                  </div>

                                  {/* Center Logo */}
                                  <div className="w-20 h-20 border-4 border-gray-600 rounded-full flex items-center justify-center opacity-50 relative z-10">
                                      <div className="w-14 h-14 bg-black rounded-full"></div>
                                  </div>
                             </div>
                        </div>

                    </div>
                </div>
            )}


            {/* --- PHASE 3: RESULTS --- */}
            {phase === 'results' && (
                <div className="flex-1 flex flex-col overflow-hidden animate-slide-up bg-white dark:bg-neo-darkgray relative">
                    
                    {/* Header */}
                    <div className="p-4 md:p-6 border-b-4 border-neo-black dark:border-neo-white bg-neo-yellow text-neo-black shrink-0 flex justify-between items-center">
                        <div>
                            <h2 className="text-3xl md:text-5xl font-black font-display uppercase leading-none">{destination}</h2>
                            <p className="font-mono text-xs font-bold mt-1">GENERATED MANIFEST • {list.reduce((acc, c) => acc + c.items.length, 0)} ITEMS</p>
                        </div>
                        <button 
                            onClick={() => setPhase('config')}
                            className="bg-neo-black text-white px-4 py-2 font-bold uppercase text-xs hover:bg-white hover:text-black transition-colors border-2 border-transparent hover:border-neo-black flex items-center gap-2"
                        >
                            <RefreshCw size={14} /> Repack
                        </button>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-4 bg-gray-200 border-b-4 border-neo-black dark:border-neo-white w-full">
                        <div 
                            className="h-full bg-neo-green transition-all duration-300"
                            style={{ width: `${Math.round((checkedItems.size / list.reduce((acc, c) => acc + c.items.length, 0)) * 100)}%` }}
                        ></div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8 bg-white dark:bg-[#111]">
                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                             {list.map((category, idx) => {
                                 const allChecked = category.items.every(item => checkedItems.has(item));
                                 const progress = category.items.filter(i => checkedItems.has(i)).length / category.items.length;
                                 
                                 return (
                                     <div key={idx} className="border-3 border-neo-black dark:border-gray-600 bg-gray-50 dark:bg-[#1a1a1a] shadow-neo-sm hover:shadow-neo transition-all p-4 flex flex-col">
                                         <div className="flex justify-between items-center border-b-2 border-black/10 dark:border-white/10 pb-2 mb-3">
                                             <h3 className="font-black uppercase text-lg text-neo-black dark:text-neo-white flex items-center gap-2">
                                                 <div className={`w-3 h-3 ${idx % 2 === 0 ? 'bg-neo-pink' : 'bg-neo-blue'} border border-black`}></div> 
                                                 {category.category}
                                             </h3>
                                             <button 
                                                onClick={() => toggleCategory(category.items)}
                                                className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border border-black/20 hover:bg-neo-yellow transition-colors ${allChecked ? 'bg-neo-green' : 'bg-transparent'}`}
                                             >
                                                 {allChecked ? 'Done' : 'Check All'}
                                             </button>
                                         </div>

                                         <ul className="space-y-2 flex-1">
                                             {category.items.map((item, i) => {
                                                 const isChecked = checkedItems.has(item);
                                                 return (
                                                     <li key={i}>
                                                         <button 
                                                             onClick={() => toggleItem(item)}
                                                             className={`w-full text-left flex items-center gap-3 group`}
                                                         >
                                                             <div className={`
                                                                 w-5 h-5 border-2 rounded-sm flex items-center justify-center transition-all duration-200 shrink-0
                                                                 ${isChecked 
                                                                    ? 'bg-neo-black border-neo-black dark:bg-neo-white dark:border-neo-white' 
                                                                    : 'bg-white border-gray-300 dark:bg-transparent dark:border-gray-600 group-hover:border-neo-black'}
                                                             `}>
                                                                 {isChecked && <Check size={14} className="text-white dark:text-black" strokeWidth={4} />}
                                                             </div>
                                                             <span className={`font-mono text-sm font-bold transition-colors ${isChecked ? 'line-through text-gray-400' : 'text-neo-black dark:text-gray-200'}`}>
                                                                 {item}
                                                             </span>
                                                         </button>
                                                     </li>
                                                 );
                                             })}
                                         </ul>
                                         
                                         {/* Mini progress per card */}
                                         <div className="mt-4 h-1 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                             <div className="h-full bg-neo-black dark:bg-neo-white transition-all duration-500" style={{ width: `${progress * 100}%` }}></div>
                                         </div>
                                     </div>
                                 );
                             })}
                         </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default SmartSuitcase;