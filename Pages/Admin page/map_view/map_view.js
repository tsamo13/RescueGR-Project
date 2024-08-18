// Initialize the map and set its view to Patras, Greece
var map = L.map('map').setView([38.2466, 21.7346], 13);

// Set up the OSM layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Create a marker for the base (initially not draggable)
var baseMarker = L.marker([38.2466, 21.7346], {
    draggable: false
}).addTo(map)
  .bindPopup('Click here to confirm dragging the base location.').openPopup();

// Add click event to the marker to ask for confirmation
baseMarker.on('click', function() {
    var confirmation = confirm("Do you want to drag the marker to set a new base location?");
    if (confirmation) {
        baseMarker.dragging.enable(); // Enable dragging
        baseMarker.bindPopup('Drag the marker to set the new base location.').openPopup();
    } else {
        baseMarker.dragging.disable(); // Ensure dragging is disabled
        baseMarker.bindPopup('Drag cancelled. Click again to confirm dragging.').openPopup();
    }
});

// Event listener to update the marker position on drag end
baseMarker.on('dragend', function(e) {
    var marker = e.target;
    var position = marker.getLatLng();
    marker.setLatLng(position, {draggable: true}).bindPopup(
        "Base location: " + position.lat.toFixed(4) + ", " + position.lng.toFixed(4)
    ).openPopup();
    
    // You can add code to save the new base location here
    console.log("New base location: ", position);
});
