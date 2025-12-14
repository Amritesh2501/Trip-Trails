import React from 'react';
import { Map, ShoppingBag, Briefcase, ArrowRight, Star, Globe, Zap } from 'lucide-react';

interface MainMenuProps {
  onSelect: (view: 'planner' | 'souvenirs' | 'suitcase') => void;
}

const MainMenu: React.FC<MainMenuProps> = ({ onSelect }) => {
  return (
    <div className="w-full h-full animate-slide-up flex flex-col overflow-hidden">
      <div className="flex-1 flex flex-col items-center p-4 md:p-8 w-full max-w-6xl mx-auto h-full">
          
          {/* Header */}
          <div className="mb-4 md:mb-12 text-center relative shrink-0">
             <div className="absolute -top-10 -left-10 text-neo-pink animate-pulse hidden md:block">
                <Zap size={64} fill="#FF90E8" />
             </div>
             <h1 className="text-4xl md:text-7xl font-black font-display uppercase tracking-tighter leading-none mb-2 text-neo-black dark:text-neo-white">
                TRIP<span className="text-neo-blue">TAILS</span>
             </h1>
             <p className="font-bold font-mono text-xs md:text-base bg-neo-yellow text-neo-black inline-block px-4 py-1 border-2 border-neo-black dark:border-neo-white shadow-neo-sm dark:shadow-neo-sm-white uppercase">
                Select Module
             </p>
          </div>

          {/* Container: Flex column on mobile (fill height), Grid on desktop */}
          <div className="flex-1 w-full flex flex-col md:grid md:grid-cols-3 gap-3 md:gap-6 min-h-0">
            
            {/* Module 1: Trip Planner */}
            <button 
              onClick={() => onSelect('planner')}
              className="group relative bg-neo-white dark:bg-neo-darkgray border-4 border-neo-black dark:border-neo-white p-4 md:p-8 flex-1 md:flex-none md:h-72 flex flex-row md:flex-col items-center md:items-start justify-between hover:-translate-y-1 md:hover:-translate-y-2 hover:shadow-neo dark:hover:shadow-neo-white md:hover:shadow-neo-lg md:dark:hover:shadow-neo-lg-white transition-all text-left overflow-hidden shrink-0"
            >
              {/* Background Icon */}
              <div className="absolute right-[-10px] md:right-0 top-1/2 -translate-y-1/2 md:top-0 md:translate-y-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
                <Map size={80} className="md:w-[120px] md:h-[120px]" />
              </div>

              {/* Icon Box */}
              <div className="bg-neo-blue w-12 h-12 md:w-12 md:h-12 flex items-center justify-center border-2 border-neo-black dark:border-neo-white shadow-neo-sm dark:shadow-neo-sm-white md:mb-4 shrink-0 mr-4 md:mr-0">
                 <Globe size={24} className="text-neo-black" />
              </div>

              {/* Text Content */}
              <div className="relative z-10 flex-1">
                 <h2 className="text-xl md:text-3xl font-black uppercase mb-1 md:mb-2 text-neo-black dark:text-neo-white leading-none">Trip Advisor</h2>
                 <p className="font-mono text-[10px] md:text-sm text-gray-600 dark:text-gray-300 leading-tight">Generate complete itineraries with AI logic.</p>
              </div>

              {/* Desktop Arrow */}
              <div className="hidden md:flex mt-4 items-center gap-2 font-black text-xs uppercase text-neo-black dark:text-neo-white opacity-0 group-hover:opacity-100 transition-opacity translate-x-[-10px] group-hover:translate-x-0">
                 Launch <ArrowRight size={14} />
              </div>
              
              {/* Mobile Arrow */}
              <div className="md:hidden text-neo-black dark:text-neo-white opacity-50">
                  <ArrowRight size={20} />
              </div>
            </button>

            {/* Module 2: Souvenir Finder */}
            <button 
              onClick={() => onSelect('souvenirs')}
              className="group relative bg-neo-white dark:bg-neo-darkgray border-4 border-neo-black dark:border-neo-white p-4 md:p-8 flex-1 md:flex-none md:h-72 flex flex-row md:flex-col items-center md:items-start justify-between hover:-translate-y-1 md:hover:-translate-y-2 hover:shadow-neo dark:hover:shadow-neo-white md:hover:shadow-neo-lg md:dark:hover:shadow-neo-lg-white transition-all text-left overflow-hidden shrink-0"
            >
              <div className="absolute right-[-10px] md:right-0 top-1/2 -translate-y-1/2 md:top-0 md:translate-y-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
                <ShoppingBag size={80} className="md:w-[120px] md:h-[120px]" />
              </div>

              <div className="bg-neo-pink w-12 h-12 md:w-12 md:h-12 flex items-center justify-center border-2 border-neo-black dark:border-neo-white shadow-neo-sm dark:shadow-neo-sm-white md:mb-4 shrink-0 mr-4 md:mr-0">
                 <ShoppingBag size={24} className="text-neo-black" />
              </div>

              <div className="relative z-10 flex-1">
                 <h2 className="text-xl md:text-3xl font-black uppercase mb-1 md:mb-2 text-neo-black dark:text-neo-white leading-none">Souvenir Scout</h2>
                 <p className="font-mono text-[10px] md:text-sm text-gray-600 dark:text-gray-300 leading-tight">Discover authentic gifts, stamps, and local crafts.</p>
              </div>

              <div className="hidden md:flex mt-4 items-center gap-2 font-black text-xs uppercase text-neo-black dark:text-neo-white opacity-0 group-hover:opacity-100 transition-opacity translate-x-[-10px] group-hover:translate-x-0">
                 Launch <ArrowRight size={14} />
              </div>
              <div className="md:hidden text-neo-black dark:text-neo-white opacity-50">
                  <ArrowRight size={20} />
              </div>
            </button>

            {/* Module 3: Smart Suitcase */}
            <button 
              onClick={() => onSelect('suitcase')}
              className="group relative bg-neo-white dark:bg-neo-darkgray border-4 border-neo-black dark:border-neo-white p-4 md:p-8 flex-1 md:flex-none md:h-72 flex flex-row md:flex-col items-center md:items-start justify-between hover:-translate-y-1 md:hover:-translate-y-2 hover:shadow-neo dark:hover:shadow-neo-white md:hover:shadow-neo-lg md:dark:hover:shadow-neo-lg-white transition-all text-left overflow-hidden shrink-0"
            >
              <div className="absolute right-[-10px] md:right-0 top-1/2 -translate-y-1/2 md:top-0 md:translate-y-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
                <Briefcase size={80} className="md:w-[120px] md:h-[120px]" />
              </div>

              <div className="bg-neo-green w-12 h-12 md:w-12 md:h-12 flex items-center justify-center border-2 border-neo-black dark:border-neo-white shadow-neo-sm dark:shadow-neo-sm-white md:mb-4 shrink-0 mr-4 md:mr-0">
                 <Briefcase size={24} className="text-neo-black" />
              </div>

              <div className="relative z-10 flex-1">
                 <h2 className="text-xl md:text-3xl font-black uppercase mb-1 md:mb-2 text-neo-black dark:text-neo-white leading-none">Smart Suitcase</h2>
                 <p className="font-mono text-[10px] md:text-sm text-gray-600 dark:text-gray-300 leading-tight">Intelligent packing lists based on weather.</p>
              </div>

              <div className="hidden md:flex mt-4 items-center gap-2 font-black text-xs uppercase text-neo-black dark:text-neo-white opacity-0 group-hover:opacity-100 transition-opacity translate-x-[-10px] group-hover:translate-x-0">
                 Launch <ArrowRight size={14} />
              </div>
              <div className="md:hidden text-neo-black dark:text-neo-white opacity-50">
                  <ArrowRight size={20} />
              </div>
            </button>

          </div>
          
          <div className="mt-4 md:mt-12 font-mono text-[10px] md:text-xs text-gray-400 shrink-0">
             SYSTEM STATUS: ONLINE // V2.1.0
          </div>
      </div>
    </div>
  );
};

export default MainMenu;