import dayjs from 'dayjs';

export const formatTime = (value, format = 'YYYY-MM-DD HH:mm:ss') => {
  if (!value) return '';
  return dayjs(value).format(format);
};

export const formatDate = (value) => formatTime(value, 'YYYY-MM-DD');

export const formatSpeed = (value, unit) => {
  if (value == null) return '';
  switch (unit) {
    case 'kmh':
      return `${(value * 1.852).toFixed(1)} km/h`;
    case 'mph':
      return `${(value * 1.15078).toFixed(1)} mph`;
    case 'kn':
    default:
      return `${value.toFixed(1)} kn`;
  }
};

export const formatDistance = (value, unit) => {
  if (value == null) return '';
  switch (unit) {
    case 'km':
      return `${(value / 1000).toFixed(2)} km`;
    case 'mi':
      return `${(value / 1609.34).toFixed(2)} mi`;
    case 'nmi':
    default:
      return `${(value / 1852).toFixed(2)} nmi`;
  }
};

export const formatVolume = (value, unit) => {
  if (value == null) return '';
  switch (unit) {
    case 'usGal':
      return `${(value * 0.264172).toFixed(1)} gal`;
    case 'impGal':
      return `${(value * 0.219969).toFixed(1)} gal`;
    case 'l':
    default:
      return `${value.toFixed(1)} L`;
  }
};

export const formatHours = (value) => {
  if (value == null) return '';
  const hours = Math.floor(value / 3600000);
  const minutes = Math.floor((value % 3600000) / 60000);
  return `${hours}h ${minutes}m`;
};

export const formatDuration = (ms) => {
  if (!ms) return '-';
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days}d ${hours % 24}h ${minutes % 60}m`;
  if (hours > 0) return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
};

export const formatCoordinate = (value, isLatitude) => {
  if (value == null) return '';
  const direction = isLatitude 
    ? (value >= 0 ? 'N' : 'S')
    : (value >= 0 ? 'E' : 'W');
  return `${Math.abs(value).toFixed(6)}° ${direction}`;
};

export const formatAltitude = (value) => {
  if (value == null) return '';
  return `${value} m`;
};
