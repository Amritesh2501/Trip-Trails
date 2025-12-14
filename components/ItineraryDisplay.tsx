import React, { useState, useRef, useEffect } from 'react';
import { TripItinerary, Activity, ChatMessage, LanguageTip } from '../types';
import { MapPin, Utensils, Camera, Mountain, ShoppingBag, Landmark, Ticket, ChevronDown, ChevronUp, MessageCircle, Send, Languages, Download, X, FileText, Sparkles, Zap, Star as StarIcon, Compass, ArrowLeft, ArrowRight, Map as MapIcon, Info, Calendar, Bot, User, Terminal, SendHorizontal, Plane, CheckCircle2, Globe } from 'lucide-react';
import BudgetChart from './BudgetChart';
import { chatWithConcierge, getLanguageTips } from '../services/geminiService';

// Access global libraries
const L = (window as any).L;
const html2canvas = (window as any).html2canvas;
const jsPDF = (window as any).jspdf.jsPDF;

// --- ICONS & DOODLES ---

const ArrowDoodle = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 50 30" className={`w-12 h-8 ${className}`}>
        <path d="M5,15 Q25,5 45,15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M35,10 L45,15 L38,22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
);

const TypingIndicator = () => (
    <div className="flex items-center gap-1 p-3 bg-white dark:bg-[#222] border-2 border-neo-black dark:border-gray-600 rounded-none w-fit shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] animate-slide-up">
        <div className="w-1.5 h-1.5 bg-neo-black dark:bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-1.5 h-1.5 bg-neo-black dark:bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-1.5 h-1.5 bg-neo-black dark:bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
    </div>
);

interface ItineraryDisplayProps {
  itinerary: TripItinerary;
  onReset: () => void;
  isDarkMode?: boolean;
}

interface CategoryIconProps {
  category: Activity['category'];
}

const EXCHANGE_RATES: Record<string, number> = {
  USD: 1, EUR: 0.92, GBP: 0.79, JPY: 150, AUD: 1.52, CAD: 1.36, CHF: 0.90, CNY: 7.23, INR: 83.5, SGD: 1.35, KRW: 1350, MXN: 17.5, BRL: 5.2, TRY: 32.5, ZAR: 19.0, THB: 36.5, VND: 25400, IDR: 16000
};

const CategoryIcon: React.FC<CategoryIconProps> = ({ category }) => {
    const props = { size: 14, strokeWidth: 2.5 };
    switch (category) {
        case 'Food': return <Utensils {...props} />;
        case 'Sightseeing': return <Camera {...props} />;
        case 'Adventure': return <Mountain {...props} />;
        case 'Shopping': return <ShoppingBag {...props} />;
        case 'Culture': return <Landmark {...props} />;
        case 'Offbeat': return <Compass {...props} />;
        default: return <MapPin {...props} />;
    }
};

