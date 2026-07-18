import { motion } from 'motion/react';
import { generateRecommendations } from '../utils';
import WeatherIcon from './WeatherIcon';

interface IntelligencePanelProps {
  currentTemp: number;
  weatherCode: number;
  tempMax: number[];
  tempMin: number[];
  precipitationSum: number[];
}

export default function IntelligencePanel({
  currentTemp,
  weatherCode,
  tempMax,
  tempMin,
  precipitationSum
}: IntelligencePanelProps) {
  
  const { generalAdvice, activities } = generateRecommendations(
    currentTemp,
    weatherCode,
    tempMax,
    tempMin,
    precipitationSum
  );

  return (
    <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-md rounded-2xl p-5 md:p-6 border border-white/20 shadow-sm">
      {/* Title & Badge */}
      <div className="flex items-center gap-2 mb-4">
        <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-500">
          <WeatherIcon name="Sparkles" className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
            Weather Planner Insights
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Automated recommendations based on 7-day weather metrics
          </p>
        </div>
      </div>

      {/* Main recommendation paragraph block */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-500/5 to-sky-500/5 dark:from-indigo-500/10 dark:to-sky-500/10 border border-indigo-500/10 dark:border-indigo-500/20 mb-6 text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
        <span className="font-bold text-indigo-600 dark:text-indigo-400 mr-1.5">Overview:</span>
        {generalAdvice}
      </div>

      {/* Activity grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {activities.map((act, index) => (
          <motion.div
            key={act.name}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="flex flex-col justify-between p-4 bg-white/70 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-800/80 shadow-sm"
          >
            <div>
              {/* Card Header: Icon, Name, and Status Badge */}
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    <WeatherIcon name={act.icon} className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
                    {act.name}
                  </span>
                </div>
                
                {/* Score badge */}
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${act.color}`}>
                  {act.score}
                </span>
              </div>

              {/* Description text */}
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {act.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
