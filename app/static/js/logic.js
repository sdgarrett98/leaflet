// Define multiple basemap layers
let openTopoMap = L.tileLayer(
    "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
    {
      attribution:
        'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
    }
  );
  
  let openStreetMap = L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }
  );
  
  let satelliteMap = L.tileLayer(
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    {
      attribution:
        'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
    }
  );
  
  // Create baseMaps object
  let baseMaps = {
    "OpenTopoMap": openTopoMap,
    "OpenStreetMap": openStreetMap,
    "Satellite": satelliteMap
  };
  
  // Create map object, with options
  let map = L.map("map", {
    center: [40.7, -94.5],
    zoom: 3,
    layers: [openTopoMap] // Set default layer
  });
  
  // Create a layer control and add it to the map
  L.control.layers(baseMaps).addTo(map);
  
  // Retrieve GeoJSON data
  d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson").then(function (data) {
  
    // Style the data for each earthquake that is plotted 
    function styleInfo(feature) {
      return {
        opacity: 1,
        fillOpacity: 1,
        fillColor: getColor(feature.geometry.coordinates[2]),
        color: "#000000",
        radius: getRadius(feature.properties.mag),
        stroke: true,
        weight: 0.5
      };
    }
  
    // Color based on magnitude
    function getColor(depth) {
      switch (true) {
        case depth > 90: return "#ea2c2c";
        case depth > 70: return "#ea822c";
        case depth > 50: return "#ee9c00";
        case depth > 30: return "#eecc00";
        case depth > 10: return "#d4ee00";
        default: return "#98ee00";
      }
    }
  
    // Set the radius of the marker based on magnitude
    function getRadius(magnitude) {
      return magnitude === 0 ? 1 : magnitude * 4;
    }
  
    // Add GeoJSON layer
    L.geoJson(data, {
      pointToLayer: function (feature, latlng) {
        return L.circleMarker(latlng);
      },
      style: styleInfo,
      onEachFeature: function (feature, layer) {
        layer.bindPopup(
          "Magnitude: " + feature.properties.mag +
          "<br>Depth: " + feature.geometry.coordinates[2] +
          "<br>Location: " + feature.properties.place
        );
      }
    }).addTo(map);
  
    // Create legend
    let legend = L.control({ position: "bottomright" });
  
    // Create legend details
    legend.onAdd = function () {
      let div = L.DomUtil.create("div", "info legend");
      let grades = [-10, 10, 30, 50, 70, 90];
      let colors = ["#98ee00", "#d4ee00", "#eecc00", "#ee9c00", "#ea822c", "#ea2c2c"];
  
      // Generate a label for each level
      for (let i = 0; i < grades.length; i++) {
        div.innerHTML +=
          "<i style='background: " + colors[i] + "'></i> " +
          grades[i] + (grades[i + 1] ? "&ndash;" + grades[i + 1] + "<br>" : "+");
      }
      return div;
    };
  
    // Add legend to the map
    legend.addTo(map);
  });