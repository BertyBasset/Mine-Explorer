var API_KEY_MAPBOX = "pk.eyJ1IjoiYmVydHliYXNzZXQiLCJhIjoiY2l3M3J6Zng2MDAxMjJ5cDY3OGR4aWxtdiJ9.Bpd5wLT-J_jIQLAenzZliQ";
var API_KEY_OS = "9GbhH3gT4I4yfbXaj3aEOiC1GtOWpMJH";
var API_KEY_MAPTILER = "6UgoRH2zaorsOhuy5tOv";


//These two sets of options are required to use the OS maps, which are in a different projection to the standard web maps
const mapOptionsCrs = {
    crs: new L.Proj.CRS('EPSG:27700', '+proj=tmerc +lat_0=49 +lon_0=-2 +k=0.9996012717 +x_0=400000 +y_0=-100000 +ellps=airy +towgs84=446.448,-125.157,542.06,0.15,0.247,0.842,-20.489 +units=m +no_defs', {
        resolutions: [ 896.0, 448.0, 224.0, 112.0, 56.0, 28.0, 14.0, 7.0, 3.5, 1.75 ],
        origin: [ -238375.0, 1376256.0 ]
    }),
    minZoom: 0,
    maxZoom: 13,
    center: [51.5,0],
    zoom: 6,
    maxBounds: [
        [49.5,-9.7],
        [61.2, 5]
    ],
    attributionControl: false,
    zoomControl: false
};
const mapOptionsNonCrs = {
    minZoom: 6,
    maxZoom: 18,
    center: [51.5,0],
    zoom: 13,
    zoomControl: false,
    maxBounds: [
        [49.5,-9.7],
        [61.2, 5]
    ],
    attributionControl: false
};


var tileServers = [
    {
        name: "Road",
        url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
        options: {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'

        },
        isCrs: false
    },
    {
        name: "Satellite",
        url: "https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=" + API_KEY_MAPBOX,
        options: {
            id: "mapbox.satellite"
        },
        isCrs: false
    },
    {
        name: "BGS Solid",
        url: "https://map.bgs.ac.uk/arcgis/services/BGS_Detailed_Geology/MapServer/WMSServer?REQUEST=GetMap",
        options: {
                layers: 'BGS.50k.Bedrock',  // BGS.50k.Superficial.deposits,BGS.50k.Bedrock,BGS.50k.Artificial.ground,BGS.50k.Mass.movement,BGS.50k.Linear.features
                styles: 'default',
                format: 'image/gif',
                transparent: true,
                version: '1.3.0'
        },
        isCrs: false
    },
    {
        name: "BGS Linear",
        url: "https://map.bgs.ac.uk/arcgis/services/BGS_Detailed_Geology/MapServer/WMSServer?REQUEST=GetMap",
        options: {
                layers: 'BGS.50k.Linear.features',  // BGS.50k.Superficial.deposits,BGS.50k.Bedrock,BGS.50k.Artificial.ground,BGS.50k.Mass.movement,BGS.50k.Linear.features
                styles: 'default',
                format: 'image/gif',
                transparent: true,
                version: '1.3.0'
        },
        isCrs: false
    },
    {
        name: "OS Road",
        url: `https://api.os.uk/maps/raster/v1/zxy/Road_27700/{z}/{x}/{y}.png?key=${API_KEY_OS}`,
        options: {        },
        isCrs: true
    },
    {
        name: "OS Leisure",
        url: `https://api.os.uk/maps/raster/v1/zxy/Leisure_27700/{z}/{x}/{y}.png?key=${API_KEY_OS}`,
        options: {        },
        isCrs: true
    } ,  
    {
        name: "NLS OS 1:63,360 1955-1961",
        url: `https://api.maptiler.com/tiles/uk-osgb63k1955/{z}/{x}/{y}.jpg?key=${API_KEY_MAPTILER}`,
        options: { 
            tileSize: 512,
            zoomOffset: -1,
            minZoom: 1,
            attribution: "National Library of Scotland 1955 map data &copy; <a href='https://maps.nls.uk/projects/api/'>National Library of Scotland</a>",
            crossOrigin: false
        },
        isCrs: false
    },  
    {
        name: "NLS 1:10,560 OS c1900",
        url: `https://api.maptiler.com/tiles/uk-osgb1888/{z}/{x}/{y}?key=${API_KEY_MAPTILER}`,
        options: { 
            tileSize: 512,
            zoomOffset: -1,
            minZoom: 1,
            attribution: "National Library of Scotland 1955 map data &copy; <a href='https://maps.nls.uk/projects/api/'>National Library of Scotland</a>",
            crossOrigin: false
        },
        isCrs: false
    },  
    {
        name: "NLS OS 1:63,360 1885-1903",
        url: `https://api.maptiler.com/tiles/uk-osgb63k1885/{z}/{x}/{y}.png?key=${API_KEY_MAPTILER}`,
        options: { 
            tileSize: 512,
            zoomOffset: -1,
            minZoom: 1,
            attribution: "National Library of Scotland 1955 map data &copy; <a href='https://maps.nls.uk/projects/api/'>National Library of Scotland</a>",
            crossOrigin: false
        },
        isCrs: false
    },  
    {
        name: "NLS OS 1:25,000 1937-1961",
        url: `https://api.maptiler.com/tiles/uk-osgb25k1937/{z}/{x}/{y}.jpg?key=${API_KEY_MAPTILER}`,
        options: { 
            tileSize: 512,
            zoomOffset: -1,
            minZoom: 1,
            attribution: "National Library of Scotland 1955 map data &copy; <a href='https://maps.nls.uk/projects/api/'>National Library of Scotland</a>",
            crossOrigin: false
        },
        isCrs: false
    },  
    {
        name: "NLS OS 1:10,560 1888-1913",
        url: `https://api.maptiler.com/tiles/uk-osgb10k1888/{z}/{x}/{y}.jpg?key=${API_KEY_MAPTILER}`,
        options: { 
            tileSize: 512,
            zoomOffset: -1,
            minZoom: 1,
            attribution: "National Library of Scotland 1955 map data &copy; <a href='https://maps.nls.uk/projects/api/'>National Library of Scotland</a>",
            crossOrigin: false
        },
        isCrs: false     
    },  
    {
        name: "NLS OS Historical 1919-1947",
        url: `https://api.maptiler.com/tiles/uk-osgb1919/{z}/{x}/{y}.jpg?key=${API_KEY_MAPTILER}`,
        options: { 
            tileSize: 512,
            zoomOffset: -1,
            minZoom: 1,
            attribution: "National Library of Scotland 1955 map data &copy; <a href='https://maps.nls.uk/projects/api/'>National Library of Scotland</a>",
            crossOrigin: false
        },
        isCrs: false     
    } ,  
    {
        name: "NLS OS London 1:1,056 1893-1896",
        url: `https://api.maptiler.com/tiles/uk-oslondon1k1893/{z}/{x}/{y}.jpg?key=${API_KEY_MAPTILER}`,
        options: { 
            tileSize: 512,
            zoomOffset: -1,
            minZoom: 1,
            attribution: "National Library of Scotland 1955 map data &copy; <a href='https://maps.nls.uk/projects/api/'>National Library of Scotland</a>",
            crossOrigin: false
        },
        isCrs: false     
    }     
];