const ActivityCard: React.FC<{ act: Activity; destination: string; index: number }> = ({ act, destination, index }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
    const isOffbeat = act.category === 'Offbeat';

    const toggleItem = (item: string) => {
        const next = new Set(checkedItems);
        if (next.has(item)) next.delete(item);
        else next.add(item);
        setCheckedItems(next);
    };

    // Random Sticker Logic
    const sticker = index % 3 === 0 ? <Zap size={20} className="text-neo-yellow fill-neo-yellow" /> : 
                    index % 3 === 1 ? <Sparkles size={20} className="text-neo-pink fill-neo-pink" /> : 
                    <StarIcon size={20} className="text-neo-blue fill-neo-blue" />;
    
    return (
        <div className="relative flex flex-row gap-3 md:gap-6 group text-neo-black dark:text-gray-200">
            {/* Left Column: Time */}
            <div className="w-14 md:w-24 shrink-0 flex flex-col items-center pt-2 z-10">
                <div className="bg-neo-black dark:bg-[#222] text-neo-white dark:text-gray-300 font-mono font-bold text-[10px] md:text-xs px-1 py-1 border border-neo-white dark:border-gray-600 shadow-sm text-center w-full leading-tight break-words rounded-sm">
                    {act.time.replace(' ', '').replace('-', '\n')}
                </div>
                {/* Vertical Line for timeline effect */}
                <div className="w-0.5 flex-1 bg-neo-black/20 dark:bg-white/10 mt-2 rounded-full"></div>
            </div>

            {/* Right Column: Content */}
            <div 
                className={`
                    flex-1 bg-white dark:bg-[#1A1A1A] border-2 md:border-3 shadow-neo-sm md:shadow-neo dark:shadow-none p-3 md:p-4 transition-all duration-300 relative overflow-hidden mb-4
                    ${isOffbeat ? 'border-neo-purple dark:border-neo-purple' : 'border-neo-black dark:border-gray-700'}
                    ${isExpanded ? 'translate-x-[1px] translate-y-[1px]' : 'active:scale-[0.99] md:hover:translate-x-0.5 md:hover:translate-y-0.5'}
                `}
                onClick={() => setIsExpanded(!isExpanded)}
            >
                {/* Offbeat Badge */}
                {isOffbeat && (
                    <div className="absolute top-0 left-0 bg-neo-purple text-neo-black text-[9px] font-black px-1.5 py-0.5 z-20 border-b-2 border-r-2 border-neo-black dark:border-neo-black flex items-center gap-1">
                        <Compass size={8} strokeWidth={4} /> GEM
                    </div>
                )}

                {/* Decorative Sticker */}
                <div className="absolute -top-1 -right-1 opacity-60 rotate-12 transform scale-75 pointer-events-none z-20">
                    {sticker}
                </div>

                <div className={`flex flex-col gap-1 relative z-10 ${isOffbeat ? 'mt-4' : ''}`}>
                    <div className="flex justify-between items-start gap-2">
                        <h3 className="font-black text-sm md:text-lg uppercase leading-tight text-neo-black dark:text-white pr-4">{act.name}</h3>
                        {act.price && (
                            <span className="shrink-0 bg-neo-green text-neo-black border border-neo-black dark:border-transparent px-1.5 py-0.5 text-[10px] md:text-xs font-bold rotate-1">
                                {act.price}
                            </span>
                        )}
                    </div>
                    
                    <div className="flex flex-wrap gap-2 text-neo-black dark:text-gray-300 relative z-10 mt-1">
                        <span className={`flex items-center gap-1 text-[10px] font-bold border border-neo-black dark:border-gray-600 px-1.5 py-0.5 ${isOffbeat ? 'bg-neo-purple text-neo-black' : 'bg-gray-100 dark:bg-gray-800'}`}>
                            <CategoryIcon category={act.category} /> {act.category}
                        </span>
                        {act.duration && (
                            <span className="text-[10px] font-bold border border-neo-black dark:border-gray-600 px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800">
                                {act.duration}
                            </span>
                        )}
                    </div>

                    <p className={`mt-2 font-medium text-xs md:text-sm leading-relaxed border-l-2 pl-2 transition-all duration-300 overflow-hidden text-neo-black dark:text-gray-400 ${isOffbeat ? 'border-neo-purple' : 'border-neo-pink'} ${isExpanded ? 'max-h-[1000px]' : 'max-h-[4.5em] line-clamp-3'}`}>
                        {act.description}
                    </p>
                    
                    {/* Expandable Content */}
                    {isExpanded && act.packingSuggestions && act.packingSuggestions.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-dashed border-gray-300 dark:border-gray-700 animate-slide-up">
                            <span className="text-[10px] font-black uppercase text-gray-500 dark:text-gray-500 block mb-2 flex items-center gap-1">
                                <ShoppingBag size={10}/> Pack:
                            </span>
                            <div className="flex flex-wrap gap-1.5 text-neo-black">
                                {act.packingSuggestions.map((item, i) => (
                                    <button 
                                        key={i} 
                                        onClick={(e) => { e.stopPropagation(); toggleItem(item); }}
                                        className={`text-[10px] px-2 py-0.5 border border-neo-black/20 dark:border-gray-600 rounded-full transition-colors flex items-center gap-1
                                            ${checkedItems.has(item) ? 'bg-neo-green text-black line-through opacity-70' : 'bg-neo-yellow/80 dark:bg-gray-700 dark:text-gray-200'}
                                        `}
                                    >
                                        {item}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-3 pt-2 border-t-2 border-gray-100 dark:border-gray-800" onClick={(e) => e.stopPropagation()}>
                    <a 
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(act.name + " " + destination)}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="flex-1 inline-flex items-center justify-center gap-1 bg-neo-blue/20 hover:bg-neo-blue border border-neo-black/50 dark:border-gray-600 px-2 py-1.5 font-black text-[10px] uppercase transition-colors text-center text-neo-black dark:text-gray-300 dark:hover:text-black rounded-sm"
                    >
                        <MapIcon size={12} /> Map <ArrowDoodle className="w-4 h-3 ml-1" />
                    </a>
                    <button 
                        onClick={() => setIsExpanded(!isExpanded)}
                        className={`
                            flex-1 inline-flex items-center justify-center gap-1 border border-neo-black/50 dark:border-gray-600 px-2 py-1.5 font-black text-[10px] uppercase transition-colors text-center rounded-sm
                            ${isExpanded ? 'bg-neo-pink text-neo-black' : 'bg-transparent hover:bg-neo-yellow text-neo-black dark:text-gray-300 dark:hover:text-black'}
                        `}
                    >
                         {isExpanded ? <ChevronUp size={12}/> : <ChevronDown size={12}/>}
                         {isExpanded ? 'Less' : 'More'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const ItineraryDisplay: React.FC<ItineraryDisplayProps> = ({ itinerary, onReset, isDarkMode }) => {
  const [activeTab, setActiveTab] = useState<'itinerary' | 'budget' | 'bookings' | 'map' | 'language'>('itinerary');
  const [selectedDay, setSelectedDay] = useState(0);
  const [currency, setCurrency] = useState<string>(itinerary.budgetBreakdown.currency);
  const [showSummary, setShowSummary] = useState(false); // Collapsed by default on mobile logic
  
  // Chat State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
      { 
          role: 'model', 
          text: `Hi! I'm your concierge for ${itinerary.destination}. Ask me anything about your trip!`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Language State
  const [languageTips, setLanguageTips] = useState<LanguageTip[]>([]);
  const [isLoadingTips, setIsLoadingTips] = useState(false);

  // Map
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  const contentRef = useRef<HTMLDivElement>(null);
  const exportRef = useRef<HTMLDivElement>(null); // For Boarding Pass
  const fullItineraryContainerRef = useRef<HTMLDivElement>(null); // For Full PDF pages
  const hiddenChartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) contentRef.current.scrollTop = 0;
  }, [selectedDay, activeTab]);

  useEffect(() => {
    setCurrency(itinerary.budgetBreakdown.currency);
  }, [itinerary]);

  // Enhanced scrolling for chat
  useEffect(() => {
    if ((isChatOpen || activeTab) && chatEndRef.current) {
        // Small delay to ensure rendering is complete
        setTimeout(() => {
            chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    }
  }, [chatMessages, isChatOpen, isChatLoading]);

  // Leaflet Map Initialization
  useEffect(() => {
    if (activeTab === 'map' && mapContainerRef.current && !mapInstanceRef.current && L) {
        const acts = itinerary.days.flatMap(d => d.activities).filter(a => a.coordinates);
        const centerLat = acts.length > 0 ? acts[0].coordinates!.lat : 51.505;
        const centerLng = acts.length > 0 ? acts[0].coordinates!.lng : -0.09;

        const map = L.map(mapContainerRef.current).setView([centerLat, centerLng], 13);
        
        const tileUrl = isDarkMode 
            ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
            : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
        
        L.tileLayer(tileUrl, {
            attribution: '&copy; OpenStreetMap &copy; CARTO',
            subdomains: 'abcd',
            maxZoom: 20
        }).addTo(map);

        const colors = ['#FF90E8', '#B0FF90', '#FFCE63', '#90F2FF'];

        itinerary.days.forEach((day, idx) => {
            const dayColor = colors[idx % colors.length];
            const group = L.layerGroup().addTo(map);
            day.activities.forEach(act => {
                if (act.coordinates) {
                    const pinSvg = `
                        <svg width="40" height="48" viewBox="0 0 40 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(2px 2px 0px rgba(0,0,0,1));">
                          <path d="M20 46L6 24C3 18 4 4 20 4C36 4 37 18 34 24L20 46Z" fill="${dayColor}" stroke="#121212" stroke-width="2.5" stroke-linejoin="round"/>
                          <circle cx="20" cy="18" r="9" fill="white" stroke="#121212" stroke-width="2"/>
                          <text x="20" y="22" text-anchor="middle" font-family="monospace" font-weight="900" font-size="12" fill="#121212">${day.day}</text>
                        </svg>
                    `;

                    const icon = L.divIcon({ 
                        className: 'custom-pin-marker', 
                        html: pinSvg, 
                        iconSize: [40, 48], 
                        iconAnchor: [20, 48],
                        popupAnchor: [0, -48]
                    });

                    const popupContent = `
                        <div style="font-family: 'Public Sans', sans-serif; min-width: 150px;">
                            <div style="background: ${dayColor}; border: 2px solid #000; padding: 4px 8px; font-weight: 900; text-transform: uppercase; font-size: 10px; margin-bottom: 4px; display: inline-block;">Day ${day.day}</div>
                            <h3 style="margin: 0; font-weight: 800; font-size: 14px; text-transform: uppercase; line-height: 1.2;">${act.name}</h3>
                            <p style="margin: 4px 0 0; font-size: 11px; font-family: monospace; opacity: 0.8;">${act.time}</p>
                        </div>
                    `;

                    L.marker([act.coordinates.lat, act.coordinates.lng], { icon })
                        .bindPopup(popupContent)
                        .addTo(group);
                }
            });
        });
        mapInstanceRef.current = map;
    }
    return () => {
        if (activeTab !== 'map' && mapInstanceRef.current) {
            mapInstanceRef.current.remove();
            mapInstanceRef.current = null;
        }
    }
  }, [activeTab, itinerary, isDarkMode]);

  // Fetch Language Tips
  useEffect(() => {
    if (activeTab === 'language' && languageTips.length === 0 && !isLoadingTips) {
        setIsLoadingTips(true);
        getLanguageTips(itinerary.destination).then(tips => {
            setLanguageTips(tips);
            setIsLoadingTips(false);
        });
    }
  }, [activeTab, itinerary.destination]);

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput;
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    setChatMessages(prev => [...prev, { role: 'user', text: userMsg, timestamp }]);
    setChatInput('');
    setIsChatLoading(true);
    
    try {
        const response = await chatWithConcierge(chatMessages, userMsg, itinerary);
        const respTimestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        setChatMessages(prev => [...prev, { role: 'model', text: response, timestamp: respTimestamp }]);
    } catch (error) {
        setChatMessages(prev => [...prev, { role: 'model', text: "Sorry, I lost connection. Try again?", timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    } finally {
        setIsChatLoading(false);
    }
  };

  const handleExport = async () => {
    if (!exportRef.current) return;
    const element = exportRef.current;
    
    // Temporarily ensure display is block to capture
    const originalDisplay = element.style.display;
    element.style.display = 'block';
    
    try {
        const canvas = await html2canvas(element, { scale: 3, useCORS: true, backgroundColor: null });
        element.style.display = originalDisplay; // Restore
        
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        
        // Center vertically if it's smaller than a page
        const yOffset = pdfHeight < 297 ? (297 - pdfHeight) / 2 : 0;
        
        pdf.addImage(imgData, 'PNG', 0, yOffset, pdfWidth, pdfHeight);
        pdf.save(`${itinerary.destination}_BoardingPass.pdf`);
    } catch (e) {
        console.error("Export failed", e);
        element.style.display = originalDisplay;
    }
  };

  const convertAmount = (amount: number, from: string, to: string) => {
    if (from === to) return amount;
    const f = from.toUpperCase();
    const t = to.toUpperCase();
    const fromRate = EXCHANGE_RATES[f];
    const toRate = EXCHANGE_RATES[t];
    if (!fromRate || !toRate) return amount; 
    const inUSD = amount / fromRate;
    return Math.round(inUSD * toRate);
  };

  const displayedBudget = {
    ...itinerary.budgetBreakdown,
    currency: currency,
    accommodation: convertAmount(itinerary.budgetBreakdown.accommodation, itinerary.budgetBreakdown.currency, currency),
    food: convertAmount(itinerary.budgetBreakdown.food, itinerary.budgetBreakdown.currency, currency),
    activities: convertAmount(itinerary.budgetBreakdown.activities, itinerary.budgetBreakdown.currency, currency),
    transport: convertAmount(itinerary.budgetBreakdown.transport, itinerary.budgetBreakdown.currency, currency),
    misc: convertAmount(itinerary.budgetBreakdown.misc, itinerary.budgetBreakdown.currency, currency),
    totalEstimated: convertAmount(itinerary.budgetBreakdown.totalEstimated, itinerary.budgetBreakdown.currency, currency),
  };

  // --- FULL ITINERARY PDF GENERATION (ARTSY) ---
  const handleDownloadFullItinerary = async () => {
    if (!fullItineraryContainerRef.current) return;
    
    const container = fullItineraryContainerRef.current;
    
    // 1. Reveal container off-screen but rendered
    container.style.display = 'block';
    
    try {
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth(); // 210mm
        const pdfHeight = pdf.internal.pageSize.getHeight(); // 297mm
        
        // Get all "page" elements inside the container
        const pages = container.querySelectorAll('.pdf-page');
        
        for (let i = 0; i < pages.length; i++) {
            const page = pages[i] as HTMLElement;
            
            // Capture page
            const canvas = await html2canvas(page, { 
                scale: 2, // Higher scale for quality
                useCORS: true,
                logging: false,
                backgroundColor: '#FFFDF5' // neo-bg
            });
            
            const imgData = canvas.toDataURL('image/png');
            
            if (i > 0) pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        }
        
        pdf.save(`${itinerary.destination}_Full_Guide.pdf`);
    } catch (e) {
        console.error("PDF Generation Error", e);
    } finally {
        container.style.display = 'none';
    }
  };

  const renderChatBubble = (msg: ChatMessage, i: number) => {
      const isUser = msg.role === 'user';
      return (
          <div key={i} className={`flex w-full mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
              {!isUser && (
                  <div className="w-10 h-10 border-2 border-neo-black bg-neo-blue flex items-center justify-center mr-2 shadow-neo-sm shrink-0">
                      <Bot size={20} className="text-neo-black" />
                  </div>
              )}
              <div className={`
                  max-w-[80%] p-3 text-sm font-bold border-2 border-neo-black relative
                  ${isUser 
                      ? 'bg-neo-yellow text-neo-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' 
                      : 'bg-white dark:bg-[#222] text-black dark:text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_#fff]'}
              `}>
                  {msg.text}
                  {msg.timestamp && (
                      <div className={`text-[9px] font-mono mt-2 pt-1 border-t border-black/10 dark:border-white/20 ${isUser ? 'text-black/60' : 'text-gray-500'} text-right`}>
                          {msg.timestamp}
                      </div>
                  )}
              </div>
              {isUser && (
                  <div className="w-10 h-10 border-2 border-neo-black bg-neo-pink flex items-center justify-center ml-2 shadow-neo-sm shrink-0">
                      <User size={20} className="text-neo-black" />
                  </div>
              )}
          </div>
      );
  };

  return (
    <div className="w-full h-full flex flex-col md:flex-row gap-0 md:gap-8 overflow-hidden animate-slide-up relative bg-neo-bg dark:bg-neo-black">
      
      {/* 
          =============================================
          HIDDEN PRINTABLE CONTAINERS (For Capture) 
          =============================================
      */}
      
      {/* 1. Boarding Pass (Single Ticket View) */}
      <div ref={exportRef} className="fixed top-0 left-0 -z-50 w-[400px] bg-neo-yellow border-8 border-neo-black p-8 font-sans text-neo-black hidden">
          <div className="border-b-4 border-dashed border-neo-black pb-6 mb-6">
              <div className="flex justify-between items-start">
                  <div>
                      <div className="font-black text-5xl uppercase tracking-tighter leading-none">{itinerary.destination.substring(0, 3)}</div>
                      <div className="font-black text-2xl uppercase tracking-widest">{itinerary.destination}</div>
                  </div>
                  <div className="border-4 border-neo-black px-4 py-2 font-black text-3xl rotate-6 bg-neo-white shadow-[4px_4px_0px_0px_#000]">
                      {itinerary.days.length}D
                  </div>
              </div>
              <div className="mt-4 flex items-center gap-2">
                  <Plane size={24} className="text-neo-black" />
                  <span className="font-mono text-xs font-bold uppercase tracking-widest">TRIPTAILS AIRLINES // CL: FIRST</span>
              </div>
          </div>
          
          <div className="space-y-6">
              <div className="bg-neo-white border-4 border-neo-black p-4 shadow-[4px_4px_0px_0px_#000]">
                  <div className="text-[10px] font-black uppercase text-gray-500 mb-1">Mission Directive</div>
                  <div className="font-bold text-sm leading-tight">{itinerary.summary.substring(0, 150)}...</div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                  <div>
                      <div className="text-[10px] font-black uppercase text-gray-500">Est. Budget</div>
                      <div className="font-black text-2xl bg-neo-green inline-block px-1">{displayedBudget.currency} {displayedBudget.totalEstimated.toLocaleString()}</div>
                  </div>
                  <div className="text-right">
                      <div className="text-[10px] font-black uppercase text-gray-500">Theme</div>
                      <div className="font-black text-xl uppercase text-neo-pink">{itinerary.days[0]?.theme.split(' ')[0] || 'ADVENTURE'}</div>
                  </div>
              </div>
          </div>

          <div className="mt-12 border-t-4 border-neo-black pt-6 flex justify-between items-end">
              <div className="flex gap-1.5 h-12">
                   {[...Array(20)].map((_, i) => (
                       <div key={i} className={`w-1.5 bg-neo-black ${Math.random() > 0.5 ? 'w-1' : 'w-2'}`}></div>
                   ))}
              </div>
              <div className="text-right">
                  <div className="font-black text-lg">ADMIT ONE</div>
                  <div className="font-mono text-[8px] text-gray-500">GEN: {new Date().toLocaleDateString()}</div>
              </div>
          </div>
          
          <div className="absolute top-4 right-4 opacity-10">
              <Globe size={120} />
          </div>
      </div>

      {/* 2. Full Itinerary (Multi-Page PDF Structure) */}
      <div ref={fullItineraryContainerRef} className="fixed top-0 left-0 -z-50 w-[794px] hidden font-sans text-neo-black">
          
          {/* Page 1: COVER */}
          <div className="pdf-page w-[794px] h-[1123px] bg-neo-bg border-8 border-neo-black p-12 relative flex flex-col justify-between overflow-hidden">
                {/* Background Art */}
                <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                    <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-neo-pink blur-3xl"></div>
                    <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-neo-blue blur-3xl"></div>
                    <div className="w-full h-full" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
                </div>

                <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 bg-neo-black text-neo-white flex items-center justify-center rounded-full">
                            <Globe size={24} />
                        </div>
                        <span className="font-black text-xl tracking-widest">TRIPTAILS</span>
                    </div>
                    
                    <h1 className="text-[120px] leading-[0.85] font-black font-display uppercase tracking-tighter mb-4 text-neo-black">
                        {itinerary.destination}
                    </h1>
                    <div className="inline-block bg-neo-yellow border-4 border-neo-black px-6 py-2 font-mono font-bold text-2xl shadow-[8px_8px_0px_0px_#000]">
                        {itinerary.days.length} DAY ADVENTURE
                    </div>
                </div>

                <div className="relative z-10 border-t-8 border-neo-black pt-8">
                    <div className="grid grid-cols-2 gap-12">
                        <div>
                            <h3 className="font-black uppercase text-xl mb-2 flex items-center gap-2"><Info size={24}/> Briefing</h3>
                            <p className="font-medium text-lg leading-relaxed border-l-4 border-neo-blue pl-4">
                                {itinerary.summary}
                            </p>
                        </div>
                        <div className="bg-white border-4 border-neo-black p-6 shadow-[8px_8px_0px_0px_#000]">
                            <h3 className="font-black uppercase text-xl mb-4 border-b-4 border-neo-black pb-2">Logistics</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between">
                                    <span className="font-bold text-gray-500">EST. COST</span>
                                    <span className="font-black text-xl">{displayedBudget.currency} {displayedBudget.totalEstimated.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-bold text-gray-500">TRAVELERS</span>
                                    <span className="font-black text-xl">GROUP</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-bold text-gray-500">STYLE</span>
                                    <span className="font-black text-xl uppercase">{itinerary.days[0].theme.split(' ')[0]}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
          </div>

          {/* Page 2+: DAILY PLANS (1 Day per page for art space) */}
          {itinerary.days.map((day, idx) => (
              <div key={idx} className="pdf-page w-[794px] h-[1123px] bg-neo-white border-8 border-neo-black p-12 relative flex flex-col overflow-hidden">
                  {/* Decorative Header */}
                  <div className="flex justify-between items-end border-b-8 border-neo-black pb-6 mb-8 relative z-10">
                      <div>
                          <div className="font-mono font-bold text-gray-500 mb-2">SEQUENCE {String(day.day).padStart(2, '0')}</div>
                          <h2 className="text-6xl font-black uppercase text-neo-black leading-none">Day {day.day}</h2>
                      </div>
                      <div className="text-right">
                          <div className={`inline-block px-4 py-2 font-black text-xl uppercase border-4 border-neo-black shadow-[4px_4px_0px_0px_#000] ${idx % 2 === 0 ? 'bg-neo-green' : 'bg-neo-pink'}`}>
                              {day.theme}
                          </div>
                      </div>
                  </div>

                  {/* Content Area */}
                  <div className="flex-1 relative z-10 space-y-6">
                      {day.activities.map((act, i) => (
                          <div key={i} className="flex gap-6 group">
                              <div className="w-24 shrink-0 pt-2 flex flex-col items-center">
                                  <div className="font-mono font-black text-xl bg-neo-black text-neo-white px-2 py-1 rotate-[-2deg]">
                                      {act.time}
                                  </div>
                                  <div className="w-1 flex-1 bg-neo-black/20 my-2 rounded-full dashed-line"></div>
                              </div>
                              <div className="flex-1 bg-white border-4 border-neo-black p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] relative overflow-hidden">
                                  {/* Art Doodle Background */}
                                  <div className="absolute top-[-10px] right-[-10px] opacity-10">
                                      {act.category === 'Food' ? <Utensils size={100} /> : 
                                       act.category === 'Sightseeing' ? <Camera size={100} /> :
                                       act.category === 'Adventure' ? <Mountain size={100} /> :
                                       <MapPin size={100} />}
                                  </div>
                                  
                                  <div className="relative z-10">
                                      <div className="flex justify-between items-start mb-2">
                                          <h3 className="font-black text-2xl uppercase leading-tight w-3/4">{act.name}</h3>
                                          <div className="flex gap-2">
                                              {act.price && <span className="font-bold text-xs bg-gray-100 border border-black px-2 py-1">{act.price}</span>}
                                          </div>
                                      </div>
                                      <div className="flex gap-2 mb-3">
                                          <span className={`text-[10px] font-black uppercase px-2 py-0.5 border border-neo-black ${act.category === 'Offbeat' ? 'bg-neo-purple text-neo-white' : 'bg-neo-yellow'}`}>
                                              {act.category}
                                          </span>
                                          {act.duration && <span className="text-[10px] font-bold border border-neo-black px-2 py-0.5">{act.duration}</span>}
                                      </div>
                                      <p className="font-medium text-sm leading-relaxed text-gray-700">
                                          {act.description}
                                      </p>
                                      {act.packingSuggestions && act.packingSuggestions.length > 0 && (
                                          <div className="mt-3 pt-3 border-t-2 border-dashed border-gray-300 flex items-center gap-2 text-xs font-bold text-gray-500">
                                              <ShoppingBag size={12}/> Bring: {act.packingSuggestions.join(', ')}
                                          </div>
                                      )}
                                  </div>
                              </div>
                          </div>
                      ))}
                  </div>

                  {/* Footer Decoration */}
                  <div className="absolute bottom-4 left-12 right-12 flex justify-between items-center opacity-50">
                      <div className="font-mono text-xs">TRIPTAILS GENERATED</div>
                      <div className="flex gap-1">
                          {[0,1,2].map(k => <div key={k} className="w-2 h-2 bg-neo-black rounded-full"></div>)}
                      </div>
                  </div>
              </div>
          ))}
          
          {/* Page Last: SUMMARY / NOTES */}
          <div className="pdf-page w-[794px] h-[1123px] bg-neo-bg border-8 border-neo-black p-12 relative flex flex-col justify-center items-center">
                <div className="border-4 border-neo-black p-12 bg-white shadow-[15px_15px_0px_0px_#000] text-center max-w-lg relative">
                    <div className="absolute -top-6 -left-6 bg-neo-blue border-4 border-neo-black p-4 rounded-full">
                        <CheckCircle2 size={40} className="text-neo-black"/>
                    </div>
                    <h2 className="text-4xl font-black uppercase mb-4">You're All Set!</h2>
                    <p className="font-medium text-lg mb-8">
                        This itinerary was crafted by TripTails AI specifically for your trip to {itinerary.destination}.
                        Don't forget to pack your passport!
                    </p>
                    <div className="font-mono text-sm text-gray-500 uppercase tracking-widest">
                        Safe Travels
                    </div>
                </div>
                
                <div className="mt-20 w-full max-w-xl border-t-4 border-dashed border-neo-black pt-8">
                    <h3 className="font-black uppercase text-xl mb-4">Travel Notes</h3>
                    {[1,2,3,4,5].map(line => (
                        <div key={line} className="w-full h-12 border-b-2 border-gray-300 mb-2"></div>
                    ))}
                </div>
          </div>

      </div>

      <div ref={hiddenChartRef} style={{ position: 'absolute', top: '-9999px', left: '-9999px', width: '400px', height: '400px' }}>
          <BudgetChart budget={displayedBudget} isDarkMode={isDarkMode} />
      </div>

      {/* Sidebar Navigation (Tabs) - MOVED ORDER FOR MOBILE */}
      <div className="w-full md:w-20 bg-neo-white dark:bg-[#1a1a1a] border-t-4 md:border-t-0 md:border-r-4 border-neo-black dark:border-gray-600 shadow-neo-sm md:shadow-neo z-30 flex flex-row md:flex-col shrink-0 overflow-x-auto md:overflow-visible order-last md:order-first safe-area-bottom">
         <button onClick={onReset} className="p-3 md:p-4 hover:bg-neo-pink dark:hover:bg-neo-pink transition-colors group flex-1 md:flex-none flex justify-center border-r md:border-r-0 md:border-b border-neo-black/10 dark:border-gray-700" title="Back">
             <ArrowLeft size={20} className="text-neo-black dark:text-gray-300 group-hover:scale-110 transition-transform"/>
         </button>
         <button onClick={() => setActiveTab('itinerary')} className={`p-3 md:p-4 transition-all flex-1 md:flex-none flex justify-center border-r md:border-r-0 md:border-b border-neo-black/10 dark:border-gray-700 ${activeTab === 'itinerary' ? 'bg-neo-yellow' : 'hover:bg-gray-100 dark:hover:bg-[#252525]'}`}>
             <FileText size={20} className={`text-neo-black ${activeTab === 'itinerary' ? 'scale-110' : 'dark:text-gray-300'}`} />
         </button>
         <button onClick={() => setActiveTab('budget')} className={`p-3 md:p-4 transition-all flex-1 md:flex-none flex justify-center border-r md:border-r-0 md:border-b border-neo-black/10 dark:border-gray-700 ${activeTab === 'budget' ? 'bg-neo-green' : 'hover:bg-gray-100 dark:hover:bg-[#252525]'}`}>
             <span className={`font-black text-lg ${activeTab === 'budget' ? 'text-neo-black' : 'text-neo-black dark:text-gray-300'}`}>$</span>
         </button>
         <button onClick={() => setActiveTab('map')} className={`p-3 md:p-4 transition-all flex-1 md:flex-none flex justify-center border-r md:border-r-0 md:border-b border-neo-black/10 dark:border-gray-700 ${activeTab === 'map' ? 'bg-neo-blue' : 'hover:bg-gray-100 dark:hover:bg-[#252525]'}`}>
             <MapIcon size={20} className={`text-neo-black ${activeTab === 'map' ? 'scale-110' : 'dark:text-gray-300'}`} />
         </button>
         <button onClick={() => setActiveTab('language')} className={`p-3 md:p-4 transition-all flex-1 md:flex-none flex justify-center border-r md:border-r-0 md:border-b border-neo-black/10 dark:border-gray-700 ${activeTab === 'language' ? 'bg-neo-purple' : 'hover:bg-gray-100 dark:hover:bg-[#252525]'}`}>
             <Languages size={20} className={`text-neo-black ${activeTab === 'language' ? 'scale-110' : 'dark:text-gray-300'}`} />
         </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:flex-row gap-4 md:gap-8 overflow-hidden relative order-first md:order-last">
          
          {/* Main View */}
          <div className="flex-1 flex flex-col overflow-hidden relative z-10">
              
              {/* Header Bar */}
              <div className="bg-neo-black dark:bg-[#121212] text-neo-white dark:text-gray-200 p-3 md:p-4 flex justify-between items-center shadow-neo-sm md:shadow-neo shrink-0 z-20 border-b-2 border-transparent dark:border-gray-800">
                  <div className="overflow-hidden">
                      <h2 className="font-black font-display text-lg md:text-3xl uppercase leading-none truncate">{itinerary.destination}</h2>
                      <p className="font-mono text-[10px] md:text-xs opacity-80 truncate">{itinerary.days.length} DAYS // {itinerary.tripName}</p>
                  </div>
                  <div className="flex gap-2 ml-2">
                       <button onClick={handleExport} className="bg-neo-yellow text-neo-black p-2 md:px-3 md:py-1 font-bold text-xs uppercase hover:bg-white transition-colors rounded-sm" title="Boarding Pass">
                           <Ticket size={16} />
                       </button>
                       <button onClick={handleDownloadFullItinerary} className="bg-neo-green text-neo-black p-2 md:px-3 md:py-1 font-bold text-xs uppercase hover:bg-white transition-colors rounded-sm" title="Full Guide">
                           <Download size={16} />
                       </button>
                  </div>
              </div>

              {/* Scrollable Content */}
              <div ref={contentRef} className="flex-1 overflow-y-auto custom-scrollbar relative">
                  
                  {/* ITINERARY VIEW */}
                  {activeTab === 'itinerary' && (
                      <div className="h-full flex flex-col">
                          
                          {/* Collapsible Trip Info */}
                          <div className="shrink-0 bg-neo-white dark:bg-[#1A1A1A] border-b-2 border-neo-black dark:border-gray-700 p-3 md:p-4 relative">
                               <button 
                                  onClick={() => setShowSummary(!showSummary)}
                                  className="w-full flex justify-between items-center text-xs font-bold uppercase text-gray-500 dark:text-gray-400 mb-1"
                               >
                                   <span>Trip Briefing</span>
                                   {showSummary ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
                               </button>
                               <p className={`font-medium text-sm md:text-base leading-relaxed text-neo-black dark:text-gray-300 transition-all overflow-hidden ${showSummary ? 'max-h-96 opacity-100' : 'max-h-0 md:max-h-20 opacity-0 md:opacity-100'}`}>
                                   {itinerary.summary}
                               </p>
                          </div>
                          
                          {/* STICKY Day Tabs */}
                          <div className="sticky top-0 z-20 bg-neo-white/95 dark:bg-[#0a0a0a]/95 backdrop-blur-sm border-b-2 border-neo-black dark:border-gray-700 py-3 px-2 overflow-x-auto whitespace-nowrap custom-scrollbar shrink-0 shadow-sm no-scrollbar">
                              <div className="flex gap-2 mx-auto w-max px-2">
                                  {itinerary.days.map((day, idx) => (
                                      <button
                                          key={idx}
                                          onClick={() => setSelectedDay(idx)}
                                          className={`
                                              px-4 py-2 border-2 rounded-full font-black text-xs uppercase transition-all
                                              ${selectedDay === idx
                                                  ? 'bg-neo-black text-neo-white border-neo-black dark:bg-gray-200 dark:text-black dark:border-gray-200'
                                                  : 'bg-white dark:bg-[#1A1A1A] text-neo-black dark:text-gray-400 border-neo-black dark:border-gray-600 hover:bg-neo-yellow dark:hover:text-black'}
                                          `}
                                      >
                                          Day {day.day}
                                      </button>
                                  ))}
                              </div>
                          </div>

                          {/* Selected Day Content */}
                          <div className="flex-1 p-3 md:p-6 pb-24 md:pb-20">
                              <div className="flex flex-col gap-1 mb-4 md:mb-6 border-b-2 border-dashed border-neo-black/10 dark:border-white/10 pb-2">
                                   <div className="flex justify-between items-end">
                                       <h3 className="font-black text-2xl md:text-4xl uppercase text-neo-black dark:text-gray-100 leading-none">Day {itinerary.days[selectedDay].day}</h3>
                                       <span className="text-[10px] font-mono opacity-50 dark:text-gray-400">{itinerary.days[selectedDay].activities.length} EVENTS</span>
                                   </div>
                                   <p className="font-bold text-neo-pink text-xs md:text-sm uppercase tracking-wide">{itinerary.days[selectedDay].theme}</p>
                              </div>

                              <div className="space-y-3 md:space-y-4">
                                  {itinerary.days[selectedDay].activities.map((act, actIdx) => (
                                      <ActivityCard key={actIdx} act={act} destination={itinerary.destination} index={actIdx} />
                                  ))}
                              </div>

                              {/* Navigation Buttons */}
                              <div className="flex justify-between mt-8 pt-6 pb-8">
                                  <button
                                      onClick={() => {
                                          if (selectedDay > 0) {
                                              setSelectedDay(selectedDay - 1);
                                              contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
                                          }
                                      }}
                                      disabled={selectedDay === 0}
                                      className="flex items-center gap-2 font-black text-xs uppercase disabled:opacity-20 hover:text-neo-blue transition-colors text-neo-black dark:text-gray-300 bg-neo-white dark:bg-[#1A1A1A] px-4 py-3 border-2 border-neo-black dark:border-gray-600 rounded-full shadow-neo-sm disabled:shadow-none"
                                  >
                                      <ArrowLeft size={14} /> Prev Day
                                  </button>
                                  <button
                                      onClick={() => {
                                          if (selectedDay < itinerary.days.length - 1) {
                                              setSelectedDay(selectedDay + 1);
                                              contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
                                          }
                                      }}
                                      disabled={selectedDay === itinerary.days.length - 1}
                                      className="flex items-center gap-2 font-black text-xs uppercase disabled:opacity-20 hover:text-neo-pink transition-colors text-neo-black dark:text-gray-300 bg-neo-white dark:bg-[#1A1A1A] px-4 py-3 border-2 border-neo-black dark:border-gray-600 rounded-full shadow-neo-sm disabled:shadow-none"
                                  >
                                      Next Day <ArrowRight size={14} />
                                  </button>
                              </div>
                          </div>
                      </div>
                  )}

                  {/* BUDGET VIEW */}
                  {activeTab === 'budget' && (
                      <div className="h-full flex flex-col p-4 animate-slide-up pb-24 md:pb-4">
                          <div className="mb-4 flex flex-col md:flex-row justify-between items-start md:items-center bg-neo-white dark:bg-[#1A1A1A] p-4 border-3 border-neo-black dark:border-gray-600 shadow-neo-sm">
                               <div>
                                   <h3 className="font-black text-xl uppercase text-neo-black dark:text-gray-200">Estimated Cost</h3>
                                   <p className="text-xs text-gray-500 dark:text-gray-400">Total for entire trip</p>
                               </div>
                               <div className="mt-2 md:mt-0 text-right w-full md:w-auto">
                                   <div className="font-black text-3xl text-neo-green font-mono">
                                       {displayedBudget.currency} {displayedBudget.totalEstimated.toLocaleString()}
                                   </div>
                               </div>
                          </div>
                          <div className="flex-1 min-h-[300px] mb-4 bg-neo-white dark:bg-[#1A1A1A] border-3 border-neo-black dark:border-gray-600 p-2 shadow-neo relative overflow-hidden">
                              <BudgetChart budget={displayedBudget} isDarkMode={isDarkMode} />
                          </div>
                      </div>
                  )}

                  {/* MAP VIEW */}
                  {activeTab === 'map' && (
                      <div className="h-full bg-neo-white dark:bg-[#1A1A1A] relative animate-slide-up">
                          <div ref={mapContainerRef} className="w-full h-full z-10" />
                          <div className="absolute bottom-20 md:bottom-4 left-4 right-4 md:right-auto bg-neo-white dark:bg-black p-2 border-2 border-neo-black dark:border-gray-600 z-20 shadow-md text-xs font-bold text-neo-black dark:text-gray-200 text-center md:text-left">
                              {itinerary.days.length} Days • {itinerary.days.flatMap(d=>d.activities).filter(a => a.coordinates).length} Spots
                          </div>
                      </div>
                  )}

                  {/* LANGUAGE VIEW */}
                  {activeTab === 'language' && (
                      <div className="p-4 h-full animate-slide-up space-y-4 pb-24 md:pb-20">
                           <div className="bg-neo-purple border-3 border-neo-black dark:border-gray-600 p-4 shadow-neo mb-4">
                               <h3 className="font-black text-xl uppercase text-neo-black mb-1">Speak Local</h3>
                               <p className="font-mono text-xs text-neo-black opacity-80">Essential phrases for {itinerary.destination}</p>
                           </div>
                           {isLoadingTips ? (
                               <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neo-black dark:border-gray-600"></div></div>
                           ) : (
                               <div className="grid grid-cols-1 gap-3">
                                   {languageTips.map((tip, i) => (
                                       <div key={i} className="bg-neo-white dark:bg-[#1A1A1A] border-2 border-neo-black dark:border-gray-600 p-3 shadow-sm flex flex-col gap-1">
                                           <div className="flex justify-between items-baseline">
                                               <div className="font-black text-base text-neo-blue">{tip.phrase}</div>
                                               <div className="font-mono text-[10px] text-gray-500 dark:text-gray-400 italic">"{tip.pronunciation}"</div>
                                           </div>
                                           <div className="text-xs font-bold text-neo-black dark:text-gray-300">{tip.meaning}</div>
                                       </div>
                                   ))}
                               </div>
                           )}
                      </div>
                  )}
              </div>
          </div>
          
          {/* Desktop Right Column (Chat) */}
          <div className="hidden md:flex flex-col w-96 shrink-0 gap-4">
               {/* Desktop Day Nav */}
               <div className="bg-neo-white dark:bg-[#1A1A1A] border-3 border-neo-black dark:border-gray-600 p-4 shadow-neo max-h-60 overflow-y-auto custom-scrollbar">
                   <h3 className="font-black text-xs uppercase mb-3 text-gray-500 dark:text-gray-400 sticky top-0 bg-neo-white dark:bg-[#1A1A1A] z-10">Quick Jump</h3>
                   <div className="space-y-2">
                       {itinerary.days.map((day, idx) => (
                           <button key={idx} onClick={() => setSelectedDay(idx)} className={`w-full text-left p-2 border-2 text-xs font-bold transition-all flex justify-between ${selectedDay === idx ? 'bg-neo-black text-neo-white dark:bg-gray-200 dark:text-black dark:border-gray-200' : 'hover:border-neo-black dark:border-gray-700 dark:text-gray-400 dark:hover:border-gray-500'}`}>
                               <span>DAY {day.day}</span>
                           </button>
                       ))}
                   </div>
               </div>
               
               {/* Chat Widget - REDESIGNED */}
               <div className="flex-1 bg-neo-white dark:bg-[#1A1A1A] border-4 border-neo-black dark:border-gray-600 shadow-neo flex flex-col overflow-hidden relative">
                   {/* Header */}
                   <div className="bg-neo-black text-white p-3 border-b-4 border-neo-black flex justify-between items-center">
                       <div className="flex items-center gap-2">
                           <div className="w-3 h-3 rounded-full bg-red-500 border border-white"></div>
                           <div className="w-3 h-3 rounded-full bg-yellow-500 border border-white"></div>
                           <div className="w-3 h-3 rounded-full bg-green-500 border border-white"></div>
                       </div>
                       <span className="font-mono text-xs font-bold tracking-widest">CONCIERGE_BOT.exe</span>
                   </div>

                   {/* Message Area */}
                   <div className="flex-1 p-4 overflow-y-auto custom-scrollbar bg-[#f8f8f8] dark:bg-[#111] relative">
                        <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '10px 10px' }}></div>
                        {chatMessages.map((msg, i) => renderChatBubble(msg, i))}
                        {isChatLoading && (
                            <div className="flex w-full mb-4 justify-start">
                                <div className="w-10 h-10 border-2 border-neo-black bg-neo-blue flex items-center justify-center mr-2 shadow-neo-sm shrink-0">
                                    <Bot size={20} className="text-neo-black" />
                                </div>
                                <TypingIndicator />
                            </div>
                        )}
                        <div ref={chatEndRef} />
                   </div>

                   {/* Input Area */}
                   <div className="p-3 bg-neo-white dark:bg-[#222] border-t-4 border-neo-black dark:border-gray-600">
                       <div className="relative flex items-center">
                           <div className="absolute left-3 text-gray-400">
                               <Terminal size={16} />
                           </div>
                           <input 
                               value={chatInput} 
                               onChange={(e) => setChatInput(e.target.value)} 
                               onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                               className="w-full bg-white dark:bg-black border-2 border-neo-black dark:border-gray-500 pl-10 pr-12 py-3 font-mono text-sm focus:outline-none focus:shadow-neo-sm transition-shadow text-black dark:text-white"
                               placeholder="Type command..." 
                           />
                           <button 
                               onClick={handleSendMessage} 
                               className="absolute right-2 p-1.5 bg-neo-black hover:bg-neo-blue text-white hover:text-black transition-colors border border-black"
                           >
                               <SendHorizontal size={16} />
                           </button>
                       </div>
                   </div>
               </div>
          </div>
      </div>

      {/* Mobile Chat Toggle */}
      <button onClick={() => setIsChatOpen(!isChatOpen)} className="md:hidden fixed bottom-24 right-4 bg-neo-pink text-neo-black p-3 rounded-full border-3 border-neo-black shadow-neo z-40">
          <MessageCircle size={24} />
      </button>

      {/* Mobile Chat Modal - REDESIGNED */}
      {isChatOpen && (
          <div className="md:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end justify-center">
              <div className="bg-neo-white dark:bg-[#1A1A1A] w-full h-[85vh] border-t-4 border-neo-black dark:border-gray-600 shadow-neo-lg flex flex-col relative animate-slide-up">
                  {/* Header */}
                  <div className="bg-neo-black text-white p-3 border-b-4 border-neo-black flex justify-between items-center">
                       <div className="flex items-center gap-2">
                           <div className="w-3 h-3 rounded-full bg-red-500 border border-white"></div>
                           <div className="w-3 h-3 rounded-full bg-yellow-500 border border-white"></div>
                           <div className="w-3 h-3 rounded-full bg-green-500 border border-white"></div>
                           <span className="font-mono text-xs font-bold tracking-widest ml-2">POCKET_CONCIERGE</span>
                       </div>
                       <button onClick={() => setIsChatOpen(false)} className="text-white"><X size={20}/></button>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 p-4 overflow-y-auto bg-[#f8f8f8] dark:bg-[#111] relative">
                       <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '10px 10px' }}></div>
                       {chatMessages.map((msg, i) => renderChatBubble(msg, i))}
                       {isChatLoading && (
                           <div className="flex w-full mb-4 justify-start">
                               <div className="w-10 h-10 border-2 border-neo-black bg-neo-blue flex items-center justify-center mr-2 shadow-neo-sm shrink-0">
                                   <Bot size={20} className="text-neo-black" />
                                </div>
                               <TypingIndicator />
                           </div>
                       )}
                       <div ref={chatEndRef} />
                  </div>

                  {/* Input */}
                  <div className="p-3 bg-neo-white dark:bg-[#222] border-t-4 border-neo-black dark:border-gray-600 pb-8 safe-area-bottom">
                       <div className="relative flex items-center">
                           <div className="absolute left-3 text-gray-400">
                               <Terminal size={16} />
                           </div>
                           <input 
                               value={chatInput} 
                               onChange={(e) => setChatInput(e.target.value)} 
                               className="w-full bg-white dark:bg-black border-2 border-neo-black dark:border-gray-500 pl-10 pr-12 py-3 font-mono text-base focus:outline-none focus:shadow-neo-sm transition-shadow text-black dark:text-white"
                               placeholder="Type command..." 
                           />
                           <button 
                               onClick={handleSendMessage} 
                               className="absolute right-2 p-1.5 bg-neo-black hover:bg-neo-blue text-white hover:text-black transition-colors border border-black"
                           >
                               <SendHorizontal size={20} />
                           </button>
                       </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default ItineraryDisplay;