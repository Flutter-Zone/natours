// var mapboxgl = require('mapbox-gl/dist/mapbox-gl.js');
const locations = JSON.parse(document.getElementById('map').dataset.locations);

mapboxgl.accessToken = 'pk.eyJ1IjoiYmxhbmtzb25yIiwiYSI6ImNrb2Fqa3Z0NzExcTkybnMyNHJpaHV6bHUifQ.igFNtDBoGz-ngu1jQF_YLg';
var map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/blanksonr/ckoajudkb079u17qpyrxri7zi',
  // center: [-118.113491, 34.111745],
  // zoom: 10,
  // interactive: false
});

const bounds = new mapboxgl.LngLatBounds();

locations.forEach(loc => {
  // Add marker
  const el = document.createElement('div');
  el.className = 'marker';

  // Add marker
  new mapboxgl.Marker({
    element: el,
    anchor: 'bottom'
  }).setLngLat(loc.coordinates).addTo(map);

  // Add popup
  new mapboxgl.Popup({
    offset: 30
  }).setLngLat(loc.coordinates)
  .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
  .addTo(map);

  // Extend map bounds to include current location
  bounds.extend(loc.coordinates);
});

map.fitBounds(bounds, {
  padding: {
    bottom: 150,
    top: 200,
    left: 100,
    right: 100,
  }
});