import { GoogleGenAI, Type, Schema } from "@google/genai";
import { TripItinerary, TripPreferences, LanguageTip, SouvenirGuide, PackingCategory, Song } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const itinerarySchema: Schema = {
  type: Type.OBJECT,
  properties: {
    tripName: { type: Type.STRING, description: "Trip Name" },
    destination: { type: Type.STRING, description: "Destination" },
    summary: { type: Type.STRING, description: "Brief summary" },
    budgetBreakdown: {
      type: Type.OBJECT,
      properties: {
        accommodation: { type: Type.NUMBER },
        food: { type: Type.NUMBER },
        activities: { type: Type.NUMBER },
        transport: { type: Type.NUMBER },
        misc: { type: Type.NUMBER },
        currency: { type: Type.STRING },
        totalEstimated: { type: Type.NUMBER }
      },
      required: ["accommodation", "food", "activities", "transport", "misc", "currency", "totalEstimated"]
    },
    days: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          day: { type: Type.INTEGER },
          theme: { type: Type.STRING },
          activities: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                description: { type: Type.STRING },
                time: { type: Type.STRING },
                category: { 
                  type: Type.STRING, 
                  enum: ["Food", "Sightseeing", "Adventure", "Relaxation", "Culture", "Shopping", "Offbeat"] 
                },
                locationHint: { type: Type.STRING },
                openingHours: { type: Type.STRING },
                duration: { type: Type.STRING },
                price: { type: Type.STRING },
                packingSuggestions: { 
                  type: Type.ARRAY, 
                  items: { type: Type.STRING } 
                },
                coordinates: {
                  type: Type.OBJECT,
                  properties: {
                    lat: { type: Type.NUMBER },
                    lng: { type: Type.NUMBER }
                  },
                  required: ["lat", "lng"]
                }
              },
              required: ["name", "description", "time", "category", "duration", "packingSuggestions"]
            }
          }
        },
        required: ["day", "theme", "activities"]
      }
    }
  },
  required: ["tripName", "destination", "summary", "budgetBreakdown", "days"]
};

