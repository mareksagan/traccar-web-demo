import { createSignal, createEffect, For } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import MapView from '../map/core/MapView';
import { geofenceToFeatures } from '../common/util/geofenceParser';
import { maplibregl } from '../map/core/MapView';

// Test geofences from the issue
const TEST_GEOFENCES = [
  {
    id: 1,
    name: 'Test Polygon',
    area: 'POLYGON((47.0160 28.8560, 47.0160 28.8710, 47.0060 28.8710, 47.0060 28.8560, 47.0160 28.8560))',
    attributes: { color: '#ff0000' },
  },
  {
    id: 2,
    name: 'Test Circle 1',
    area: 'CIRCLE(47.0105 28.8638 500)',
    attributes: { color: '#00ff00' },
  },
  {
    id: 3,
    name: 'Test Circle 2',
    area: 'CIRCLE(47.0010 28.8500 300)',
    attributes: { color: '#0000ff' },
  },
  {
    id: 4,
    name: 'Multiple Shapes',
    area: 'POLYGON((47.0160 28.8560, 47.0160 28.8710, 47.0060 28.8710, 47.0060 28.8560, 47.0160 28.8560)) CIRCLE(47.0105 28.8638 500) CIRCLE(47.0010 28.8500 300)',
    attributes: { color: '#ff00ff' },
  },
];

export default function GeofenceTestPage() {
  const navigate = useNavigate();
  const [map, setMap] = createSignal(null);
  const [selectedGeofence, setSelectedGeofence] = createSignal(TEST_GEOFENCES[0]);
  const [parsedFeatures, setParsedFeatures] = createSignal([]);

  // Parse selected geofence
  createEffect(() => {
    const geofence = selectedGeofence();
    const features = geofenceToFeatures(geofence);
    setParsedFeatures(features);
  });

  // Display geofence on map
  createEffect(() => {
    const mapInstance = map();
    const features = parsedFeatures();
    
    if (!mapInstance || features.length === 0) return;

    // Remove existing layers
    ['test-geofence-fill', 'test-geofence-line'].forEach(id => {
      if (mapInstance.getLayer(id)) mapInstance.removeLayer(id);
    });
    if (mapInstance.getSource('test-geofence-source')) {
      mapInstance.removeSource('test-geofence-source');
    }

    // Add source with features
    mapInstance.addSource('test-geofence-source', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features,
      },
    });

    // Add fill layer
    mapInstance.addLayer({
      id: 'test-geofence-fill',
      type: 'fill',
      source: 'test-geofence-source',
      paint: {
        'fill-color': ['get', 'color'],
        'fill-opacity': 0.2,
      },
    });

    // Add line layer
    mapInstance.addLayer({
      id: 'test-geofence-line',
      type: 'line',
      source: 'test-geofence-source',
      paint: {
        'line-color': ['get', 'color'],
        'line-width': 2,
      },
    });

    // Fit bounds to show geofence
    const bounds = new maplibregl.LngLatBounds();
    features.forEach(feature => {
      const coords = feature.geometry.coordinates;
      if (feature.geometry.type === 'Polygon') {
        coords[0].forEach(coord => bounds.extend(coord));
      }
    });
    
    if (!bounds.isEmpty()) {
      mapInstance.fitBounds(bounds, { padding: 100, maxZoom: 16 });
    }
  });

  return (
    <div class="h-full flex flex-col">
      {/* Header */}
      <div class="p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div class="flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            class="btn btn-secondary"
          >
            ← Back
          </button>
          <h1 class="text-xl font-bold">Geofence Parser Test</h1>
        </div>
      </div>

      <div class="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Sidebar */}
        <div class="w-full md:w-96 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto p-4 space-y-4">
          <div>
            <h2 class="font-semibold mb-2">Select Test Geofence</h2>
            <div class="space-y-2">
              <For each={TEST_GEOFENCES}>
                {(geofence) => (
                  <button
                    onClick={() => setSelectedGeofence(geofence)}
                    class={`w-full text-left p-3 rounded-lg border transition-colors ${
                      selectedGeofence().id === geofence.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <div class="font-medium">{geofence.name}</div>
                    <div class="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {geofence.area.slice(0, 50)}...
                    </div>
                  </button>
                )}
              </For>
            </div>
          </div>

          <div>
            <h2 class="font-semibold mb-2">Parsed Features ({parsedFeatures().length})</h2>
            <pre class="bg-gray-100 dark:bg-gray-900 p-3 rounded text-xs overflow-x-auto">
              {JSON.stringify(parsedFeatures(), null, 2)}
            </pre>
          </div>
        </div>

        {/* Map */}
        <div class="flex-1 relative">
          <MapView
            center={[28.86, 47.01]}
            zoom={14}
            onLoad={setMap}
          />
        </div>
      </div>
    </div>
  );
}
