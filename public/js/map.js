// Get coordinates
const lat = listing.geometry.coordinates[1];
const lng = listing.geometry.coordinates[0];

// Map
const map = L.map('map').setView([lat, lng], 14);

// Tile layer
L.tileLayer(
  'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
  {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap & CARTO'
  }
).addTo(map);

// Red marker icon
const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

L.marker([lat, lng], { icon: redIcon })
  .addTo(map)
  .bindPopup(`
    <div style="text-align:center;">
      <img src="${listing.image.url}" style="width:100%; border-radius:8px; margin-bottom:6px;">
      <strong>${listing.title}</strong><br>
      <small>${listing.location}</small>
    </div>
  `);



  