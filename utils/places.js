const CATEGORY_LABELS = {
  museum: 'Museum', cafe: 'Café', restaurant: 'Restaurant',
  bar: 'Bar', library: 'Library', cinema: 'Cinema',
  theatre: 'Theatre', attraction: 'Attraction',
  viewpoint: 'Viewpoint', gallery: 'Gallery', park: 'Park',
};

export async function fetchNearbyPlaces(latitude, longitude, radiusMeters = 500) {
  const query = `
    [out:json][timeout:15];
    (
      node["amenity"~"museum|cafe|restaurant|bar|library|cinema|theatre"](around:${radiusMeters},${latitude},${longitude});
      node["tourism"~"attraction|viewpoint|gallery"](around:${radiusMeters},${latitude},${longitude});
      node["leisure"="park"](around:${radiusMeters},${latitude},${longitude});
    );
    out body 20;
  `;
  const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;
  const res = await fetch(url);
  const data = await res.json();

  return data.elements
    .filter((el) => el.tags?.name)
    .map((el) => {
      const type = el.tags.amenity || el.tags.tourism || el.tags.leisure || 'place';
      const dist = haversineDistance(latitude, longitude, el.lat, el.lon);
      return {
        id: String(el.id),
        name: el.tags.name,
        category: CATEGORY_LABELS[type] || 'Place',
        distance: dist < 1000 ? `${Math.round(dist)} m` : `${(dist / 1000).toFixed(1)} km`,
        latitude: el.lat,
        longitude: el.lon,
      };
    })
    .slice(0, 15);
}

function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
