import { createEffect, onCleanup, createSignal } from 'solid-js';
import { geofences } from '../stores';
import { geofenceToFeatures } from '../common/util/geofenceParser';
import { maplibregl } from './core/MapView';

export default function MapGeofences(props) {
  // The map prop is a signal function, not a value
  const map = props.map;
  
  // Generate unique IDs for this instance
  const id = Math.random().toString(36).substr(2, 9);
  const sourceId = `geofences-source-${id}`;
  const fillLayerId = `geofences-fill-${id}`;
  const lineLayerId = `geofences-line-${id}`;
  const titleLayerId = `geofences-title-${id}`;
  
  const [initialized, setInitialized] = createSignal(false);

  // Initialize layers
  const initLayers = () => {
    const mapInstance = map();
    if (!mapInstance) return false;
    
    try {
      // Check if source already exists
      if (mapInstance.getSource(sourceId)) {
        return true;
      }
      
      // Add source
      mapInstance.addSource(sourceId, {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [],
        },
      });

      // Add fill layer
      mapInstance.addLayer({
        source: sourceId,
        id: fillLayerId,
        type: 'fill',
        filter: ['all', ['==', '$type', 'Polygon']],
        paint: {
          'fill-color': ['get', 'color'],
          'fill-outline-color': ['get', 'color'],
          'fill-opacity': 0.2,
        },
      });

      // Add line layer
      mapInstance.addLayer({
        source: sourceId,
        id: lineLayerId,
        type: 'line',
        paint: {
          'line-color': ['get', 'color'],
          'line-width': ['get', 'width'],
          'line-opacity': ['get', 'opacity'],
        },
      });

      // Add label layer
      mapInstance.addLayer({
        source: sourceId,
        id: titleLayerId,
        type: 'symbol',
        layout: {
          'text-field': '{name}',
          'text-size': 12,
        },
        paint: {
          'text-halo-color': 'white',
          'text-halo-width': 1,
        },
      });
      
      return true;
    } catch (err) {
      console.error('MapGeofences: Error initializing layers:', err);
      return false;
    }
  };

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

  // Update geofences data
  const updateData = () => {
    const mapInstance = map();
    if (!mapInstance) {
      console.log('[MapGeofences] updateData: no map instance');
      return;
    }
    
    const source = mapInstance.getSource(sourceId);
    if (!source) {
      console.log('[MapGeofences] updateData: no source found');
      return;
    }
    
    const allGeofences = Object.values(geofences.items);
    
    // Debug logging
    console.log('[MapGeofences] Total geofences:', allGeofences.length);
    allGeofences.forEach(g => {
      const attrs = parseAttributes(g.attributes);
      console.log(`[MapGeofences] Geofence: ${g.name}, area: ${g.area}, hide: ${attrs.hide}`);
    });
    
    const features = allGeofences
      .filter((geofence) => {
        const attrs = parseAttributes(geofence.attributes);
        const hidden = attrs.hide === true || attrs.hide === 'true';
        if (hidden) {
          console.log(`[MapGeofences] Filtering out hidden geofence: ${geofence.name}`);
        }
        return !hidden;
      })
      .flatMap((geofence) => {
        const geofenceWithParsedAttrs = {
          ...geofence,
          attributes: parseAttributes(geofence.attributes)
        };
        const feats = geofenceToFeatures(geofenceWithParsedAttrs);
        console.log(`[MapGeofences] ${geofence.name} -> ${feats.length} features`);
        return feats;
      });
    
    console.log('[MapGeofences] Total features to display:', features.length);
    
    if (features.length > 0) {
      console.log('[MapGeofences] First feature geometry:', JSON.stringify(features[0].geometry).slice(0, 200));
    }
    
    source.setData({
      type: 'FeatureCollection',
      features,
    });
    
    console.log('[MapGeofences] Data set on source');
    
    // Try to fit bounds to show geofences
    try {
      const bounds = new maplibregl.LngLatBounds();
      features.forEach(f => {
        if (f.geometry.type === 'Polygon') {
          f.geometry.coordinates[0].forEach(coord => bounds.extend(coord));
        }
      });
      if (!bounds.isEmpty()) {
        console.log('[MapGeofences] Fitting bounds to:', bounds);
        mapInstance.fitBounds(bounds, { padding: 100, maxZoom: 16, duration: 1000 });
      }
    } catch (e) {
      console.error('[MapGeofences] Error fitting bounds:', e);
    }
  };

  // Watch for map availability
  createEffect(() => {
    const mapInstance = map();
    if (!mapInstance) return;
    
    // Wait for style to be loaded
    if (mapInstance.isStyleLoaded()) {
      if (initLayers()) {
        setInitialized(true);
        updateData();
      }
    } else {
      const onStyleData = () => {
        if (mapInstance.isStyleLoaded()) {
          mapInstance.off('styledata', onStyleData);
          if (initLayers()) {
            setInitialized(true);
            updateData();
          }
        }
      };
      mapInstance.on('styledata', onStyleData);
    }
  });

  // Watch for geofences changes
  createEffect(() => {
    if (!initialized()) return;
    
    // Access geofences to track changes - properly unwrap the store
    const items = Object.values(geofences.items);
    const count = items.length;
    
    // Access each geofence's properties to track changes
    items.forEach(item => {
      item.name;
      item.area;
      item.attributes?.color;
      item.attributes?.mapLineWidth;
      item.attributes?.mapLineOpacity;
      item.attributes?.hide;
    });
    
    updateData();
  });

  onCleanup(() => {
    const mapInstance = map();
    if (!mapInstance) return;
    
    try {
      if (mapInstance.getLayer(fillLayerId)) {
        mapInstance.removeLayer(fillLayerId);
      }
      if (mapInstance.getLayer(lineLayerId)) {
        mapInstance.removeLayer(lineLayerId);
      }
      if (mapInstance.getLayer(titleLayerId)) {
        mapInstance.removeLayer(titleLayerId);
      }
      if (mapInstance.getSource(sourceId)) {
        mapInstance.removeSource(sourceId);
      }
    } catch (err) {
      // Ignore cleanup errors
    }
  });

  return null;
}
