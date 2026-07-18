/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GeocodingResult, WeatherForecastResponse } from './types';
import { getWeatherCondition, POPULAR_CITIES } from './utils';
import WeatherIcon from './components/WeatherIcon';
import WeatherChart from './components/WeatherChart';
import ForecastCard from './components/ForecastCard';
import IntelligencePanel from './components/IntelligencePanel';

export default function App() {
  // Application states
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<GeocodingResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const [selectedCity, setSelectedCity] = useState({
    name: 'New York',
    country: 'United States',
    lat: 40.7128,
    lon: -74.006,
  });

  const [weatherData, setWeatherData] = useState<WeatherForecastResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFahrenheit, setIsFahrenheit] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);

  const suggestionRef = useRef<HTMLDivElement>(null);

  // Close suggestions dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced geocoding search suggestions as typing
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      try {
        const response = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
            searchQuery
          )}&count=5&language=en&format=json`
        );
        if (!response.ok) throw new Error('Geocoding search failed');
        const data = await response.json();
        setSuggestions(data.results || []);
      } catch (err) {
        console.error('Error fetching suggestions:', err);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // Main weather forecast fetcher
  const fetchWeather = useCallback(async (lat: number, lon: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto`
      );
      if (!response.ok) {
        throw new Error('Failed to retrieve forecast data from Open-Meteo. Please try again.');
      }
      const data: WeatherForecastResponse = await response.json();
      setWeatherData(data);
    } catch (err: any) {
      setError(err.message || 'An unexpected API network error occurred.');
      setWeatherData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load of New York on mount
  useEffect(() => {
    fetchWeather(selectedCity.lat, selectedCity.lon);
  }, [fetchWeather]);

  // Handle manual city submit (Form search or Enter press)
  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedQuery = searchQuery.trim();
    if (!trimmedQuery) return;

    // Close suggestions dropdown immediately
    setShowSuggestions(false);

    // Perform direct, blocking lookup for the entered text
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
          trimmedQuery
        )}&count=1&language=en&format=json`
      );
      
      if (!response.ok) {
        throw new Error('Geocoding service unavailable. Please try again.');
      }
      
      const data = await response.json();

      if (!data.results || data.results.length === 0) {
        throw new Error(`Could not find coordinates for "${trimmedQuery}". Check the spelling and try again.`);
      }

      const topResult = data.results[0];
      setSelectedCity({
        name: topResult.name,
        country: topResult.country || '',
        lat: topResult.latitude,
        lon: topResult.longitude,
      });
      setSearchQuery('');
      fetchWeather(topResult.latitude, topResult.longitude);
    } catch (err: any) {
      setError(err.message || 'City not found or Geocoding API Error.');
    } finally {
      setLoading(false);
    }
  };

  // Quick select a famous pre-defined city
  const handleQuickCitySelect = (city: typeof POPULAR_CITIES[number]) => {
    setSelectedCity({
      name: city.name,
      country: city.country,
      lat: city.lat,
      lon: city.lon,
    });
    setSearchQuery('');
    setShowSuggestions(false);
    fetchWeather(city.lat, city.lon);
  };

  // Fetch coordinates using browser geolocation API
  const handleMyLocationClick = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }

    setGeoLoading(true);
    setError(null);
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setSelectedCity({
          name: 'Your Location',
          country: `Coord: ${latitude.toFixed(2)}, ${longitude.toFixed(2)}`,
          lat: latitude,
          lon: longitude,
        });
        setSearchQuery('');
        fetchWeather(latitude, longitude);
        setGeoLoading(false);
      },
      (err) => {
        setGeoLoading(false);
        setError('Location permission denied or retrieval failed. Please search manually.');
        console.error('Geolocation error:', err);
      },
      { enableHighAccuracy: true, timeout: 7000 }
    );
  };

  // Convert temperatures dynamically to °F on the fly
  const convertTemp = useCallback(
    (celsius: number) => {
      if (!isFahrenheit) return celsius;
      return (celsius * 9) / 5 + 32;
    },
    [isFahrenheit]
  );

  // Compute dynamic visual condition themes based on the loaded weather code
  const currentCondition = useMemo(() => {
    if (!weatherData?.current_weather) {
      return getWeatherCondition(0, true); // default clear sky
    }
    const isDay = weatherData.current_weather.is_day !== 0;
    return getWeatherCondition(weatherData.current_weather.weathercode, isDay);
  }, [weatherData]);

  // Convert raw API forecast data lists into converted arrays
  const convertedMaxTempList = useMemo(() => {
    if (!weatherData?.daily?.temperature_2m_max) return [];
    return weatherData.daily.temperature_2m_max.map(convertTemp);
  }, [weatherData, convertTemp]);

  const convertedMinTempList = useMemo(() => {
    if (!weatherData?.daily?.temperature_2m_min) return [];
    return weatherData.daily.temperature_2m_min.map(convertTemp);
  }, [weatherData, convertTemp]);

  return (
    <div className={`min-h-screen bg-gradient-to-br ${currentCondition.gradient} transition-all duration-1000 ease-in-out py-8 px-4 sm:px-6 lg:px-8 font-sans overflow-y-auto`}>
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* App Header */}
        <header className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/30 dark:bg-slate-900/30 backdrop-blur-md rounded-2xl p-5 border border-white/20 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-slate-900 text-white flex items-center justify-center">
              <WeatherIcon name="CloudRainWind" className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Weather Intelligence
              </h1>
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Data powered by Open-Meteo
              </p>
            </div>
          </div>

          {/* Metric Toggle */}
          <div className="flex items-center gap-2 bg-white/40 dark:bg-slate-800/40 p-1 rounded-xl border border-white/30">
            <button
              onClick={() => setIsFahrenheit(false)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all duration-200 ${
                !isFahrenheit
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-white/25'
              }`}
            >
              Celsius (°C)
            </button>
            <button
              onClick={() => setIsFahrenheit(true)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all duration-200 ${
                isFahrenheit
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-white/25'
              }`}
            >
              Fahrenheit (°F)
            </button>
          </div>
        </header>

        {/* Search and Quick Filters bar */}
        <section className="space-y-4">
          <div className="flex flex-col md:flex-row items-stretch gap-3">
            
            {/* Search Input Box with suggestions */}
            <div ref={suggestionRef} className="relative flex-1">
              <form onSubmit={handleSearchSubmit} className="relative flex items-center">
                <WeatherIcon name="Search" className="absolute left-4 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search city (e.g. Tokyo, Paris, Boston)..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  className="w-full pl-12 pr-4 py-3.5 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md rounded-2xl border border-white/30 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/20 shadow-sm text-sm"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setSuggestions([]);
                    }}
                    className="absolute right-4 text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    Clear
                  </button>
                )}
              </form>

              {/* Suggestions dropdown */}
              <AnimatePresence>
                {showSuggestions && suggestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute z-50 left-0 right-0 mt-2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800"
                  >
                    {suggestions.map((city) => (
                      <button
                        key={city.id}
                        onClick={() => {
                          setSelectedCity({
                            name: city.name,
                            country: city.country || '',
                            lat: city.latitude,
                            lon: city.longitude,
                          });
                          setSearchQuery('');
                          setShowSuggestions(false);
                          fetchWeather(city.latitude, city.longitude);
                        }}
                        className="w-full text-left px-5 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between transition-colors duration-150"
                      >
                        <div>
                          <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{city.name}</p>
                          <p className="text-xs text-slate-500">
                            {city.admin1 ? `${city.admin1}, ` : ''}
                            {city.country}
                          </p>
                        </div>
                        <span className="text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded-full">
                          {city.latitude.toFixed(2)}°N, {city.longitude.toFixed(2)}°E
                        </span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* My Location button */}
            <button
              onClick={handleMyLocationClick}
              disabled={geoLoading || loading}
              className="px-5 py-3.5 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md rounded-2xl border border-white/20 text-slate-800 dark:text-slate-100 font-bold text-sm hover:bg-white/70 dark:hover:bg-slate-900/70 transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
            >
              <WeatherIcon name="MapPin" className={`w-4 h-4 ${geoLoading ? 'animate-spin text-indigo-500' : ''}`} />
              {geoLoading ? 'Locating...' : 'My Location'}
            </button>
          </div>

          {/* Quick Pill filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-thin scrollbar-thumb-slate-300">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider whitespace-nowrap mr-1">
              Popular:
            </span>
            {POPULAR_CITIES.map((city) => (
              <button
                key={city.name}
                onClick={() => handleQuickCitySelect(city)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all duration-200 whitespace-nowrap ${
                  selectedCity.name === city.name
                    ? 'bg-slate-900 border-slate-900 text-white'
                    : 'bg-white/30 hover:bg-white/50 dark:bg-slate-900/20 dark:hover:bg-slate-900/40 border-white/20 text-slate-800 dark:text-slate-200'
                }`}
              >
                {city.name}
              </button>
            ))}
          </div>
        </section>

        {/* Error Banners */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 rounded-2xl bg-rose-500/10 dark:bg-rose-500/20 border border-rose-500/20 text-rose-700 dark:text-rose-300 flex items-start gap-3 shadow-sm text-sm"
            >
              <WeatherIcon name="Info" className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Weather Intel Search Issue</p>
                <p className="text-xs mt-0.5 opacity-90">{error}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading skeleton or dashboard panels */}
        <main className="min-h-[400px] flex items-center justify-center relative">
          {loading ? (
            <div className="flex flex-col items-center gap-4 py-20">
              <div className="relative w-12 h-12">
                <div className="absolute inset-0 rounded-full border-4 border-slate-900/10 dark:border-white/10"></div>
                <div className="absolute inset-0 rounded-full border-4 border-slate-900 dark:border-white border-t-transparent dark:border-t-transparent animate-spin"></div>
              </div>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200 animate-pulse">
                Fetching weather telemetry for {selectedCity.name}...
              </p>
            </div>
          ) : weatherData ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="w-full space-y-6"
            >
              {/* Primary grid: Current weather details & Dynamic Planner */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                
                {/* Current Weather Card */}
                <div className="lg:col-span-5 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-sm flex flex-col justify-between text-slate-800 dark:text-slate-100">
                  
                  {/* Card Header: City, country, and status */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <span className="inline-flex items-center gap-1 text-[10px] uppercase font-extrabold tracking-wider bg-slate-900 text-white px-2.5 py-1 rounded-full shadow-sm">
                          Current Weather
                        </span>
                        <h2 className="text-3xl font-extrabold mt-2 tracking-tight">
                          {selectedCity.name}
                        </h2>
                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-0.5">
                          {selectedCity.country}
                        </p>
                      </div>

                      {/* Current Condition Visual Element */}
                      <div className={`p-3.5 rounded-2xl bg-gradient-to-br ${currentCondition.gradient} text-white shadow-md flex items-center justify-center`}>
                        <WeatherIcon name={currentCondition.iconName} className="w-10 h-10 animate-bounce" />
                      </div>
                    </div>

                    {/* Numeric Temp & Friendly Label */}
                    <div className="my-6">
                      <div className="flex items-baseline gap-2">
                        <span className="text-6xl font-extrabold tracking-tighter">
                          {Math.round(convertTemp(weatherData.current_weather?.temperature || 0))}
                        </span>
                        <span className="text-3xl font-bold text-slate-600 dark:text-slate-400">
                          {isFahrenheit ? '°F' : '°C'}
                        </span>
                      </div>
                      <p className="text-base font-bold text-slate-700 dark:text-slate-200 mt-2 flex items-center gap-1.5">
                        {currentCondition.label}
                      </p>
                    </div>
                  </div>

                  {/* Core Telemetry Specs Grid */}
                  <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-200/50 dark:border-slate-800/50">
                    <div className="bg-white/40 dark:bg-slate-900/30 p-3 rounded-xl border border-white/10">
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                        <WeatherIcon name="Thermometer" className="w-4 h-4 text-amber-500" />
                        Today's Range
                      </div>
                      <p className="text-sm font-bold font-mono mt-1 text-slate-800 dark:text-slate-100">
                        {Math.round(convertedMaxTempList[0] || 0)}° / {Math.round(convertedMinTempList[0] || 0)}°
                      </p>
                    </div>

                    <div className="bg-white/40 dark:bg-slate-900/30 p-3 rounded-xl border border-white/10">
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                        <WeatherIcon name="Droplets" className="w-4 h-4 text-sky-500" />
                        Precipitation
                      </div>
                      <p className="text-sm font-bold font-mono mt-1 text-slate-800 dark:text-slate-100">
                        {(weatherData.daily?.precipitation_sum?.[0] || 0).toFixed(1)} mm
                      </p>
                    </div>

                    <div className="bg-white/40 dark:bg-slate-900/30 p-3 rounded-xl border border-white/10">
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                        <WeatherIcon name="Wind" className="w-4 h-4 text-slate-500" />
                        Wind Velocity
                      </div>
                      <p className="text-sm font-bold font-mono mt-1 text-slate-800 dark:text-slate-100">
                        {(weatherData.current_weather?.windspeed || 0).toFixed(1)} km/h
                      </p>
                    </div>

                    <div className="bg-white/40 dark:bg-slate-900/30 p-3 rounded-xl border border-white/10">
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                        <WeatherIcon name="Compass" className="w-4 h-4 text-emerald-500" />
                        Coordinates
                      </div>
                      <p className="text-[10px] font-bold font-mono mt-1 text-slate-700 dark:text-slate-300">
                        {weatherData.latitude.toFixed(2)}°, {weatherData.longitude.toFixed(2)}°
                      </p>
                    </div>
                  </div>

                </div>

                {/* Intelligent Activity Planner */}
                <div className="lg:col-span-7">
                  <IntelligencePanel
                    currentTemp={weatherData.current_weather?.temperature || 0}
                    weatherCode={weatherData.current_weather?.weathercode || 0}
                    tempMax={weatherData.daily?.temperature_2m_max || []}
                    tempMin={weatherData.daily?.temperature_2m_min || []}
                    precipitationSum={weatherData.daily?.precipitation_sum || []}
                  />
                </div>

              </div>

              {/* Weather Chart Component */}
              <WeatherChart
                dates={weatherData.daily?.time || []}
                tempMax={convertedMaxTempList}
                tempMin={convertedMinTempList}
                isFahrenheit={isFahrenheit}
              />

              {/* 7-Day Forecast Grid section */}
              <section className="space-y-3">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest flex items-center gap-2 pl-1">
                  <WeatherIcon name="Calendar" className="w-4 h-4 text-indigo-500" />
                  7-Day Forecast Details
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
                  {weatherData.daily?.time.map((dateStr, index) => (
                    <ForecastCard
                      key={dateStr}
                      dateStr={dateStr}
                      weatherCode={weatherData.daily?.weathercode?.[index] || 0}
                      tempMax={convertedMaxTempList[index]}
                      tempMin={convertedMinTempList[index]}
                      precipitation={weatherData.daily?.precipitation_sum?.[index] || 0}
                      isFahrenheit={isFahrenheit}
                      index={index}
                    />
                  ))}
                </div>
              </section>

            </motion.div>
          ) : (
            <div className="text-center py-16 bg-white/30 dark:bg-slate-900/20 backdrop-blur-sm rounded-2xl p-8 border border-white/10 w-full max-w-lg">
              <WeatherIcon name="CloudSun" className="w-16 h-16 text-slate-400 mx-auto mb-4 animate-bounce" />
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">No Location Loaded</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Type a city name in the input box above or tap one of the popular cities list to explore current conditions.
              </p>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="text-center py-4 text-[10px] font-bold text-slate-700/80 dark:text-slate-300/80 uppercase tracking-widest select-none">
          Weather Intelligence • Local Time {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </footer>

      </div>
    </div>
  );
}
