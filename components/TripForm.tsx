import React, { useState, useEffect } from 'react';
import { TripPreferences } from '../types';
import { Minus, Plus, ArrowRight, MapPin, Calendar, Plane, Receipt, Printer, CheckCircle2, Star, Zap, Smile } from 'lucide-react';
import { applyTheme } from '../utils/theme';

interface TripFormProps {
  onSubmit: (prefs: TripPreferences) => void;
  isLoading: boolean;
}

const INTERESTS_LIST = ["Food", "History", "Nature", "Art", "Shopping", "Relaxation", "Nightlife", "Adventure", "Offbeat"];

const MONTHS = [
  "January", "February", "March", "April", "May", "June", 
  "July", "August", "September", "October", "November", "December"
];

const TRAVELER_TYPES = [
  { id: 'Solo', label: 'SOLO' },
  { id: 'Couple', label: 'COUPLE' },
  { id: 'Family', label: 'FAMILY' },
  { id: 'Friends', label: 'SQUAD' },
];

const BUDGET_TYPES = [
    { id: 'Budget', label: '$' },
    { id: 'Moderate', label: '$$' },
    { id: 'Luxury', label: '$$$' },
];

const LOADING_STEPS = [
    { label: "CHECKING FLIGHTS", icon: Plane },
    { label: "FINDING HOTELS", icon: MapPin },
    { label: "CALCULATING COSTS", icon: Receipt },
    { label: "FINALIZING PLAN", icon: CheckCircle2 },
];

