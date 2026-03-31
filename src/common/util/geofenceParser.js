import turfCircle from '@turf/circle';

/**
 * Parse WKT POLYGON string
 * Format: POLYGON((lon lat, lon lat, ...))
 * Note: WKT uses (lon lat) order, not (lat lon)
 */
const parsePolygon = (wkt) => {
  console.log('[geofenceParser] Parsing POLYGON:', wkt.slice(0, 80));
  
  // Extract coordinates between the double parentheses
  const match = wkt.match(/POLYGON\s*\(\(([^)]+)\)\)/i);
  if (!match) {
    console.log('[geofenceParser] POLYGON regex did not match');
    return null;
  }

  const coordsStr = match[1];
  console.log('[geofenceParser] Coords string:', coordsStr);
  
  const pairs = coordsStr.split(',').map(p => p.trim()).filter(Boolean);
  console.log('[geofenceParser] Coordinate pairs:', pairs);
  
  const coordinates = pairs.map(pair => {
    const parts = pair.split(/\s+/);
    if (parts.length < 2) {
      console.log('[geofenceParser] Invalid pair (less than 2 parts):', pair);
      return null;
    }
    // Traccar WKT POLYGON uses (lat lon) order, NOT standard (lon lat)
    // GeoJSON requires [lon, lat], so we swap
    const lat = parseFloat(parts[0]);
    const lon = parseFloat(parts[1]);
    const coord = [lon, lat];
    console.log('[geofenceParser] Parsed coord:', coord, 'from pair:', pair);
    return coord;
  }).filter(Boolean);

  console.log('[geofenceParser] Total valid coordinates:', coordinates.length);
  
  if (coordinates.length < 3) {
    console.log('[geofenceParser] Not enough coordinates (< 3), returning null');
    return null;
  }

  // Ensure polygon is closed
  const first = coordinates[0];
  const last = coordinates[coordinates.length - 1];
  if (first[0] !== last[0] || first[1] !== last[1]) {
    coordinates.push([...first]);
  }

  console.log('[geofenceParser] Successfully parsed polygon with', coordinates.length, 'points');
  return {
    type: 'Polygon',
    coordinates: [coordinates],
  };
};

/**
 * Parse CIRCLE string
 * Format: CIRCLE(lat lon radius)
 * Note: CIRCLE uses (lat lon) order, radius in meters
 */
const parseCircle = (circleStr) => {
  const match = circleStr.match(/CIRCLE\s*\(\s*([\d.-]+)\s+([\d.-]+)\s+([\d.]+)\s*\)/i);
  if (!match) return null;

  const lat = parseFloat(match[1]);
  const lon = parseFloat(match[2]);
  const radius = parseFloat(match[3]);

  const options = { steps: 64, units: 'meters' };
  const polygon = turfCircle([lon, lat], radius, options);
  
  return polygon.geometry;
};

/**
 * Split area string into individual shape strings
 * Handles: CIRCLE(...)CIRCLE(...), CIRCLE(...) POLYGON(...), etc.
 */
const splitShapes = (area) => {
  const shapes = [];
  let remaining = area.trim();
  console.log('[geofenceParser] splitShapes input:', area.slice(0, 80));

  while (remaining.length > 0) {
    remaining = remaining.trim();
    
    // Check for CIRCLE
    if (remaining.toUpperCase().startsWith('CIRCLE')) {
      const match = remaining.match(/CIRCLE\s*\([^)]+\)/i);
      if (match) {
        shapes.push(match[0]);
        remaining = remaining.slice(match[0].length);
        continue;
      }
    }
    
    // Check for POLYGON
    if (remaining.toUpperCase().startsWith('POLYGON')) {
      // Find matching closing parentheses
      let depth = 0;
      let endIndex = 0;
      for (let i = 0; i < remaining.length; i++) {
        if (remaining[i] === '(') depth++;
        else if (remaining[i] === ')') {
          depth--;
          if (depth === 0) {
            endIndex = i + 1;
            break;
          }
        }
      }
      if (endIndex > 0) {
        const shape = remaining.slice(0, endIndex);
        console.log('[geofenceParser] Found POLYGON shape:', shape.slice(0, 80));
        shapes.push(shape);
        remaining = remaining.slice(endIndex);
        continue;
      }
    }
    
    // If we can't parse, break to avoid infinite loop
    console.log('[geofenceParser] Could not parse remaining:', remaining.slice(0, 50));
    break;
  }

  console.log('[geofenceParser] splitShapes found', shapes.length, 'shapes');
  return shapes;
};

