// Store our API endpoint inside queryUrl
var earthquake_url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Perform a GET request to the earthquake_url 
d3.json(earthquake_url, function(data) {
  // Once we get a response, send the data.features object to the createFeatures function
  createFeatures(data.features);
});

function createFeatures(earthquakeData) {


  // Create a GeoJSON layer containing the features array on the earthquakeData object
  // Run the onEachFeature function once for each piece of data in the array
  var earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: function(feature,layer){
      layer.bindPopup("<h3> Location:" + feature.properties.place +
      "</h3> <h3> Magnitude:" + feature.properties.mag +
      "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
    },

    pointToLayer: function(feature, latlng){
      return new L.circle(latlng,
      { radius: dataMarker(feature.properties.mag),
        fillColor: dataColor(feature.properties.mag),
        fillOpacity: .8,
        color: 'grey',
        stroke: true,
        weight: .5
      })
    }    

  });

  // Sending our earthquakes layer to the createMap function
  createMap(earthquakes);
}


// Scale the data marker circle based on magnitude
function dataMarker(magnitude) {
  return magnitude * 20000;
};

// Color the data marker circle based on magnitude
function dataColor(magnitude) {

  if (magnitude > 4) {
    color = "red";
  } else if (magnitude > 3){
    color = "green";
  } else if (magnitude > 2){
    color = "yellowgreen";
  } else if (magnitude > 1){
  color = "orange";
  }
  else {
    color = "yellow";
  }    

  return color

};

function createMap(earthquakes) {

  // Define streetmap and darkmap layers
  var streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/256/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 14,
    id: "mapbox.streets",
    accessToken: API_KEY
  });

  // Define streetmap and darkmap layers
  var outdoors = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/outdoors-v10/tiles/256/{z}/{x}/{y}?access_token={accessToken}", {
      attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
      maxZoom: 14,
      id: "mapbox.streets",
      accessToken: API_KEY
  });

  var darkmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.dark",
    accessToken: API_KEY
  });

  // Define a baseMaps object to hold our base layers
  var baseMaps = {
    "Outdoors": outdoors,
    "Satellite": streetmap,
    "Dark Map": darkmap
  };

  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    Earthquakes: earthquakes
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load
  var myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 4,
    layers: [streetmap, earthquakes]
  });

  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

    // Create a legend to display information in the top left
    var legend = L.control({position: 'topleft'});

    legend.onAdd = function(map) {
  
      var div = L.DomUtil.create('div','info legend'),
          magnitudes = [0,1,2,3,4],
          labels = [];

      div.innerHTML += "<h4 style='margin:4px;text-align:center'>Earthquake Magnitude</h4>" 

      for (var i=0; i < magnitudes.length; i++){
        div.innerHTML +=
          '<hr><i style="background:' + dataColor(magnitudes[i] + 1) + '"></i> ' +
          magnitudes[i] + (magnitudes[i+1]?'&ndash;' + magnitudes[i+1] +'<br>': '+');
        }
        return div;
    };
    legend.addTo(myMap);
}
