import { onMount, onCleanup, createEffect, createSignal } from 'solid-js';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

export default function MapView(props) {
  let mapContainer;
  let map;
  const [loaded, setLoaded] = createSignal(false);

  onMount(() => {
    map = new maplibregl.Map({
      container: mapContainer,
      style: props.mapStyle || {
        version: 8,
        sources: {
          'osm': {
            type: 'raster',
            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: '&copy; OpenStreetMap Contributors',
          },
        },
        layers: [
          {
            id: 'osm',
            type: 'raster',
            source: 'osm',
          },
        ],
      },
      center: props.center || [0, 0],
      zoom: props.zoom || 2,
    });

    map.on('load', () => {
      setLoaded(true);
      props.onLoad?.(map);
    });

    map.on('move', () => {
      props.onMove?.(map);
    });

    map.on('click', (e) => {
      props.onClick?.(e);
    });

    if (props.forwardRef) {
      props.forwardRef(map);
    }
  });

  onCleanup(() => {
    map?.remove();
  });

  createEffect(() => {
    if (loaded() && props.center) {
      map.setCenter(props.center);
    }
  });

  createEffect(() => {
    if (loaded() && props.zoom !== undefined) {
      map.setZoom(props.zoom);
    }
  });

  return (
    <div 
      ref={mapContainer} 
      class={`w-full h-full ${props.class || ''}`}
      style={props.style}
    />
  );
}

export { maplibregl };
