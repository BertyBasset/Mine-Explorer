
<!DOCTYPE html>
<html>

<!-- OS map for use with NWCRO Google map - Dave Linton 2024 -->

<head>

<title>OS Map</title>
<meta charset="utf-8" />
<meta name="referrer" content="strict-origin-when-cross-origin" />
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
<link rel="stylesheet" href="https://labs.os.uk/public/os-api-branding/v0.2.0/os-api-branding.css" />
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" />
<style>
	body { margin:0; padding:0; }
	#map { position:absolute; top:0; bottom:0; width:100%; }
</style>

</head>

<body>

<div id="map"></div>

<script src="https://labs.os.uk/public/os-api-branding/v0.2.0/os-api-branding.js"></script>
<script src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/proj4js/2.5.0/proj4.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/proj4leaflet/1.0.2/proj4leaflet.min.js"></script>
<script>

// Setup the EPSG:27700 (British National Grid) projection.

const crs = new L.Proj.CRS('EPSG:27700', '+proj=tmerc +lat_0=49 +lon_0=-2 +k=0.9996012717 +x_0=400000 +y_0=-100000 +ellps=airy +towgs84=446.448,-125.157,542.06,0.15,0.247,0.842,-20.489 +units=m +no_defs', {
	resolutions: [ 896.0, 448.0, 224.0, 112.0, 56.0, 28.0, 14.0, 7.0, 3.5, 1.75, 0.875, 0.4375, 0.21875, 0.109375 ],
	origin: [ -238375.0, 1376256.0 ]
});

const x = (new URLSearchParams(window.location.search)).get('X');

// Set location for map centre and marker

const easting  = Number(x.substr(0, 6));
const northing = Number(x.substr(6, 6));
const siteLocation = proj4('EPSG:27700', 'EPSG:4326', [easting, northing]).reverse();  // convert bng to latLng

// Instantiate a tile layer objects for Leisure style at zoom levels 0-9, Road style at zoom levels 10-13

const serviceUrl = 'https://api.os.uk/maps/raster/v1/zxy';
const key = '***** replace this string with your OS key *****';
const leisure = L.tileLayer(serviceUrl + '/Leisure_27700/{z}/{x}/{y}.png?key=' + key, { maxZoom: 9 });
const road    = L.tileLayer(serviceUrl + '/Road_27700/{z}/{x}/{y}.png?key='    + key, { minZoom: 10 });

// Initialize the map

const mapOptions =
	{
	crs: crs,
	layers:  [ leisure, road ],
	minZoom: 0,
	maxZoom: 13,
	center:  siteLocation,
	zoom:    9,  // largest zoom for 1:25,000 style
	attributionControl: false
	};

const map = L.map('map', mapOptions);

// Place marker

const markers = L.layerGroup().addTo(map);

const marker = L.icon({
	iconUrl:     'x.svg',
	iconAnchor:  [12, 48],
	popupAnchor: [3, -18]
	});

const hoverText = 'your hover text goes here';  //  ... or get some text from URL parameters
const popupText = 'your popup text goes here';  //  ... or get some text from URL parameters
markers.addLayer(L.marker(siteLocation, {icon: marker, title: hoverText}).bindPopup(popupText).openPopup().addTo(map));
	
</script>

</body>
</html>