const TripForm: React.FC<TripFormProps> = ({ onSubmit, isLoading }) => {
  const [destination, setDestination] = useState('');
  const [travelMonth, setTravelMonth] = useState(MONTHS[new Date().getMonth()]);
  const [duration, setDuration] = useState(3);
  const [travelers, setTravelers] = useState('Couple');
  const [budget, setBudget] = useState<'Budget' | 'Moderate' | 'Luxury'>('Moderate');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  
  // Loading state for ticket text
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    let interval: any;
    if (isLoading) {
        // Change text step every 2 seconds (matches CSS animation duration roughly)
        setStepIndex(0);
        interval = setInterval(() => {
            setStepIndex(prev => (prev + 1) % LOADING_STEPS.length);
        }, 2000);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev => 
      prev.includes(interest) 
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!destination.trim()) return;
    
    // Apply dynamic theme based on destination
    applyTheme(destination);

    onSubmit({
      destination,
      travelMonth,
      duration,
      travelers,
      budget,
      interests: selectedInterests.length > 0 ? selectedInterests : ["General"]
    });
  };

  if (isLoading) {
      const currentStep = LOADING_STEPS[stepIndex];
      const StepIcon = currentStep.icon;

      return (
          <div className="flex flex-col items-center justify-center w-full h-full min-h-[350px] md:min-h-[400px] animate-slide-up relative scale-90 md:scale-100 origin-center">
              
              {/* Decorative Printer Doodles */}
              <div className="absolute top-10 left-10 text-neo-pink animate-pulse hidden md:block">
                  <Zap size={32} fill="currentColor" />
              </div>
              <div className="absolute bottom-20 right-10 text-neo-blue animate-bounce hidden md:block">
                  <Star size={32} fill="currentColor" />
              </div>

              {/* Printer Body */}
              <div className="relative z-10 w-64 bg-neo-white dark:bg-[#1a1a1a] border-4 border-neo-black dark:border-neo-white shadow-neo-lg dark:shadow-neo-lg-white rounded-t-lg p-4">
                  {/* Sticker on printer */}
                  <div className="absolute -right-2 top-10 bg-neo-yellow border-2 border-neo-black text-[8px] font-black px-1 rotate-90 text-neo-black">FRAGILE</div>
                  
                  {/* Printer Slot */}
                  <div className="h-4 bg-neo-black dark:bg-black w-full rounded-full mb-2 border border-transparent dark:border-gray-700"></div>
                  
                  {/* Status Lights */}
                  <div className="flex gap-2 justify-center mb-2">
                      <div className="w-3 h-3 rounded-full bg-neo-green animate-pulse border-2 border-neo-black dark:border-neo-white"></div>
                      <div className="w-3 h-3 rounded-full bg-neo-pink border-2 border-neo-black dark:border-neo-white"></div>
                      <div className="w-3 h-3 rounded-full bg-neo-blue border-2 border-neo-black dark:border-neo-white"></div>
                  </div>
                  
                  <div className="text-center font-black font-mono text-xs uppercase tracking-widest mt-2 text-neo-black dark:text-neo-white">
                      ITINERARY_BOT_9000
                  </div>
              </div>

              {/* The "Paper" Container - positioned to look like it comes out of the printer */}
              <div className="relative w-56 h-64 overflow-hidden -mt-2">
                  
                  {/* Animated Ticket */}
                  <div className="w-full h-full bg-neo-yellow border-x-4 border-b-4 border-neo-black p-4 flex flex-col gap-3 items-center text-center animate-print-ticket origin-top text-neo-black">
                      
                      {/* Ticket Header */}
                      <div className="w-full border-b-2 border-dashed border-neo-black pb-2 mb-1">
                          <div className="font-black text-xl uppercase text-neo-black">TRIPTAILS</div>
                          <div className="font-mono text-[10px] text-neo-black">{new Date().toLocaleDateString()}</div>
                      </div>

                      {/* Ticket Content (Dynamic) */}
                      <div className="flex-1 flex flex-col items-center justify-center gap-2 w-full text-neo-black">
                          <StepIcon size={32} strokeWidth={2.5} className="text-neo-black" />
                          <div className="font-black font-display uppercase text-sm leading-tight text-neo-black">
                              {currentStep.label}
                          </div>
                          
                          {/* Fake Barcode */}
                          <div className="mt-2 w-full h-8 flex gap-1 justify-center opacity-70">
                              {[...Array(15)].map((_, i) => (
                                  <div key={i} className={`h-full bg-neo-black ${Math.random() > 0.5 ? 'w-1' : 'w-2'}`}></div>
                              ))}
                          </div>
                      </div>

                      {/* Ticket Footer */}
                      <div className="font-mono text-[10px] border-t-2 border-neo-black pt-1 w-full text-neo-black">
                          DEST: {destination.substring(0, 12).toUpperCase()}
                      </div>
                  </div>
              </div>

              <div className="mt-8 font-black font-display text-xl uppercase animate-pulse text-neo-black dark:text-neo-white">
                  Processing...
              </div>

          </div>
      );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-5 md:space-y-8 animate-slide-up pb-10 relative">
        {/* Form Background Decorations */}
        <div className="absolute -top-4 -right-2 rotate-12 pointer-events-none hidden md:block">
            <div className="bg-neo-pink text-neo-black border-2 border-neo-black px-2 py-1 font-black text-xs shadow-neo-sm">START HERE</div>
        </div>
        
        {/* Destination Field */}
        <div className="space-y-2">
            <label className="font-black text-xs md:text-sm uppercase bg-neo-black dark:bg-gray-200 text-neo-white dark:text-black inline-block px-2 py-1 transform -rotate-1">
                Step 1: Where To?
            </label>
            <div className="relative">
                <input
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="E.G. TOKYO, JAPAN"
                    className="w-full border-3 border-neo-black dark:border-gray-500 p-3 md:p-4 text-base md:text-xl font-bold font-mono placeholder:text-gray-400 focus:outline-none focus:bg-neo-yellow dark:focus:bg-neo-yellow focus:text-neo-black transition-colors shadow-neo-sm dark:shadow-none focus:shadow-neo dark:focus:shadow-none bg-white dark:bg-[#1A1A1A] text-neo-black dark:text-white rounded-none md:rounded-sm"
                    autoFocus
                    required
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-neo-black dark:text-white">
                    <MapPin size={24} strokeWidth={3} />
                </div>
            </div>
        </div>

        {/* Grid 1: Duration & Month */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            
            <div className="space-y-2">
                <label className="font-bold text-xs md:text-sm uppercase border-b-2 border-neo-black dark:border-gray-500 text-neo-black dark:text-white inline-block">Duration</label>
                <div className="flex border-3 border-neo-black dark:border-gray-500 shadow-neo-sm dark:shadow-none bg-white dark:bg-[#1A1A1A] h-14 md:h-14 relative rounded-none md:rounded-sm">
                    {/* Sticker decoration */}
                    <div className="absolute -top-2 -left-2 text-neo-green z-10 hidden md:block"><Star size={16} fill="currentColor"/></div>
                    
                    <button 
                        type="button" 
                        onClick={() => setDuration(Math.max(1, duration - 1))} 
                        className="w-14 flex items-center justify-center border-r-3 border-neo-black dark:border-gray-500 hover:bg-neo-pink active:bg-neo-black active:text-white transition-colors text-neo-black dark:text-white"
                    >
                        <Minus size={20} strokeWidth={4} />
                    </button>
                    <div className="flex-1 flex items-center justify-center font-black text-lg md:text-xl text-neo-black dark:text-white">
                        {duration} DAYS
                    </div>
                    <button 
                        type="button" 
                        onClick={() => setDuration(Math.min(30, duration + 1))} 
                        className="w-14 flex items-center justify-center border-l-3 border-neo-black dark:border-gray-500 hover:bg-neo-green active:bg-neo-black active:text-white transition-colors text-neo-black dark:text-white"
                    >
                        <Plus size={20} strokeWidth={4} />
                    </button>
                </div>
            </div>

            <div className="space-y-2">
                <label className="font-bold text-xs md:text-sm uppercase border-b-2 border-neo-black dark:border-gray-500 text-neo-black dark:text-white inline-block">Month</label>
                <div className="relative border-3 border-neo-black dark:border-gray-500 shadow-neo-sm dark:shadow-none bg-white dark:bg-[#1A1A1A] h-14 md:h-14 rounded-none md:rounded-sm">
                    <select 
                        value={travelMonth}
                        onChange={(e) => setTravelMonth(e.target.value)}
                        className="w-full h-full appearance-none px-4 md:px-4 text-base md:text-xl font-black bg-transparent focus:outline-none cursor-pointer uppercase text-neo-black dark:text-white"
                    >
                        {MONTHS.map(m => <option key={m} value={m} className="text-neo-black">{m}</option>)}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-neo-black dark:text-white">
                        <Calendar size={20} strokeWidth={3} />
                    </div>
                </div>
            </div>

        </div>

        {/* Grid 2: Travelers & Budget */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            
            <div className="space-y-2">
                 <label className="font-bold text-xs md:text-sm uppercase border-b-2 border-neo-black dark:border-gray-500 text-neo-black dark:text-white inline-block">Crew</label>
                 <div className="grid grid-cols-2 gap-2">
                    {TRAVELER_TYPES.map(t => (
                        <button
                            key={t.id}
                            type="button"
                            onClick={() => setTravelers(t.id)}
                            className={`
                                py-3 md:py-3 border-3 border-neo-black dark:border-gray-500 font-bold text-xs md:text-sm uppercase transition-all rounded-none md:rounded-sm
                                ${travelers === t.id 
                                ? 'bg-neo-black dark:bg-gray-200 text-neo-white dark:text-black shadow-none translate-x-[2px] translate-y-[2px]' 
                                : 'bg-white dark:bg-[#1A1A1A] text-neo-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 shadow-neo-sm dark:shadow-none'}
                            `}
                        >
                            {t.label}
                        </button>
                    ))}
                 </div>
            </div>

            <div className="space-y-2">
                 <label className="font-bold text-xs md:text-sm uppercase border-b-2 border-neo-black dark:border-gray-500 text-neo-black dark:text-white inline-block">Budget</label>
                 <div className="grid grid-cols-3 gap-2">
                    {BUDGET_TYPES.map(b => (
                        <button
                            key={b.id}
                            type="button"
                            onClick={() => setBudget(b.id as any)}
                            className={`
                                py-3 md:py-3 border-3 border-neo-black dark:border-gray-500 font-black text-base md:text-lg uppercase transition-all rounded-none md:rounded-sm
                                ${budget === b.id 
                                ? 'bg-neo-green text-neo-black shadow-none translate-x-[2px] translate-y-[2px]' 
                                : 'bg-white dark:bg-[#1A1A1A] text-neo-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 shadow-neo-sm dark:shadow-none'}
                            `}
                        >
                            {b.label}
                        </button>
                    ))}
                 </div>
            </div>

        </div>

        {/* Interests */}
        <div className="space-y-3">
             <label className="font-bold text-xs md:text-sm uppercase border-b-2 border-neo-black dark:border-gray-500 text-neo-black dark:text-white inline-block">Vibe Check (Select 1+)</label>
             <div className="flex flex-wrap gap-2 md:gap-3">
                 {INTERESTS_LIST.map(interest => (
                     <button
                        key={interest}
                        type="button"
                        onClick={() => toggleInterest(interest)}
                        className={`
                            px-3 md:px-4 py-2 md:py-2 border-3 border-neo-black dark:border-gray-500 font-bold text-xs md:text-sm uppercase transition-all rounded-full flex items-center gap-1
                            ${selectedInterests.includes(interest)
                            ? 'bg-neo-purple text-neo-black shadow-none translate-y-[2px]'
                            : 'bg-white dark:bg-[#1A1A1A] text-neo-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 shadow-neo-sm dark:shadow-none'}
                        `}
                     >
                         {selectedInterests.includes(interest) && <Smile size={12}/>} {interest}
                     </button>
                 ))}
             </div>
        </div>

        {/* Submit */}
        <button
            type="submit"
            className="w-full py-4 md:py-5 mt-4 bg-neo-blue border-3 border-neo-black dark:border-white shadow-neo dark:shadow-none font-black text-lg md:text-xl uppercase tracking-wider hover:bg-neo-pink hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all flex items-center justify-center gap-3 group text-neo-black rounded-none md:rounded-sm"
        >
            Generate Plan <ArrowRight size={20} strokeWidth={4} className="group-hover:translate-x-1 transition-transform" />
        </button>

    </form>
  );
};

export default TripForm;