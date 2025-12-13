import React, { useEffect, useState } from 'react';
import { Zap, Globe, Cloud, Star, Disc, Sun, Umbrella, Anchor, Fish, Building, Car, Train, Heart, Music, Gift, Camera, Compass, MapPin, Mountain, Tent, Trees, Wind } from 'lucide-react';

const BackgroundLayer: React.FC = () => {
    const [theme, setTheme] = useState('DEFAULT');

    useEffect(() => {
        const handleThemeChange = (e: CustomEvent) => {
            setTheme(e.detail);
        };
        window.addEventListener('themeChange', handleThemeChange as EventListener);
        return () => window.removeEventListener('themeChange', handleThemeChange as EventListener);
    }, []);

    const getIcons = () => {
        switch (theme) {
            case 'TROPICAL':
                return (
                    <>
                        <Sun className="absolute top-20 left-[10%] w-16 h-16 text-neo-yellow animate-spin-slow" />
                        <Umbrella className="absolute bottom-32 right-[15%] w-20 h-20 text-neo-pink -rotate-12" />
                        <Fish className="absolute top-[15%] right-[5%] w-24 h-24 text-neo-blue animate-bounce" />
                        <Anchor className="absolute bottom-10 left-[5%] w-16 h-16 text-neo-black opacity-20" />
                        <Cloud className="absolute top-[60%] left-[2%] w-20 h-20 text-neo-white" />
                    </>
                );
            case 'URBAN':
                return (
                    <>
                        <Building className="absolute top-20 left-[5%] w-20 h-20 text-neo-purple" />
                        <Car className="absolute bottom-32 right-[10%] w-16 h-16 text-neo-blue animate-pulse" />
                        <Zap className="absolute top-[15%] right-[5%] w-12 h-12 text-neo-yellow animate-bounce" />
                        <Train className="absolute bottom-10 left-[5%] w-24 h-24 text-neo-green opacity-40" />
                        <Disc className="absolute top-[50%] left-[2%] w-16 h-16 text-neo-pink animate-spin" />
                    </>
                );
            case 'ROMANTIC':
                return (
                    <>
                        <Heart className="absolute top-20 left-[10%] w-16 h-16 text-neo-pink animate-pulse" />
                        <Music className="absolute bottom-32 right-[15%] w-16 h-16 text-neo-purple animate-bounce" />
                        <Gift className="absolute top-[15%] right-[5%] w-20 h-20 text-neo-blue" />
                        <Camera className="absolute bottom-10 left-[5%] w-16 h-16 text-neo-yellow -rotate-12" />
                        <Star className="absolute top-[60%] left-[2%] w-12 h-12 text-neo-yellow animate-spin-slow" />
                    </>
                );
            case 'DESERT':
                return (
                    <>
                        <Sun className="absolute top-10 left-[15%] w-24 h-24 text-neo-orange animate-spin-slow" />
                        <Compass className="absolute bottom-20 right-[10%] w-20 h-20 text-neo-blue" />
                        <MapPin className="absolute top-[20%] right-[5%] w-16 h-16 text-neo-pink animate-bounce" />
                        <Wind className="absolute bottom-10 left-[5%] w-24 h-24 text-neo-yellow opacity-40" />
                    </>
                );
            case 'FOREST':
                return (
                    <>
                        <Trees className="absolute top-20 left-[8%] w-24 h-24 text-neo-green" />
                        <Mountain className="absolute bottom-20 right-[12%] w-32 h-32 text-neo-purple opacity-30" />
                        <Tent className="absolute top-[15%] right-[5%] w-16 h-16 text-neo-orange" />
                        <Cloud className="absolute bottom-10 left-[5%] w-20 h-20 text-neo-blue animate-pulse" />
                    </>
                );
            default:
                return (
                    <>
                        <Zap className="absolute top-20 left-[10%] w-12 h-12 text-neo-yellow animate-pulse" />
                        <Globe className="absolute bottom-32 right-[15%] w-24 h-24 text-neo-blue animate-spin-slow" />
                        <Cloud className="absolute top-[15%] right-[5%] w-32 h-32 text-neo-pink" />
                        <Star className="absolute bottom-10 left-[5%] w-16 h-16 text-neo-green animate-bounce" />
                        <Disc className="absolute top-[60%] left-[2%] w-20 h-20 text-neo-purple animate-spin" />
                    </>
                );
        }
    };

    return (
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden opacity-20 dark:opacity-10 transition-all duration-500">
            {getIcons()}
            
            {/* Geometric Shapes - Consistent across themes but colors change via CSS vars */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border-4 border-neo-black dark:border-gray-800 rounded-full opacity-5"></div>
            <div className="absolute top-1/4 left-1/4 w-4 h-4 bg-neo-black dark:bg-white rotate-45"></div>
            <div className="absolute bottom-1/4 right-1/4 w-4 h-4 bg-neo-black dark:bg-white rounded-full"></div>
        </div>
    );
};

export default BackgroundLayer;