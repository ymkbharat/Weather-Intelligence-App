import { ActivityRecommendation } from './types';

export interface WeatherCondition {
  label: string;
  iconName: 'Sun' | 'CloudSun' | 'Cloud' | 'CloudFog' | 'CloudDrizzle' | 'CloudRain' | 'CloudSnow' | 'CloudLightning' | 'CloudRainWind';
  gradient: string; // Tailwind gradient classes
  cardBg: string; // Card background style
  textColor: string;
  themeColor: string; // Accent color for charts/borders
}

// Maps Open-Meteo weather codes to descriptive labels, icons, and gradients
export function getWeatherCondition(code: number, isDay: boolean = true): WeatherCondition {
  // Codes from: https://open-meteo.com/en/docs
  switch (code) {
    case 0: // Clear sky
      return {
        label: 'Clear Sky',
        iconName: 'Sun',
        gradient: isDay 
          ? 'from-sky-400 via-amber-200 to-sky-500' 
          : 'from-slate-900 via-indigo-950 to-slate-800',
        cardBg: isDay ? 'bg-white/80 dark:bg-slate-900/80' : 'bg-slate-900/60',
        textColor: isDay ? 'text-slate-800' : 'text-slate-100',
        themeColor: '#eab308', // Amber-500
      };
    case 1: // Mainly clear
    case 2: // Partly cloudy
      return {
        label: 'Partly Cloudy',
        iconName: 'CloudSun',
        gradient: isDay 
          ? 'from-sky-400 via-blue-100 to-indigo-300' 
          : 'from-slate-900 via-slate-800 to-indigo-950',
        cardBg: isDay ? 'bg-white/80 dark:bg-slate-900/80' : 'bg-slate-900/60',
        textColor: isDay ? 'text-slate-800' : 'text-slate-100',
        themeColor: '#38bdf8', // Sky-400
      };
    case 3: // Overcast
      return {
        label: 'Overcast',
        iconName: 'Cloud',
        gradient: isDay 
          ? 'from-slate-300 via-slate-200 to-blue-300' 
          : 'from-slate-950 via-slate-900 to-slate-850',
        cardBg: isDay ? 'bg-white/70' : 'bg-slate-900/70',
        textColor: isDay ? 'text-slate-800' : 'text-slate-100',
        themeColor: '#64748b', // Slate-500
      };
    case 45: // Fog
    case 48: // Depositing rime fog
      return {
        label: 'Foggy',
        iconName: 'CloudFog',
        gradient: isDay 
          ? 'from-zinc-300 via-slate-100 to-zinc-400' 
          : 'from-slate-950 via-slate-900 to-slate-950',
        cardBg: isDay ? 'bg-white/70' : 'bg-slate-900/70',
        textColor: isDay ? 'text-slate-800' : 'text-slate-100',
        themeColor: '#94a3b8', // Slate-400
      };
    case 51: // Drizzle: Light
    case 53: // Drizzle: Moderate
    case 55: // Drizzle: Dense intensity
    case 56: // Freezing drizzle: Light
    case 57: // Freezing drizzle: Dense intensity
      return {
        label: 'Drizzle',
        iconName: 'CloudDrizzle',
        gradient: isDay 
          ? 'from-blue-300 via-sky-100 to-slate-400' 
          : 'from-slate-950 via-blue-950 to-slate-900',
        cardBg: isDay ? 'bg-white/70' : 'bg-slate-900/70',
        textColor: isDay ? 'text-slate-800' : 'text-slate-100',
        themeColor: '#0ea5e9', // Sky-500
      };
    case 61: // Rain: Slight
    case 63: // Rain: Moderate
    case 65: // Rain: Heavy intensity
    case 66: // Freezing rain: Light
    case 67: // Freezing rain: Heavy intensity
    case 80: // Rain showers: Slight
    case 81: // Rain showers: Moderate
    case 82: // Rain showers: Violent
      return {
        label: 'Rainy',
        iconName: 'CloudRain',
        gradient: isDay 
          ? 'from-blue-500 via-slate-400 to-sky-600' 
          : 'from-slate-950 via-blue-900 to-slate-950',
        cardBg: isDay ? 'bg-white/70' : 'bg-slate-900/70',
        textColor: isDay ? 'text-slate-800' : 'text-slate-100',
        themeColor: '#2563eb', // Blue-600
      };
    case 71: // Snow fall: Slight
    case 73: // Snow fall: Moderate
    case 75: // Snow fall: Heavy intensity
    case 77: // Snow grains
    case 85: // Snow showers: Slight
    case 86: // Snow showers: Heavy
      return {
        label: 'Snowy',
        iconName: 'CloudSnow',
        gradient: isDay 
          ? 'from-blue-100 via-zinc-100 to-sky-200' 
          : 'from-slate-900 via-slate-800 to-blue-950',
        cardBg: isDay ? 'bg-white/85' : 'bg-slate-900/85',
        textColor: isDay ? 'text-slate-800' : 'text-slate-100',
        themeColor: '#38bdf8', // Sky-400
      };
    case 95: // Thunderstorm: Slight or moderate
    case 96: // Thunderstorm with slight hail
    case 99: // Thunderstorm with heavy hail
      return {
        label: 'Thunderstorm',
        iconName: 'CloudLightning',
        gradient: isDay 
          ? 'from-slate-800 via-purple-900 to-indigo-950' 
          : 'from-slate-950 via-purple-950 to-neutral-950',
        cardBg: isDay ? 'bg-slate-900/80' : 'bg-slate-950/80',
        textColor: 'text-slate-100',
        themeColor: '#a855f7', // Purple-500
      };
    default:
      return {
        label: 'Variable',
        iconName: 'CloudSun',
        gradient: 'from-sky-300 via-slate-100 to-indigo-200',
        cardBg: 'bg-white/80',
        textColor: 'text-slate-800',
        themeColor: '#6366f1', // Indigo-500
      };
  }
}

