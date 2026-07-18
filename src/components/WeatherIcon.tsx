import { 
  Sun, 
  CloudSun, 
  Cloud, 
  CloudFog, 
  CloudDrizzle, 
  CloudRain, 
  CloudSnow, 
  CloudLightning, 
  CloudRainWind,
  Compass,
  Wind,
  Sprout,
  Car,
  Search,
  MapPin,
  Thermometer,
  Droplets,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  Info,
  Calendar,
  Sparkles,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

const iconsMap = {
  // Weather Conditions
  Sun,
  CloudSun,
  Cloud,
  CloudFog,
  CloudDrizzle,
  CloudRain,
  CloudSnow,
  CloudLightning,
  CloudRainWind,
  
  // Activities
  Compass,
  Wind,
  Sprout,
  Car,
  
  // Utilities
  Search,
  MapPin,
  Thermometer,
  Droplets,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  Info,
  Calendar,
  Sparkles,
  ExternalLink,
  ChevronRight
};

export type IconName = keyof typeof iconsMap;

interface WeatherIconProps {
  name: IconName | string;
  className?: string;
  size?: number;
}

export default function WeatherIcon({ name, className = '', size }: WeatherIconProps) {
  // Fallback if icon is not in list
  const IconComponent = iconsMap[name as IconName] || CloudSun;
  return <IconComponent className={className} size={size} />;
}
