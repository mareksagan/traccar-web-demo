import { createEffect, createSignal, For, Show, onMount, onCleanup, untrack } from 'solid-js';
import MapView, { maplibregl } from '../map/core/MapView';
import { devices, devicesActions, session, geofences, geofencesActions } from '../stores';
import { getCategoryColor } from '../common/util/colors';
import MapGeofences from '../map/MapGeofences';

export default function MainMap(props) {
  const [map, setMap] = createSignal(null);
  const [markers, setMarkers] = createSignal({});
  const [selectedMapStyle, setSelectedMapStyle] = createSignal('osm');

  const getMapStyle = () => {
    switch (selectedMapStyle()) {
      case 'satellite':
        return {
          version: 8,
          sources: {
            satellite: {
              type: 'raster',
              tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
              tileSize: 256,
            },
          },
          layers: [{ id: 'satellite', type: 'raster', source: 'satellite' }],
        };
      default:
        return {
          version: 8,
          sources: {
            osm: {
              type: 'raster',
              tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
              tileSize: 256,
              attribution: '&copy; OpenStreetMap Contributors',
            },
          },
          layers: [{ id: 'osm', type: 'raster', source: 'osm' }],
        };
    }
  };

  const createMarkerElement = (device, position) => {
    const el = document.createElement('div');
    el.className = 'device-marker';
    const color = getCategoryColor(device.category);
    const rotation = position.course || 0;
    
    el.innerHTML = `
      <div style="
        width: 32px;
        height: 32px;
        transform: rotate(${rotation}deg);
        filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
      ">
        <svg viewBox="0 0 24 24" fill="${color}">
          <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"/>
        </svg>
      </div>
    `;
    
    el.addEventListener('click', () => {
      devicesActions.selectId(device.id);
    });
    
    return el;
  };

  const updateMarkers = () => {
    const mapInstance = map();
    if (!mapInstance) return;
    
    const currentMarkers = markers();
    const newMarkers = {};
    const deviceItems = Object.values(devices.items);
    
    deviceItems.forEach((device) => {
      const position = session.positions[device.id];
      if (!position) return;
      
      if (currentMarkers[device.id]) {
        // Update existing marker position
        currentMarkers[device.id].setLngLat([position.longitude, position.latitude]);
        
        // Update rotation - need to recreate the element since maplibre doesn't support dynamic rotation
        const el = currentMarkers[device.id].getElement();
        const rotation = position.course || 0;
        const color = getCategoryColor(device.category);
        el.innerHTML = `
          <div style="
            width: 32px;
            height: 32px;
            transform: rotate(${rotation}deg);
            filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
          ">
            <svg viewBox="0 0 24 24" fill="${color}">
              <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"/>
            </svg>
          </div>
        `;
        
        newMarkers[device.id] = currentMarkers[device.id];
      } else {
        const el = createMarkerElement(device, position);
        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([position.longitude, position.latitude])
          .addTo(mapInstance);
        newMarkers[device.id] = marker;
      }
    });
    
    // Remove markers for deleted devices
    Object.keys(currentMarkers).forEach((id) => {
      if (!newMarkers[id]) {
        currentMarkers[id].remove();
      }
    });
    
    setMarkers(newMarkers);
  };

  // Watch for position updates and update markers
  createEffect(() => {
    // Access session.positions to track changes (but don't track the updateMarkers call)
    const positionKeys = Object.keys(session.positions);
    const deviceKeys = Object.keys(devices.items);
    
    // Use untrack to prevent infinite loop from setMarkers
    untrack(() => updateMarkers());
  });

  const handleLoad = async (mapInstance) => {
    setMap(mapInstance);
    updateMarkers();
    
    // Fit bounds to show all devices with positions
    fitMapToDevices();
    
    // Fetch geofences
    try {
      const response = await fetch('/api/geofences');
      if (response.ok) {
        const geofencesData = await response.json();
        console.log('[MainMap] Loaded geofences:', geofencesData.length);
        geofencesData.forEach(g => console.log(`[MainMap] - ${g.name} (id: ${g.id})`));
        geofencesActions.refresh(geofencesData);
      } else {
        console.error('[MainMap] Failed to load geofences:', response.status);
      }
    } catch (error) {
      console.error('[MainMap] Failed to load geofences:', error);
    }
  };

  const fitMapToDevices = () => {
    const mapInstance = map();
    if (!mapInstance) return;
    
    const positions = Object.values(session.positions);
    if (positions.length === 0) return;
    
    const bounds = new maplibregl.LngLatBounds();
    positions.forEach((pos) => {
      bounds.extend([pos.longitude, pos.latitude]);
    });
    
    // If only one device, center on it with a reasonable zoom
    if (positions.length === 1) {
      mapInstance.flyTo({
        center: [positions[0].longitude, positions[0].latitude],
        zoom: 15,
        duration: 1000,
      });
    } else {
      // Multiple devices - fit bounds with padding
      mapInstance.fitBounds(bounds, { 
        padding: { top: 100, bottom: 100, left: 400, right: 100 },
        duration: 1000,
        maxZoom: 16,
      });
    }
  };

  // Fit bounds when filtered positions change
  createEffect(() => {
    const mapInstance = map();
    if (mapInstance && props.filteredPositions?.length > 0) {
      const bounds = new maplibregl.LngLatBounds();
      props.filteredPositions.forEach((pos) => {
        bounds.extend([pos.longitude, pos.latitude]);
      });
      mapInstance.fitBounds(bounds, { 
        padding: { top: 100, bottom: 100, left: 400, right: 100 },
        duration: 500,
        maxZoom: 16,
      });
    }
  });

  // Fit bounds when session positions update (on initial load)
  createEffect(() => {
    const mapInstance = map();
    const positions = Object.values(session.positions);
    if (mapInstance && positions.length > 0) {
      // Only fit if we haven't fitted yet (check if map center is at default)
      const center = mapInstance.getCenter();
      if (center.lng === 0 && center.lat === 0) {
        fitMapToDevices();
      }
    }
  });

  return (
    <div class="relative w-full h-full">
      <MapView
        mapStyle={getMapStyle()}
        onLoad={handleLoad}
        class="absolute inset-0"
      />
      
      <MapGeofences map={map} />
      
      {/* Map controls */}
      <div class="absolute top-4 right-4 flex flex-col gap-2 z-10">
        <button
          onClick={() => setSelectedMapStyle(selectedMapStyle() === 'osm' ? 'satellite' : 'osm')}
          class="bg-white dark:bg-gray-800 p-2 rounded-lg shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          title="Toggle Map Style"
        >
          <span class="material-icons text-gray-700 dark:text-gray-300">
            {selectedMapStyle() === 'osm' ? 'satellite' : 'map'}
          </span>
        </button>
        
        <button
          onClick={() => props.onEventsClick?.()}
          class="bg-white dark:bg-gray-800 p-2 rounded-lg shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          title="Events"
        >
          <span class="material-icons text-gray-700 dark:text-gray-300">notifications</span>
        </button>
      </div>
    </div>
  );
}