// Generate practical planning insights based on 7-day forecast metrics
export function generateRecommendations(
  currentTemp: number,
  weatherCode: number,
  tempMax: number[],
  tempMin: number[],
  precipitationSum: number[]
): { generalAdvice: string; activities: ActivityRecommendation[] } {
  // Calculate average daily precipitation and average max temperature
  const avgMaxTemp = tempMax.reduce((a, b) => a + b, 0) / tempMax.length;
  const totalPrecipitation = precipitationSum.reduce((a, b) => a + b, 0);
  const rainDaysCount = precipitationSum.filter(p => p > 0.5).length;

  // 1. Core overall summary paragraph
  let generalAdvice = '';
  if (totalPrecipitation > 15) {
    generalAdvice = `Expect a wet week ahead with ${rainDaysCount} days of significant precipitation. Keep your umbrella close, plan for indoor leisure, and ensure you drive safely on damp roads. Perfect weather for reading, baking, or visiting an indoor museum.`;
  } else if (avgMaxTemp > 30) {
    generalAdvice = `A hot week is expected with high temperatures averaging ${avgMaxTemp.toFixed(1)}°C. Stay hydrated, apply high-SPF sunscreen, and restrict strenuous outdoor chores to the cooler morning or late evening hours.`;
  } else if (avgMaxTemp < 10) {
    generalAdvice = `Brace yourself for a cold spell with temperatures dropping. Dress in thick, warm layers, protect sensitive garden plants, and enjoy cozy indoor activities. Keep checking the local forecast for potential freeze warnings.`;
  } else if (weatherCode === 0 || weatherCode === 1) {
    generalAdvice = `Wonderful weather with high visibility and clear skies is expected! This is an ideal week for long outdoor drives, backyard gatherings, outdoor sporting events, and airing out your home.`;
  } else {
    generalAdvice = `Generally comfortable conditions with a nice blend of clouds and sun. Great for daily commutes, runs, and light outdoor tasks. A minor chance of transient drizzle, so a lightweight shell is recommended.`;
  }

  // 2. Specialized activity ratings
  const activities: ActivityRecommendation[] = [];

  // Activity 1: Outdoor Sports & Recreation (running, hiking, parks)
  let outdoorScore: 'Excellent' | 'Good' | 'Fair' | 'Poor' = 'Good';
  let outdoorDesc = '';
  if (totalPrecipitation > 10 || weatherCode >= 61) {
    outdoorScore = 'Poor';
    outdoorDesc = 'Rainy or wet conditions make trails slippery and outdoor recreation uncomfortable. Opt for an indoor gym.';
  } else if (avgMaxTemp > 33) {
    outdoorScore = 'Fair';
    outdoorDesc = 'High heat hazard. Limit workouts to air-conditioned spaces or early mornings.';
  } else if (avgMaxTemp < 8) {
    outdoorScore = 'Fair';
    outdoorDesc = 'Cold conditions require heavy layering. Great for brisk walks, but warm up thoroughly first.';
  } else if (weatherCode === 0 || weatherCode === 1) {
    outdoorScore = 'Excellent';
    outdoorDesc = 'Stunning clear skies and moderate temps. Perfect for hiking, cycling, tennis, or a park picnic!';
  } else {
    outdoorScore = 'Good';
    outdoorDesc = 'Pleasant weather for a run or outdoor physical recreation. Comfortable clouds provide nice shade.';
  }
  activities.push({
    name: 'Outdoor Recreation',
    score: outdoorScore,
    color: getScoreColor(outdoorScore),
    icon: 'Compass',
    description: outdoorDesc
  });

  // Activity 2: Household & Laundry (drying clothes outside, airing house)
  let laundryScore: 'Excellent' | 'Good' | 'Fair' | 'Poor' = 'Good';
  let laundryDesc = '';
  if (totalPrecipitation > 1 || weatherCode >= 51) {
    laundryScore = 'Poor';
    laundryDesc = 'High risk of rain. Keep your laundry indoors or use a tumble dryer to avoid re-washing.';
  } else if (avgMaxTemp < 12) {
    laundryScore = 'Fair';
    laundryDesc = 'Cold air slows down drying times significantly. Best to dry garments near indoor heat sources.';
  } else if (weatherCode === 0 && avgMaxTemp >= 20) {
    laundryScore = 'Excellent';
    laundryDesc = 'Hot, dry, sunny days ahead. Your clothes will line-dry rapidly with natural sanitization!';
  } else {
    laundryScore = 'Good';
    laundryDesc = 'Decent conditions. Sunlight and moderate temperatures will dry clothes comfortably.';
  }
  activities.push({
    name: 'Home & Laundry Drying',
    score: laundryScore,
    color: getScoreColor(laundryScore),
    icon: 'Wind',
    description: laundryDesc
  });

  // Activity 3: Gardening & Farming
  let gardenScore: 'Excellent' | 'Good' | 'Fair' | 'Poor' = 'Good';
  let gardenDesc = '';
  if (totalPrecipitation > 20) {
    gardenScore = 'Fair';
    gardenDesc = 'Abundant rainfall will saturate soil. Avoid waterlogging potted plants; suspend regular watering.';
  } else if (avgMaxTemp > 33) {
    gardenScore = 'Fair';
    gardenDesc = 'Severe heat stress on plants. Water deeply in the early mornings, and provide shade if possible.';
  } else if (tempMin.some(t => t < 2)) {
    gardenScore = 'Poor';
    gardenDesc = 'Frost hazard detected! Cover delicate plants overnight to prevent cell freezing and leaf damage.';
  } else if (totalPrecipitation < 2 && avgMaxTemp > 22) {
    gardenScore = 'Good';
    gardenDesc = 'Dry, warm spell. Regular deep watering is vital. Great time for weeding and general maintenance.';
  } else {
    gardenScore = 'Excellent';
    gardenDesc = 'Balanced temperature and gentle hydration. Perfect conditions for planting, pruning, and seed germination.';
  }
  activities.push({
    name: 'Gardening & Plants',
    score: gardenScore,
    color: getScoreColor(gardenScore),
    icon: 'Sprout',
    description: gardenDesc
  });

  // Activity 4: Travel & Driving Conditions
  let travelScore: 'Excellent' | 'Good' | 'Fair' | 'Poor' = 'Excellent';
  let travelDesc = '';
  if (weatherCode === 95 || weatherCode === 96 || weatherCode === 99) {
    travelScore = 'Poor';
    travelDesc = 'Thunderstorms with hail risks. Limit highway driving; watch for rapid hydroplaning and low visibility.';
  } else if (weatherCode >= 45 && weatherCode <= 48) {
    travelScore = 'Fair';
    travelDesc = 'Dense fog will obstruct highway visibility. Use low beams and double your braking distance.';
  } else if (totalPrecipitation > 15) {
    travelScore = 'Fair';
    travelDesc = 'Wet roadways. Increase trailing distances and expect standard transit delays due to puddles.';
  } else {
    travelScore = 'Excellent';
    travelDesc = 'Dry asphalt, crystal clear skies, and calm winds. Outstanding conditions for road trips and flying.';
  }
  activities.push({
    name: 'Travel & Commuting',
    score: travelScore,
    color: getScoreColor(travelScore),
    icon: 'Car',
    description: travelDesc
  });

  return { generalAdvice, activities };
}

function getScoreColor(score: 'Excellent' | 'Good' | 'Fair' | 'Poor'): string {
  switch (score) {
    case 'Excellent': return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
    case 'Good': return 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20';
    case 'Fair': return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
    case 'Poor': return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
  }
}

// Famous reference locations for user friendly quick-clicks
export const POPULAR_CITIES = [
  { name: 'New York', country: 'United States', lat: 40.7128, lon: -74.006 },
  { name: 'London', country: 'United Kingdom', lat: 51.5074, lon: -0.1278 },
  { name: 'Tokyo', country: 'Japan', lat: 35.6762, lon: 139.6503 },
  { name: 'Paris', country: 'France', lat: 48.8566, lon: 2.3522 },
  { name: 'Sydney', country: 'Australia', lat: -33.8688, lon: 151.2093 },
  { name: 'Mumbai', country: 'India', lat: 19.076, lon: 72.8777 },
];
