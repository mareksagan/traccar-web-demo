import { createEffect, onCleanup } from 'solid-js';
import { maplibregl } from './core/MapView';

export default function MapRoute(props) {
  const map = () => props.map;
  const positions = () => props.positions || [];

  const sourceId = 'route-source';
  const layerId = 'route-layer';

  const updateRoute = () => {
    const mapInstance = map();
    const posList = positions();
    
    if (!mapInstance || posList.length === 0) return;

    const coordinates = posList.map((p) => [p.longitude, p.latitude]);

    // Remove existing source/layer if they exist
    if (mapInstance.getLayer(layerId)) {
      mapInstance.removeLayer(layerId);
    }
    if (mapInstance.getSource(sourceId)) {
      mapInstance.removeSource(sourceId);
    }

    // Add source
    mapInstance.addSource(sourceId, {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates,
        },
      },
    });

    // Add layer
    mapInstance.addLayer({
      id: layerId,
      type: 'line',
      source: sourceId,
      layout: {
        'line-join': 'round',
        'line-cap': 'round',
      },
      paint: {
        'line-color': '#3b82f6',
        'line-width': 4,
      },
    });

    // Fit bounds to show the route
    const bounds = new maplibregl.LngLatBounds();
    coordinates.forEach((coord) => bounds.extend(coord));
    mapInstance.fitBounds(bounds, { padding: 50, maxZoom: 16 });
  };

  createEffect(() => {
    const mapInstance = map();
    if (!mapInstance) return;

    if (mapInstance.isStyleLoaded()) {
      updateRoute();
    } else {
      const onLoad = () => {
        updateRoute();
        mapInstance.off('load', onLoad);
      };
      mapInstance.on('load', onLoad);
    }
  });

  createEffect(() => {
    // React to positions changes
    const posList = positions();
    if (posList.length > 0) {
      updateRoute();
    }
  });

  onCleanup(() => {
    const mapInstance = map();
    if (!mapInstance) return;

    try {
      if (mapInstance.getLayer(layerId)) {
        mapInstance.removeLayer(layerId);
      }
      if (mapInstance.getSource(sourceId)) {
        mapInstance.removeSource(sourceId);
      }
    } catch (e) {
      // Ignore cleanup errors
    }
  });

  return null;
}
