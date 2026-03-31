import { describe, it, expect } from 'vitest';
import {
  parseGeofenceArea,
  geofenceToFeatures,
  getGeofenceBounds,
} from '../geofenceParser';

describe('geofenceParser', () => {
  describe('parseGeofenceArea', () => {
    it('should parse a simple POLYGON', () => {
      const area = 'POLYGON((47.0160 28.8560, 47.0160 28.8710, 47.0060 28.8710, 47.0060 28.8560, 47.0160 28.8560))';
      const result = parseGeofenceArea(area);
      
      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('Polygon');
      expect(result[0].coordinates[0]).toHaveLength(5); // 4 points + closing point
      
      // Check first coordinate [lon, lat]
      expect(result[0].coordinates[0][0]).toEqual([47.0160, 28.8560]);
    });

    it('should parse a simple CIRCLE', () => {
      const area = 'CIRCLE(47.0105 28.8638 500)';
      const result = parseGeofenceArea(area);
      
      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('Polygon'); // CIRCLE becomes Polygon
      expect(result[0].coordinates[0]).toHaveLength(65); // 64 steps + closing point
    });

    it('should parse multiple CIRCLEs', () => {
      const area = 'CIRCLE(47.0105 28.8638 500) CIRCLE(47.0010 28.8500 300)';
      const result = parseGeofenceArea(area);
      
      expect(result).toHaveLength(2);
      expect(result[0].type).toBe('Polygon');
      expect(result[1].type).toBe('Polygon');
    });

    it('should parse mixed CIRCLE and POLYGON', () => {
      const area = 'POLYGON((47.0160 28.8560, 47.0160 28.8710, 47.0060 28.8710, 47.0060 28.8560, 47.0160 28.8560)) CIRCLE(47.0105 28.8638 500)';
      const result = parseGeofenceArea(area);
      
      expect(result).toHaveLength(2);
      expect(result[0].type).toBe('Polygon');
      expect(result[1].type).toBe('Polygon');
    });

    it('should parse CIRCLE without spaces', () => {
      const area = 'CIRCLE(47.0105 28.8638 500)CIRCLE(47.0010 28.8500 300)';
      const result = parseGeofenceArea(area);
      
      expect(result).toHaveLength(2);
    });

    it('should handle empty area', () => {
      expect(parseGeofenceArea('')).toHaveLength(0);
      expect(parseGeofenceArea(null)).toHaveLength(0);
      expect(parseGeofenceArea(undefined)).toHaveLength(0);
    });

    it('should handle invalid area', () => {
      expect(parseGeofenceArea('INVALID')).toHaveLength(0);
      expect(parseGeofenceArea('CIRCLE()')).toHaveLength(0);
      expect(parseGeofenceArea('POLYGON()')).toHaveLength(0);
    });

    it('should parse negative coordinates', () => {
      const area = 'CIRCLE(-47.0105 -28.8638 500)';
      const result = parseGeofenceArea(area);
      
      expect(result).toHaveLength(1);
    });

    it('should parse decimal coordinates', () => {
      const area = 'CIRCLE(47.123456789 28.987654321 123.45)';
      const result = parseGeofenceArea(area);
      
      expect(result).toHaveLength(1);
    });
  });

  describe('geofenceToFeatures', () => {
    it('should convert single shape geofence to features', () => {
      const item = {
        id: 1,
        name: 'Test Geofence',
        area: 'CIRCLE(47.0105 28.8638 500)',
        attributes: { color: '#ff0000' },
      };
      
      const result = geofenceToFeatures(item);
      
      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('Feature');
      expect(result[0].properties.name).toBe('Test Geofence');
      expect(result[0].properties.color).toBe('#ff0000');
      expect(result[0].properties.geofenceId).toBe(1);
    });

    it('should convert multi-shape geofence to multiple features', () => {
      const item = {
        id: 2,
        name: 'Multi Geofence',
        area: 'CIRCLE(47.0105 28.8638 500) CIRCLE(47.0010 28.8500 300)',
        attributes: {},
      };
      
      const result = geofenceToFeatures(item);
      
      expect(result).toHaveLength(2);
      expect(result[0].properties.name).toBe('Multi Geofence');
      expect(result[1].properties.name).toBe('Multi Geofence');
      expect(result[0].id).toBe('2-0');
      expect(result[1].id).toBe('2-1');
    });

    it('should use default color when not specified', () => {
      const item = {
        id: 3,
        name: 'Default Color',
        area: 'CIRCLE(47.0105 28.8638 500)',
        attributes: {},
      };
      
      const result = geofenceToFeatures(item);
      
      expect(result[0].properties.color).toBe('#3bb2d0');
      expect(result[0].properties.width).toBe(2);
      expect(result[0].properties.opacity).toBe(1);
    });

    it('should handle empty area', () => {
      const item = {
        id: 4,
        name: 'Empty',
        area: '',
        attributes: {},
      };
      
      const result = geofenceToFeatures(item);
      
      expect(result).toHaveLength(0);
    });
  });

  describe('getGeofenceBounds', () => {
    it('should calculate bounds for a CIRCLE', () => {
      const item = {
        id: 1,
        name: 'Circle',
        area: 'CIRCLE(47.0105 28.8638 500)',
      };
      
      const bounds = getGeofenceBounds(item);
      
      expect(bounds).toBeTruthy();
      expect(bounds).toHaveLength(2);
      expect(bounds[0]).toHaveLength(2); // [minLon, minLat]
      expect(bounds[1]).toHaveLength(2); // [maxLon, maxLat]
    });

    it('should calculate bounds for a POLYGON', () => {
      const item = {
        id: 2,
        name: 'Polygon',
        area: 'POLYGON((47.0160 28.8560, 47.0160 28.8710, 47.0060 28.8710, 47.0060 28.8560, 47.0160 28.8560))',
      };
      
      const bounds = getGeofenceBounds(item);
      
      expect(bounds).toBeTruthy();
      expect(bounds[0][0]).toBeCloseTo(47.0060, 3); // minLon
      expect(bounds[1][0]).toBeCloseTo(47.0160, 3); // maxLon
      expect(bounds[0][1]).toBeCloseTo(28.8560, 3); // minLat
      expect(bounds[1][1]).toBeCloseTo(28.8710, 3); // maxLat
    });

    it('should return null for empty area', () => {
      const item = {
        id: 3,
        name: 'Empty',
        area: '',
      };
      
      const bounds = getGeofenceBounds(item);
      
      expect(bounds).toBeNull();
    });

    it('should calculate bounds for multiple shapes', () => {
      // CIRCLE(lat lon radius) - note: lat comes first!
      const item = {
        id: 4,
        name: 'Multi',
        area: 'CIRCLE(28.8638 47.0105 500) CIRCLE(28.8638 48.0105 500)', // Same lat, different lon
      };
      
      const bounds = getGeofenceBounds(item);
      
      expect(bounds).toBeTruthy();
      // Should encompass both circles (bounds are [[minLon, minLat], [maxLon, maxLat]])
      expect(bounds[0][0]).toBeLessThan(47.0105); // minLon
      expect(bounds[1][0]).toBeGreaterThan(48.0105); // maxLon
    });
  });

  describe('end-to-end examples', () => {
    it('should handle the exact example from the issue', () => {
      const area = 'POLYGON((47.0160 28.8560, 47.0160 28.8710, 47.0060 28.8710, 47.0060 28.8560, 47.0160 28.8560)) CIRCLE(47.0105 28.8638 500) CIRCLE(47.0010 28.8500 300)';
      
      const result = parseGeofenceArea(area);
      
      expect(result).toHaveLength(3);
      expect(result[0].type).toBe('Polygon'); // POLYGON
      expect(result[1].type).toBe('Polygon'); // CIRCLE converted to Polygon
      expect(result[2].type).toBe('Polygon'); // CIRCLE converted to Polygon
    });

    it('should create valid GeoJSON for MapLibre', () => {
      const item = {
        id: 1,
        name: 'Test',
        area: 'POLYGON((47.0160 28.8560, 47.0160 28.8710, 47.0060 28.8710, 47.0060 28.8560, 47.0160 28.8560)) CIRCLE(47.0105 28.8638 500)',
        attributes: { color: '#ff0000', mapLineWidth: 3 },
      };
      
      const features = geofenceToFeatures(item);
      
      // Validate GeoJSON structure
      features.forEach(feature => {
        expect(feature.type).toBe('Feature');
        expect(feature.geometry).toBeDefined();
        expect(feature.geometry.type).toBe('Polygon');
        expect(feature.geometry.coordinates).toBeDefined();
        expect(Array.isArray(feature.geometry.coordinates)).toBe(true);
        expect(feature.properties).toBeDefined();
        expect(feature.properties.name).toBe('Test');
        expect(feature.properties.color).toBe('#ff0000');
        expect(feature.properties.width).toBe(3);
      });
    });
  });
});
