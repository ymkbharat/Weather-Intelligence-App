import { useMemo } from 'react';
import { motion } from 'motion/react';
import WeatherIcon from './WeatherIcon';
import { getWeatherCondition } from '../utils';

interface ForecastCardProps {
  key?: string;
  dateStr: string;
  weatherCode: number;
  tempMax: number;
  tempMin: number;
  precipitation: number;
  isFahrenheit: boolean;
  index: number;
}

export default function ForecastCard({
  dateStr,
  weatherCode,
  tempMax,
  tempMin,
  precipitation,
  isFahrenheit,
  index
}: ForecastCardProps) {
  const dateObj = new Date(dateStr);
  
  const { dayOfWeek, dateFormatted } = useMemo(() => {
    if (isNaN(dateObj.getTime())) {
      return { dayOfWeek: 'Day', dateFormatted: dateStr };
    }
    return {
      dayOfWeek: dateObj.toLocaleDateString('en-US', { weekday: 'short' }),
      dateFormatted: dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    };
  }, [dateStr, dateObj]);

  const condition = useMemo(() => getWeatherCondition(weatherCode, true), [weatherCode]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ y: -4, scale: 1.02 }}
      className="flex flex-row md:flex-col items-center justify-between md:justify-center p-3 md:p-4 bg-white/50 dark:bg-slate-900/40 backdrop-blur-md rounded-2xl border border-white/20 shadow-sm hover:shadow-md transition-all duration-250 text-slate-800 dark:text-slate-100"
    >
      {/* Date Information */}
      <div className="text-left md:text-center min-w-[70px] md:min-w-0">
        <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{dayOfWeek}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{dateFormatted}</p>
      </div>

      {/* Weather Icon & Condition */}
      <div className="flex items-center md:flex-col gap-2 my-0 md:my-3 min-w-[120px] md:min-w-0 justify-start md:justify-center">
        <div className={`p-2 rounded-xl bg-gradient-to-br ${condition.gradient} text-white shadow-sm flex items-center justify-center`}>
          <WeatherIcon name={condition.iconName} className="w-6 h-6 animate-pulse" />
        </div>
        <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 md:max-w-[85px] md:truncate text-center">
          {condition.label}
        </p>
      </div>

      {/* Temperature high/low */}
      <div className="flex items-center gap-2 font-mono text-xs text-right md:text-center min-w-[80px] md:min-w-0 justify-end md:justify-center">
        <span className="font-bold text-slate-800 dark:text-slate-100">
          {Math.round(tempMax)}°
        </span>
        <span className="text-slate-400 dark:text-slate-500">/</span>
        <span className="text-slate-500 dark:text-slate-400">
          {Math.round(tempMin)}°
        </span>
      </div>

      {/* Precipitation probability / accumulation */}
      <div className="flex items-center gap-1 mt-0 md:mt-2 text-[10px] md:text-xs text-slate-400 dark:text-slate-500 font-medium justify-end md:justify-center min-w-[50px] md:min-w-0">
        <WeatherIcon name="Droplets" className={`w-3.5 h-3.5 ${precipitation > 0 ? 'text-sky-500 animate-bounce' : 'text-slate-300 dark:text-slate-700'}`} />
        <span className={precipitation > 0 ? 'text-sky-600 dark:text-sky-400 font-bold' : ''}>
          {precipitation.toFixed(1)} <span className="text-[9px]">mm</span>
        </span>
      </div>
    </motion.div>
  );
}