export const generateItinerary = async (prefs: TripPreferences): Promise<TripItinerary> => {
  const isOffbeat = prefs.interests.includes("Offbeat");
  
  const prompt = `
    System: You are a world-class travel agent.
    Task: Plan a detailed ${prefs.duration}-day trip to ${prefs.destination} for a ${prefs.travelers} group in ${prefs.travelMonth}.
    Budget Level: ${prefs.budget}. Interests: ${prefs.interests.join(", ")}.
    
    Requirements:
    1. Realistic daily schedule considering the season (${prefs.travelMonth}).
    2. Logical flow by location.
    3. Specific details (opening hours, price, duration).
    4. Realistic budget breakdown in local currency.
    5. Provide ESTIMATED GPS coordinates (lat/lng) for each activity.
    6. JSON output only.

    ${isOffbeat ? `
    IMPORTANT: The user has selected "Offbeat" travel.
    - You MUST prioritize hidden gems, secret spots, and non-touristy locations.
    - Avoid the most common tourist traps unless absolutely essential (and even then, suggest a unique angle).
    - Focus on unique, local experiences and less crowded areas.
    - Use the category 'Offbeat' for these unique locations.
    ` : ''}
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: itinerarySchema,
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as TripItinerary;
    }
    throw new Error("No itinerary generated.");
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

export const generateSouvenirs = async (destination: string, budget: string, duration: string): Promise<SouvenirGuide | null> => {
    const prompt = `Create a complete souvenir guide for ${destination} (Budget: ${budget}, Duration: ${duration}).
    Consider the trip duration: if short, suggest accessible items; if long, suggest custom or hard-to-find items.
    1. List 8 unique souvenirs (mix of traditional, food, art, modern).
    2. Determine the negotiation style (Fixed Price, Casual Bargaining, or Aggressive Bargaining).
    3. Provide 3 specific negotiation tips for this culture.
    4. List 3-5 restricted items or scams to avoid (e.g. "Ivory", "Fake Antiques").
    5. List 4 unique "collectible stamps" or "postmarks" people can get here (e.g. Eki stamps in Japan, National Park passport stamps, museum ink stamps, or iconic post office cancellations).
    Return strictly JSON.`;

    const schema: Schema = {
      type: Type.OBJECT,
      properties: {
        items: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              description: { type: Type.STRING },
              category: { type: Type.STRING, enum: ['Traditional', 'Food', 'Art', 'Modern', 'Kitsch'] },
              priceRange: { type: Type.STRING },
              authenticityTip: { type: Type.STRING }
            },
            required: ["name", "description", "category", "priceRange", "authenticityTip"]
          }
        },
        negotiationStyle: { 
          type: Type.STRING, 
          enum: ['Fixed Price', 'Casual Bargaining', 'Aggressive Bargaining'] 
        },
        negotiationTips: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        },
        restrictedItems: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        },
        collectibleStamps: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              location: { type: Type.STRING },
              description: { type: Type.STRING }
            },
            required: ["name", "location", "description"]
          }
        }
      },
      required: ["items", "negotiationStyle", "negotiationTips", "restrictedItems", "collectibleStamps"]
    };

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: schema
            }
        });
        return response.text ? JSON.parse(response.text) : null;
    } catch (e) {
        console.error("Souvenir Error", e);
        return null;
    }
};

export const generatePackingList = async (destination: string, month: string, type: string): Promise<PackingCategory[]> => {
    const prompt = `Create a smart packing list for ${destination} in ${month} for a ${type} trip.
    Categorize items (e.g., Clothing, Tech, Toiletries, Documents).
    Include weather-specific items for that month.
    Return strictly JSON.`;

    const schema: Schema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                category: { type: Type.STRING },
                items: { 
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                }
            },
            required: ["category", "items"]
        }
    };

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: schema
            }
        });
        return response.text ? JSON.parse(response.text) : [];
    } catch (e) {
        console.error("Packing List Error", e);
        return [];
    }
};

export const chatWithConcierge = async (history: any[], message: string, itineraryContext: TripItinerary): Promise<string> => {
    const contextPrompt = `
      You are the "Pocket Concierge" for a traveler currently on this trip:
      Destination: ${itineraryContext.destination}
      Trip Summary: ${itineraryContext.summary}
      
      User Question: ${message}
      
      Answer briefly, helpfully, and with a friendly travel guide personality.
      If asked about specific days, refer to the context implicitly.
    `;

    // Construct simple history for now, appending the new message
    // Note: For a real chat, we'd maintain the chat session object.
    const chat = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: { systemInstruction: "You are a helpful travel assistant." }
    });

    const response = await chat.sendMessage({ message: contextPrompt });
    return response.text || "I'm having trouble connecting to the concierge service.";
};

export const getLanguageTips = async (destination: string): Promise<LanguageTip[]> => {
    const prompt = `Provide 10 essential travel phrases for a tourist visiting ${destination}. 
    Return strictly JSON array.
    `;
    
    const schema: Schema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                phrase: { type: Type.STRING },
                pronunciation: { type: Type.STRING },
                meaning: { type: Type.STRING },
            },
            required: ["phrase", "pronunciation", "meaning"]
        }
    };

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: schema
            }
        });
        return response.text ? JSON.parse(response.text) : [];
    } catch (e) {
        console.error("Language Tips Error", e);
        return [];
    }
};

export const generatePlaylist = async (destination: string, vibe: string): Promise<Song[]> => {
    const prompt = `Create a playlist of 8 songs that capture the vibe "${vibe}" for a trip to ${destination}.
    Include a mix of local artists and songs that fit the atmosphere.
    For each song, provide the title, artist, and a short reason why it fits.
    Return strictly JSON.`;

    const schema: Schema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING },
                artist: { type: Type.STRING },
                reason: { type: Type.STRING }
            },
            required: ["title", "artist", "reason"]
        }
    };

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: schema
            }
        });
        return response.text ? JSON.parse(response.text) : [];
    } catch (e) {
        console.error("Playlist Error", e);
        return [];
    }
};
