export interface ThemePalette {
    bg: string;
    pink: string;
    blue: string;
    yellow: string;
    green: string;
    purple: string;
    orange: string;
    fontDisplay: string;
    fontSans: string;
    name: string;
}

export const PALETTES: Record<string, ThemePalette> = {
    DEFAULT: {
        name: 'DEFAULT',
        bg: '#FFFDF5',
        pink: '#FF90E8',
        blue: '#90F2FF',
        yellow: '#FFCE63',
        green: '#B0FF90',
        purple: '#E0B0FF',
        orange: '#FFAB76',
        fontDisplay: 'Lexend Mega',
        fontSans: 'Public Sans'
    },
    TROPICAL: { // Hawaii, Bali, Caribbean
        name: 'TROPICAL',
        bg: '#F0FFF4',
        pink: '#FF6B6B', // Coral
        blue: '#4ECDC4', // Teal
        yellow: '#FFE66D', // Sunny
        green: '#C7F464', // Lime
        purple: '#FF8C42', // Orange-ish
        orange: '#FF8C42',
        fontDisplay: 'Lexend Mega',
        fontSans: 'Public Sans'
    },
    URBAN: { // Tokyo, New York, London (Cyber/Neon)
        name: 'URBAN',
        bg: '#F5F5F5',
        pink: '#FF00FF', // Magenta
        blue: '#00FFFF', // Cyan
        yellow: '#EAFF00', // Neon Yellow
        green: '#00FF99', // Neon Green
        purple: '#BC13FE', // Neon Purple
        orange: '#FF4D00', // Neon Orange
        fontDisplay: 'Space Mono',
        fontSans: 'Public Sans'
    },
    ROMANTIC: { // Paris, Venice, Rome (Pastels)
        name: 'ROMANTIC',
        bg: '#FFF0F5',
        pink: '#FFB7B2',
        blue: '#AEC6CF',
        yellow: '#FDFD96',
        green: '#77DD77',
        purple: '#C3B1E1',
        orange: '#FFDAC1',
        fontDisplay: 'Playfair Display',
        fontSans: 'Public Sans'
    },
    DESERT: { // Egypt, Dubai, Vegas (Warm)
        name: 'DESERT',
        bg: '#FFF8E7',
        pink: '#E27D60',
        blue: '#85DCB0', // Oasis
        yellow: '#F4A261', // Sand
        green: '#2A9D8F',
        purple: '#E76F51', // Burnt Sienna
        orange: '#F4A261',
        fontDisplay: 'Lexend Mega',
        fontSans: 'Public Sans'
    },
    FOREST: { // Canada, Portland, Swiss Alps
        name: 'FOREST',
        bg: '#F1F8E9',
        pink: '#D7CCC8', // Mushroom
        blue: '#81D4FA', // Sky
        yellow: '#FFD54F', // Sun
        green: '#66BB6A', // Leaf
        purple: '#8D6E63', // Wood
        orange: '#FFCA28',
        fontDisplay: 'Public Sans',
        fontSans: 'Public Sans'
    }
};

const KEYWORDS: Record<string, string[]> = {
    TROPICAL: ['hawaii', 'bali', 'maldives', 'fiji', 'beach', 'island', 'caribbean', 'cancun', 'thailand', 'tropical', 'ocean', 'costa rica'],
    URBAN: ['tokyo', 'new york', 'nyc', 'london', 'berlin', 'seoul', 'shanghai', 'hong kong', 'city', 'singapore', 'dubai', 'cyberpunk'],
    ROMANTIC: ['paris', 'venice', 'rome', 'florence', 'prague', 'kyoto', 'wedding', 'honeymoon', 'vienna', 'amsterdam', 'italy', 'france'],
    DESERT: ['egypt', 'cairo', 'vegas', 'nevada', 'arizona', 'dubai', 'morocco', 'sahara', 'jordan', 'petra'],
    FOREST: ['canada', 'vancouver', 'swiss', 'alps', 'portland', 'seattle', 'norway', 'sweden', 'finland', 'hiking', 'nature', 'park']
};

export const applyTheme = (destination: string) => {
    const dest = destination.toLowerCase();
    let selectedPalette = PALETTES.DEFAULT;

    // Keyword matching
    for (const [key, words] of Object.entries(KEYWORDS)) {
        if (words.some(word => dest.includes(word))) {
            selectedPalette = PALETTES[key];
            break;
        }
    }

    // If no keyword match, hash the string to pick a "random" consistent palette
    if (selectedPalette === PALETTES.DEFAULT && destination.length > 0) {
        const hash = dest.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const paletteKeys = Object.keys(PALETTES).filter(k => k !== 'DEFAULT');
        const randomKey = paletteKeys[hash % paletteKeys.length];
        selectedPalette = PALETTES[randomKey];
    }

    const root = document.documentElement;
    root.style.setProperty('--neo-bg', selectedPalette.bg);
    root.style.setProperty('--neo-pink', selectedPalette.pink);
    root.style.setProperty('--neo-blue', selectedPalette.blue);
    root.style.setProperty('--neo-yellow', selectedPalette.yellow);
    root.style.setProperty('--neo-green', selectedPalette.green);
    root.style.setProperty('--neo-purple', selectedPalette.purple);
    root.style.setProperty('--neo-orange', selectedPalette.orange);
    root.style.setProperty('--neo-font-display', selectedPalette.fontDisplay);
    root.style.setProperty('--neo-font-sans', selectedPalette.fontSans);

    // Dispatch event for React components to update assets
    window.dispatchEvent(new CustomEvent('themeChange', { detail: selectedPalette.name }));
};