/**
 * Parse geofence area string and return array of GeoJSON geometries
 * 
 * Supported formats:
 * - POLYGON((lon lat, lon lat, ...))
 * - CIRCLE(lat lon radius)
 * - Multiple shapes: CIRCLE(...)CIRCLE(...) or CIRCLE(...) POLYGON(...)
 * 
 * @param {string} area - The geofence area string
 * @returns {Array} Array of GeoJSON geometry objects
 */
export const parseGeofenceArea = (area) => {
  if (!area || typeof area !== 'string') {
    console.log('[geofenceParser] parseGeofenceArea: invalid input', area);
    return [];
  }

  console.log('[geofenceParser] parseGeofenceArea input:', area);
  const shapes = splitShapes(area);
  const geometries = [];

  for (const shape of shapes) {
    const trimmed = shape.trim();
    const upper = trimmed.toUpperCase();

    if (upper.startsWith('CIRCLE')) {
      const geometry = parseCircle(trimmed);
      console.log('[geofenceParser] CIRCLE result:', geometry ? 'success' : 'null');
      if (geometry) geometries.push(geometry);
    } else if (upper.startsWith('POLYGON')) {
      const geometry = parsePolygon(trimmed);
      console.log('[geofenceParser] POLYGON result:', geometry ? 'success' : 'null');
      if (geometry) geometries.push(geometry);
    }
  }

  console.log('[geofenceParser] parseGeofenceArea returning', geometries.length, 'geometries');
  return geometries;
};

/**
 * Convert geofence item to GeoJSON features
 * Returns multiple features if geofence has multiple shapes
 * 
 * @param {Object} item - Geofence item with id, name, area, attributes
 * @returns {Array} Array of GeoJSON Feature objects
 */
// Helper to parse attributes that might be JSON strings
const parseAttributes = (attrs) => {
  if (!attrs) return {};
  if (typeof attrs === 'string') {
    try {
      return JSON.parse(attrs);
    } catch {
      return {};
    }
  }
  return attrs;
};

export const geofenceToFeatures = (item) => {
  if (!item || !item.area) {
    console.log(`[geofenceParser] No area for geofence: ${item?.name}`);
    return [];
  }

  const geometries = parseGeofenceArea(item.area);
  const attributes = parseAttributes(item.attributes);
  
  console.log(`[geofenceParser] ${item.name}: parsed ${geometries.length} geometries from area: ${item.area.slice(0, 60)}...`);
  
  return geometries.map((geometry, index) => ({
    id: `${item.id}-${index}`,
    type: 'Feature',
    geometry,
    properties: {
      name: item.name,
      color: attributes.color || '#3bb2d0',
      width: attributes.mapLineWidth || 2,
      opacity: attributes.mapLineOpacity || 1,
      geofenceId: item.id,
    },
  }));
};

/**
 * Calculate bounding box for a geofence
 * @param {Object} item - Geofence item
 * @returns {Array|null} [[minLon, minLat], [maxLon, maxLat]] or null
 */
export const getGeofenceBounds = (item) => {
  const geometries = parseGeofenceArea(item.area);
  if (geometries.length === 0) return null;

  let minLon = Infinity, maxLon = -Infinity;
  let minLat = Infinity, maxLat = -Infinity;

  const processCoords = (coords) => {
    if (!Array.isArray(coords)) return;
    
    if (coords.length === 2 && typeof coords[0] === 'number' && typeof coords[1] === 'number') {
      // [lon, lat] pair
      minLon = Math.min(minLon, coords[0]);
      maxLon = Math.max(maxLon, coords[0]);
      minLat = Math.min(minLat, coords[1]);
      maxLat = Math.max(maxLat, coords[1]);
    } else {
      // Nested array, recurse
      coords.forEach(processCoords);
    }
  };

  geometries.forEach(geom => {
    processCoords(geom.coordinates);
  });

  if (minLon === Infinity) return null;

  return [[minLon, minLat], [maxLon, maxLat]];
};

export default {
  parseGeofenceArea,
  geofenceToFeatures,
  getGeofenceBounds,
};
