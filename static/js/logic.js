// set URL for USGS earthquake data feed in GeoJSON format
let url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson"; // past 30 days feed

// request data from URL and execute callback function once loaded
d3.json(url).then(function (data) {
	// Base Maps Layers:
	//
	// create base map layer
	let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
		attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
	});

	// create topographic view layer
	let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
		attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
	});

	// Function to set marker style:
	function getMarkerStyle(magnitude, depth) {
		let radius = magnitude * 4; // size scaling factor
		let color = depth >= 90.0 ? '#ff5f65' :
								depth >= 70.0 ? '#fca35d' :
								depth >= 50.0 ? '#fdb72a' :
								depth >= 30.0 ? '#f7db11' :
								depth >= 10.0 ? '#dcf400' :
								'#a3f600';
		return {
			radius: radius,
			fillColor: color,
			color: "#000",
      weight: 1,
      opacity: 1,
      fillOpacity: 0.8
		};
	};

	// Create a baseMaps object to store the two map layers with friendly names
	let baseMaps = {
		"Street Map": street,
		"Topographic Map": topo
	};

	// Process earthquake data:
	//
	// array to hold GeoJSON layers for Leaflet for each earthquake
	let features_array = [];

	// loop data object for 'data.features' content
	for (let i = 0; i < data.features.length; i++) {
		// set marker style
		let magnitude = data.features[i].properties.mag;
		let depth = data.features[i].geometry.coordinates[2];
		let markerStyle = getMarkerStyle(magnitude, depth);

		// create a new Leaflet geoJSON layer, and attach a popup with more info
		//feature = L.geoJSON(data.features[i]).bindPopup(`<h1>${data.features[i].properties.place}</h1><h3>Magnitude ${data.features[i].properties.mag}</h3>`);
		let lon = data.features[i].geometry.coordinates[0];
		let lat = data.features[i].geometry.coordinates[1];
		let datetime = new Date(data.features[i].properties.time);

		let feature = L.circleMarker(
			[lat, lon],
			markerStyle
		)
		.bindPopup(`
			<h3>${data.features[i].properties.place}</h3>
			<hr>
			Magnitude: ${magnitude}<br>
			Depth: ${depth}<br>
			Coordinates: ${lat.toFixed(2)}, ${lon.toFixed(2)}
			<br><br>
			Observed:<br>${datetime}
		`);

		// add new layer to features_array
		features_array.push(feature);
	};

	// create a layer group for the earthquake markers
	let features_group = L.layerGroup(features_array);

	// Overlay map:
	//
	// create an object to hold the earthquake layer group for toggle on/off
	let overlayMaps = {
		Earthquakes: features_group
	};

	// Create Leaflet map:
	//
	// add leaflet map to 'map' div in index.html
	let myMap = L.map("map", {
		center: [
			40.00, -115.00
		],
		zoom: 6,
		layers: [street, features_group]
	});

	L.control.layers(baseMaps, overlayMaps, {
		collapsed: false
	}).addTo(myMap);

	// Legend
	//
	// Set position of legend
	let legend = L.control({
		position: 'bottomright'
	});

	legend.onAdd = function() {
    let div = L.DomUtil.create('div', 'legend');

    // Legend content (customize this)
    div.innerHTML += '<h4>Earthquake Depth</h4>';
    div.innerHTML += '<i style="background:#a3f600"></i> -10-10<br>';
    div.innerHTML += '<i style="background:#dcf400"></i> 10-30<br>';
    div.innerHTML += '<i style="background:#f7db11"></i> 30-50<br>';
    div.innerHTML += '<i style="background:#fdb72a"></i> 50-70<br>';
    div.innerHTML += '<i style="background:#fca35d"></i> 70-90<br>';
    div.innerHTML += '<i style="background:#ff5f65"></i> 90+';

    return div;
	};

	legend.addTo(myMap); // Add the legend to the map

	// Stylize the legend
	var legendCSS = `
		.legend {
			padding: 6px 8px;
			background: white;
			box-shadow: 0 0 15px rgba(0,0,0,0.2);
			border-radius: 5px;
		}
		.legend i {
			width: 18px;
			height: 18px;
			float: left;
			margin-right: 8px;
			opacity: 0.7;
		}
	`;

	// Create a style element and add the CSS
	var style = document.createElement('style');
	style.innerHTML = legendCSS;
	document.head.appendChild(style);
});

