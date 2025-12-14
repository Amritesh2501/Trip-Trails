import React from 'react';
import { Map, ShoppingBag, Briefcase, ArrowRight, Star, Globe, Zap } from 'lucide-react';

interface MainMenuProps {
  onSelect: (view: 'planner' | 'souvenirs' | 'suitcase') => void;
}

const MainMenu: React.FC<MainMenuProps> = ({ onSelect }) => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4 animate-slide-up overflow-y-auto custom-scrollbar">
      <div className="flex flex-col items-center justify-center w-full min-h-full py-8">
          
          <div className="mb-12 text-center relative shrink-0">
             <div className="absolute -top-10 -left-10 text-neo-pink animate-pulse hidden md:block">
                <Zap size={64} fill="#FF90E8" />
             </div>
             <h1 className="text-4xl md:text-7xl font-black font-display uppercase tracking-tighter leading-none mb-2 text-neo-black dark:text-neo-white">
                TRIP<span className="text-neo-blue">TAILS</span>
             </h1>
             <p className="font-bold font-mono text-sm md:text-base bg-neo-yellow text-neo-black inline-block px-4 py-1 border-2 border-neo-black dark:border-neo-white shadow-neo-sm dark:shadow-neo-sm-white uppercase">
                Select Module
             </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full">
            
            {/* Module 1: Trip Planner */}
            <button 
              onClick={() => onSelect('planner')}
              className="group relative bg-neo-white dark:bg-neo-darkgray border-4 border-neo-black dark:border-neo-white p-6 md:p-8 h-64 flex flex-col justify-between hover:-translate-y-2 hover:shadow-neo-lg dark:hover:shadow-neo-lg-white transition-all text-left overflow-hidden shrink-0"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Map size={120} />
              </div>
              <div className="bg-neo-blue w-12 h-12 flex items-center justify-center border-2 border-neo-black dark:border-neo-white shadow-neo-sm dark:shadow-neo-sm-white mb-4">
                 <Globe size={24} className="text-neo-black" />
              </div>
              <div className="relative z-10">
                 <h2 className="text-2xl md:text-3xl font-black uppercase mb-2 text-neo-black dark:text-neo-white">Trip Advisor</h2>
                 <p className="font-mono text-xs md:text-sm text-gray-600 dark:text-gray-300">Generate complete itineraries with AI logic.</p>
              </div>
              <div className="mt-4 flex items-center gap-2 font-black text-xs uppercase text-neo-black dark:text-neo-white opacity-0 group-hover:opacity-100 transition-opacity translate-x-[-10px] group-hover:translate-x-0">
                 Launch <ArrowRight size={14} />
              </div>
            </button>

            {/* Module 2: Souvenir Finder */}
            <button 
              onClick={() => onSelect('souvenirs')}
              className="group relative bg-neo-white dark:bg-neo-darkgray border-4 border-neo-black dark:border-neo-white p-6 md:p-8 h-64 flex flex-col justify-between hover:-translate-y-2 hover:shadow-neo-lg dark:hover:shadow-neo-lg-white transition-all text-left overflow-hidden shrink-0"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <ShoppingBag size={120} />
              </div>
              <div className="bg-neo-pink w-12 h-12 flex items-center justify-center border-2 border-neo-black dark:border-neo-white shadow-neo-sm dark:shadow-neo-sm-white mb-4">
                 <ShoppingBag size={24} className="text-neo-black" />
              </div>
              <div className="relative z-10">
                 <h2 className="text-2xl md:text-3xl font-black uppercase mb-2 text-neo-black dark:text-neo-white">Souvenir Scout</h2>
                 <p className="font-mono text-xs md:text-sm text-gray-600 dark:text-gray-300">Discover authentic gifts, stamps, and local crafts.</p>
              </div>
              <div className="mt-4 flex items-center gap-2 font-black text-xs uppercase text-neo-black dark:text-neo-white opacity-0 group-hover:opacity-100 transition-opacity translate-x-[-10px] group-hover:translate-x-0">
                 Launch <ArrowRight size={14} />
              </div>
            </button>

            {/* Module 3: Smart Suitcase */}
            <button 
              onClick={() => onSelect('suitcase')}
              className="group relative bg-neo-white dark:bg-neo-darkgray border-4 border-neo-black dark:border-neo-white p-6 md:p-8 h-64 flex flex-col justify-between hover:-translate-y-2 hover:shadow-neo-lg dark:hover:shadow-neo-lg-white transition-all text-left overflow-hidden shrink-0"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Briefcase size={120} />
              </div>
              <div className="bg-neo-green w-12 h-12 flex items-center justify-center border-2 border-neo-black dark:border-neo-white shadow-neo-sm dark:shadow-neo-sm-white mb-4">
                 <Briefcase size={24} className="text-neo-black" />
              </div>
              <div className="relative z-10">
                 <h2 className="text-2xl md:text-3xl font-black uppercase mb-2 text-neo-black dark:text-neo-white">Smart Suitcase</h2>
                 <p className="font-mono text-xs md:text-sm text-gray-600 dark:text-gray-300">Intelligent packing lists based on weather & culture.</p>
              </div>
              <div className="mt-4 flex items-center gap-2 font-black text-xs uppercase text-neo-black dark:text-neo-white opacity-0 group-hover:opacity-100 transition-opacity translate-x-[-10px] group-hover:translate-x-0">
                 Launch <ArrowRight size={14} />
              </div>
            </button>

          </div>
          
          <div className="mt-12 font-mono text-xs text-gray-400 shrink-0">
             SYSTEM STATUS: ONLINE // V2.1.0
          </div>
      </div>
    </div>
  );
};

export default MainMenu;