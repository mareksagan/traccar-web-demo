export const calculateBounds = (positions) => {
  if (!positions || positions.length === 0) return null;
  
  let minLat = Infinity, maxLat = -Infinity;
  let minLng = Infinity, maxLng = -Infinity;
  
  positions.forEach((pos) => {
    if (pos.latitude < minLat) minLat = pos.latitude;
    if (pos.latitude > maxLat) maxLat = pos.latitude;
    if (pos.longitude < minLng) minLng = pos.longitude;
    if (pos.longitude > maxLng) maxLng = pos.longitude;
  });
  
  return [
    [minLng, minLat],
    [maxLng, maxLat],
  ];
};

export const getMapStyle = (type) => {
  switch (type) {
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
        layers: [
          { id: 'satellite', type: 'raster', source: 'satellite' },
        ],
      };
    case 'osm':
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
        layers: [
          { id: 'osm', type: 'raster', source: 'osm' },
        ],
      };
  }
};
