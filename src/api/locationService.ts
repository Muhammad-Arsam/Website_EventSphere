const CSC_BASE_URL = 'https://api.countrystatecity.in/v1';
const API_KEY = process.env.NEXT_PUBLIC_CSC_API_KEY || '';

const getHeaders = () => {
  const headers = new Headers();
  headers.append("X-CSCAPI-KEY", API_KEY);
  return { headers };
};

export const locationService = {
  // --- Country, State, City APIs ---
  getCountries: async () => {
    const res = await fetch(`${CSC_BASE_URL}/countries`, getHeaders());
    if (!res.ok) throw new Error('Failed to fetch countries');
    return res.json();
  },

  getStates: async (countryIso: string) => {
    if (!countryIso) return [];
    const res = await fetch(`${CSC_BASE_URL}/countries/${countryIso}/states`, getHeaders());
    if (!res.ok) throw new Error('Failed to fetch states');
    return res.json();
  },

  getCities: async (countryIso: string, stateIso: string) => {
    if (!countryIso || !stateIso) return [];
    const res = await fetch(`${CSC_BASE_URL}/countries/${countryIso}/states/${stateIso}/cities`, getHeaders());
    if (!res.ok) throw new Error('Failed to fetch cities');
    return res.json();
  },

  // --- OpenStreetMap Geocoding API ---
  searchAddress: async (query: string) => {
    if (!query) return [];
    // Nominatim requires a User-Agent or specific format
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1&limit=5`;
    const res = await fetch(url, {
        headers: {
            'Accept-Language': 'en'
        }
    });
    if (!res.ok) throw new Error('Failed to search address');
    return res.json();
  }
};