var availableLayers = [];
var currentLayers = [];
var map;
var mapOs;
document.addEventListener("DOMContentLoaded", function() {
    document.getElementById("selMapLayer").addEventListener("change", selectedLayerChanged);

    populateMapLayers(mapLayers);

     //mapOs = L.map('divMap',mapOptionsCrs);
     map = L.map('divMap',mapOptionsNonCrs);

    tileServers.forEach(function(tileServer) {
        var layer = L.tileLayer.wms(tileServer.url, tileServer.options);
        availableLayers.push(layer);

    });

    showLayers([0]);

});


function showLayers(layerIndices) {
    if(tileServers[layerIndices[0]].isCrs) {
        map.remove();
        map = L.map('divMap',mapOptionsCrs);
    } else {
        map.remove();
        map = L.map('divMap',mapOptionsNonCrs);
    }


    for (var i = 0; i < currentLayers.length; i++) {
        map.removeLayer(currentLayers[i]);
    }

    currentLayers = [];
    layerIndices.forEach(function(index) {
        var layer = availableLayers[index];
        map.addLayer(layer);
        currentLayers.push(layer);
    });
}   



var mapLayers = [
    {id: "0", name: "OpenStreetMap", Layers: [0]},
    {id: "1", name: "Satellite", Layers: [1]},
    // What's going on here? Well, 1 layer is solid, and we superimpose the linear features on top of it
    {id: "2", name: "Geological Survey", Layers: [2, 3]},
    {id: "3", name: "OS Road", Layers: [4]},
    {id: "4", name: "OS Leisure", Layers: [5]},
    {id: "5", name: "NLS OS 1:63,360 1955-1961", Layers: [6]},
    {id: "6", name: "NLS OS 1:10,560 c1900", Layers: [7]},
    {id: "7", name: "NLS OS 1:63,360 1885-1903", Layers: [8]},
    {id: "8", name: "NLS OS 1:25,000 1937-1961", Layers: [9]},
    {id: "9", name: "NLS OS 1:10,560 1888-1913", Layers: [10]},
    {id: "10", name: "NLS OS Historical 1919-1947", Layers: [11]},
    {id: "11", name: "NLS OS London 1:1,056 1893-1896", Layers: [12]},

    
    
];

function populateMapLayers(mapLayers) {
    var select = document.getElementById("selMapLayer");
    mapLayers.forEach(function(mapLayer) {
        var option = document.createElement("option");
        option.text = mapLayer.name;
        option.value = mapLayer.id;
        select.add(option);
    });
}


   
   
function selectedLayerChanged() {   
    var index = this.value;
    showLayers(mapLayers[index].Layers);
}