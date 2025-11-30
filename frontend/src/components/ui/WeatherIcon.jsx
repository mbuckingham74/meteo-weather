/**
 * WeatherIcon - Maps weather condition codes to Lucide icons
 */
import {
  Sun,
  Cloud,
  CloudRain,
  CloudSnow,
  CloudLightning,
  CloudFog,
  Wind,
  CloudDrizzle,
  CloudSun,
  Moon,
  CloudMoon,
} from 'lucide-react';

// Map common weather condition keywords to icons
const iconMap = {
  clear: Sun,
  sunny: Sun,
  'clear-day': Sun,
  'clear-night': Moon,
  'partly-cloudy-day': CloudSun,
  'partly-cloudy-night': CloudMoon,
  cloudy: Cloud,
  overcast: Cloud,
  rain: CloudRain,
  'light rain': CloudDrizzle,
  drizzle: CloudDrizzle,
  showers: CloudRain,
  snow: CloudSnow,
  'light snow': CloudSnow,
  flurries: CloudSnow,
  sleet: CloudSnow,
  thunderstorm: CloudLightning,
  thunder: CloudLightning,
  fog: CloudFog,
  mist: CloudFog,
  haze: CloudFog,
  wind: Wind,
  windy: Wind,
};

function getIconComponent(condition) {
  if (!condition) return Sun;

  const lowerCondition = condition.toLowerCase();

  // Check for exact match first
  if (iconMap[lowerCondition]) {
    return iconMap[lowerCondition];
  }

  // Check for partial matches
  for (const [key, Icon] of Object.entries(iconMap)) {
    if (lowerCondition.includes(key)) {
      return Icon;
    }
  }

  // Default to sun
  return Sun;
}

function WeatherIcon({ condition, size = 48, className = '', ...props }) {
  const IconComponent = getIconComponent(condition);

  return (
    <IconComponent
      size={size}
      className={`text-accent ${className}`}
      strokeWidth={1.5}
      {...props}
    />
  );
}

export default WeatherIcon;
