import React, { useState } from 'react';
import { generatePlaylist } from '../services/geminiService';
import { Song } from '../types';
import { Disc, Play, ExternalLink, RefreshCw, Music } from 'lucide-react';
import { applyTheme } from '../utils/theme';

const VIBES = ["Chill", "Upbeat", "Romantic", "Underground", "Classic", "Electronic", "Folk", "Jazz"];

const SonicSouvenirs: React.FC = () => {
    const [destination, setDestination] = useState('');
    const [vibe, setVibe] = useState('Chill');
    const [playlist, setPlaylist] = useState<Song[]>([]);
    const [loading, setLoading] = useState(false);

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!destination) return;
        
        applyTheme(destination);
        setLoading(true);
        try {
            const songs = await generatePlaylist(destination, vibe);
            setPlaylist(songs);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full h-full flex flex-col md:flex-row gap-6 p-4 md:p-8 animate-slide-up overflow-hidden">
            {/* Control Panel */}
            <div className="w-full md:w-1/3 bg-neo-white dark:bg-neo-darkgray border-4 border-neo-black dark:border-neo-white shadow-neo dark:shadow-neo-white p-6 flex flex-col gap-6 h-fit">
                <div className="border-b-4 border-neo-black dark:border-neo-white pb-4">
                    <h2 className="text-3xl font-black font-display uppercase leading-none text-neo-black dark:text-neo-white">SONIC<br/><span className="text-neo-pink">SOUVENIRS</span></h2>
                </div>
                
                <form onSubmit={handleGenerate} className="flex flex-col gap-4">
                    <div>
                        <label className="font-bold text-xs uppercase mb-1 block text-neo-black dark:text-neo-white">Destination</label>
                        <input 
                            type="text" 
                            value={destination}
                            onChange={(e) => setDestination(e.target.value)}
                            placeholder="E.G. BERLIN" 
                            className="w-full border-3 border-neo-black dark:border-neo-white p-3 font-mono font-bold focus:bg-neo-yellow focus:outline-none text-neo-black"
                            required
                        />
                    </div>
                    <div>
                        <label className="font-bold text-xs uppercase mb-1 block text-neo-black dark:text-neo-white">Vibe</label>
                        <div className="flex flex-wrap gap-2">
                            {VIBES.map(v => (
                                <button
                                    key={v}
                                    type="button"
                                    onClick={() => setVibe(v)}
                                    className={`px-3 py-1 border-2 border-neo-black dark:border-neo-white text-xs font-bold uppercase transition-all
                                        ${vibe === v ? 'bg-neo-black text-neo-white dark:bg-neo-white dark:text-neo-black' : 'bg-white dark:bg-transparent text-neo-black dark:text-neo-white hover:bg-gray-200'}
                                    `}
                                >
                                    {v}
                                </button>
                            ))}
                        </div>
                    </div>
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="bg-neo-pink border-3 border-neo-black dark:border-neo-white p-4 font-black uppercase hover:shadow-neo-sm transition-all flex items-center justify-center gap-2 text-neo-black"
                    >
                        {loading ? <RefreshCw className="animate-spin" /> : <Play fill="black" />}
                        {loading ? 'Mixing...' : 'Generate Mix'}
                    </button>
                </form>

                <div className="bg-neo-yellow p-4 border-3 border-neo-black dark:border-neo-white text-xs font-mono text-neo-black">
                    <p className="font-bold mb-2">NOTE:</p>
                    <p>This module generates a curated list of songs that match the soul of your destination. Perfect for building your travel playlist.</p>
                </div>
            </div>

            {/* Playlist Display */}
            <div className="flex-1 bg-neo-black dark:bg-neo-white border-4 border-neo-black dark:border-neo-white p-1 relative overflow-hidden flex flex-col">
                <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                     <Disc size={400} className="absolute -right-20 -bottom-20 text-white dark:text-black animate-spin-slow" />
                </div>

                <div className="bg-white dark:bg-neo-darkgray h-full w-full border-2 border-white dark:border-neo-black p-4 md:p-8 overflow-y-auto custom-scrollbar relative z-10">
                    {playlist.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-50">
                            <Music size={64} className="mb-4" />
                            <p className="font-black font-display text-2xl uppercase">NO TAPE LOADED</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                             <div className="flex justify-between items-end border-b-4 border-neo-black dark:border-neo-white pb-4 mb-6">
                                <div>
                                    <h3 className="font-black text-2xl md:text-4xl uppercase text-neo-black dark:text-neo-white">{destination}</h3>
                                    <span className="bg-neo-blue text-neo-black px-2 py-0.5 text-xs font-bold uppercase">{vibe} MIX</span>
                                </div>
                                <div className="text-right font-mono text-xs text-gray-500">
                                    VOL. 1
                                </div>
                             </div>

                             {playlist.map((song, i) => (
                                 <div key={i} className="group flex items-center gap-4 p-3 hover:bg-gray-100 dark:hover:bg-gray-800 border-b-2 border-dashed border-gray-300 dark:border-gray-600 transition-colors">
                                     <div className="font-mono font-bold text-gray-400 w-6">{(i+1).toString().padStart(2, '0')}</div>
                                     <div className="flex-1">
                                         <div className="font-black text-lg text-neo-black dark:text-neo-white uppercase">{song.title}</div>
                                         <div className="font-bold text-xs text-neo-pink">{song.artist}</div>
                                         <div className="text-[10px] text-gray-500 mt-1 font-mono">{song.reason}</div>
                                     </div>
                                     <a 
                                        href={`https://www.youtube.com/results?search_query=${encodeURIComponent(song.artist + " " + song.title)}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="w-10 h-10 border-2 border-neo-black dark:border-neo-white flex items-center justify-center hover:bg-neo-green transition-colors text-neo-black dark:text-neo-white dark:hover:text-neo-black"
                                     >
                                         <ExternalLink size={16} />
                                     </a>
                                 </div>
                             ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SonicSouvenirs;