import { useMemo } from 'react';

interface WeatherChartProps {
  dates: string[];
  tempMax: number[];
  tempMin: number[];
  isFahrenheit: boolean;
}

export default function WeatherChart({ dates, tempMax, tempMin, isFahrenheit }: WeatherChartProps) {
  const points = dates.length;

  const formattedDays = useMemo(() => {
    return dates.map(dStr => {
      const d = new Date(dStr);
      // Fallback if parsing fails
      if (isNaN(d.getTime())) return dStr.substring(5); 
      return d.toLocaleDateString('en-US', { weekday: 'short' });
    });
  }, [dates]);

  // Find min and max for scaling
  const { globalMax, globalMin } = useMemo(() => {
    const allMax = [...tempMax];
    const allMin = [...tempMin];
    return {
      globalMax: Math.max(...allMax),
      globalMin: Math.min(...allMin),
    };
  }, [tempMax, tempMin]);

  // Padding & Dimensions for SVG viewBox
  const svgWidth = 600;
  const svgHeight = 180;
  const paddingX = 40;
  const paddingTop = 35;
  const paddingBottom = 25;

  const chartData = useMemo(() => {
    const tempRange = globalMax - globalMin || 1; // avoid divide by zero
    const drawableWidth = svgWidth - 2 * paddingX;
    const drawableHeight = svgHeight - paddingTop - paddingBottom;

    return dates.map((_, idx) => {
      const x = paddingX + (idx * drawableWidth) / (points - 1);
      
      // Calculate Y coords (higher temperature means lower Y coordinate in SVG)
      const maxVal = tempMax[idx];
      const minVal = tempMin[idx];
      
      const yMax = paddingTop + drawableHeight * (1 - (maxVal - globalMin) / tempRange);
      const yMin = paddingTop + drawableHeight * (1 - (minVal - globalMin) / tempRange);

      return {
        x,
        yMax,
        yMin,
        maxLabel: `${Math.round(maxVal)}°`,
        minLabel: `${Math.round(minVal)}°`,
        dayName: formattedDays[idx],
      };
    });
  }, [dates, tempMax, tempMin, globalMax, globalMin, formattedDays, points]);

  // Generate SVG path for max temp line
  const maxPath = useMemo(() => {
    if (chartData.length === 0) return '';
    return chartData.reduce((path, p, i) => {
      return i === 0 ? `M ${p.x} ${p.yMax}` : `${path} L ${p.x} ${p.yMax}`;
    }, '');
  }, [chartData]);

  // Generate SVG path for min temp line
  const minPath = useMemo(() => {
    if (chartData.length === 0) return '';
    return chartData.reduce((path, p, i) => {
      return i === 0 ? `M ${p.x} ${p.yMin}` : `${path} L ${p.x} ${p.yMin}`;
    }, '');
  }, [chartData]);

  // Generate dynamic area path that fills the region between high and low curves
  const fillAreaPath = useMemo(() => {
    if (chartData.length === 0) return '';
    const maxLine = chartData.map(p => `${p.x},${p.yMax}`).join(' ');
    const minLineInverse = [...chartData].reverse().map(p => `${p.x},${p.yMin}`).join(' ');
    return `M ${chartData[0].x} ${chartData[0].yMax} L ${maxLine} L ${minLineInverse} Z`;
  }, [chartData]);

  return (
    <div className="w-full bg-white/40 dark:bg-slate-900/40 backdrop-blur-md rounded-2xl p-5 border border-white/20 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-400"></span>
          Temperature Range Trend (7 Days)
        </h3>
        <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
          Unit: {isFahrenheit ? '°F' : '°C'}
        </span>
      </div>

      <div className="w-full overflow-x-auto select-none scrollbar-thin">
        <div className="min-w-[450px] w-full">
          <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto overflow-visible">
            <defs>
              {/* Soft gradient fill between temperatures */}
              <linearGradient id="tempGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.05" />
              </linearGradient>
              
              {/* Sparkle filters for glow */}
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* X-Axis Gridlines */}
            {chartData.map((p, idx) => (
              <line
                key={`grid-${idx}`}
                x1={p.x}
                y1={paddingTop - 10}
                x2={p.x}
                y2={svgHeight - paddingBottom}
                stroke="currentColor"
                className="text-slate-200 dark:text-slate-800"
                strokeWidth={1}
                strokeDasharray="4,4"
              />
            ))}

            {/* Temperature range background shade */}
            <path d={fillAreaPath} fill="url(#tempGradient)" />

            {/* High Temperature Line */}
            <path
              d={maxPath}
              fill="none"
              stroke="#f59e0b"
              strokeWidth={3}
              strokeLinecap="round"
              className="drop-shadow-[0_1px_3px_rgba(245,158,11,0.3)]"
            />

            {/* Low Temperature Line */}
            <path
              d={minPath}
              fill="none"
              stroke="#3b82f6"
              strokeWidth={3}
              strokeLinecap="round"
              className="drop-shadow-[0_1px_3px_rgba(59,130,246,0.3)]"
            />

            {/* Interactive/static marker nodes and numeric values */}
            {chartData.map((p, idx) => (
              <g key={`nodes-${idx}`} className="group/node">
                {/* Max Temperature node & Label */}
                <circle
                  cx={p.x}
                  cy={p.yMax}
                  r={5}
                  fill="#ffffff"
                  stroke="#f59e0b"
                  strokeWidth={2.5}
                  className="transition-transform duration-200 group-hover/node:scale-125 cursor-pointer"
                />
                <text
                  x={p.x}
                  y={p.yMax - 10}
                  textAnchor="middle"
                  className="text-[11px] font-bold fill-slate-700 dark:fill-slate-300 font-mono"
                >
                  {p.maxLabel}
                </text>

                {/* Min Temperature node & Label */}
                <circle
                  cx={p.x}
                  cy={p.yMin}
                  r={5}
                  fill="#ffffff"
                  stroke="#3b82f6"
                  strokeWidth={2.5}
                  className="transition-transform duration-200 group-hover/node:scale-125 cursor-pointer"
                />
                <text
                  x={p.x}
                  y={p.yMin + 18}
                  textAnchor="middle"
                  className="text-[11px] font-bold fill-slate-500 dark:fill-slate-400 font-mono"
                >
                  {p.minLabel}
                </text>

                {/* Day Labels at the bottom */}
                <text
                  x={p.x}
                  y={svgHeight - 6}
                  textAnchor="middle"
                  className="text-[11px] font-semibold fill-slate-400 dark:fill-slate-500 uppercase tracking-wider"
                >
                  {p.dayName}
                </text>
              </g>
            ))}
          </svg>
        </div>
      </div>
    </div>
  );
}
