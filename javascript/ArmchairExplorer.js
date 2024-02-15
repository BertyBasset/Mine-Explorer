var mines;
var filteredMines;
var clusterMines;


var tileServers;                    // These are the tile servers that we can use to display the map. A layer is create for each one, and they are added to the map as required
var availableLayers = [];
var currentLayers = [];
var map;


var osLayers = [];

var keys;
var isCrs = false;
var mapCenter;

var mapOptionsCrs;
var mapOptionsNonCrs;
var tileServers;
var mapLayers

// Entry Point
document.addEventListener("DOMContentLoaded", async function() {
    await fetchToken();


    await fetch("https://www.buddlepit.co.uk/api/init.php?key=4f30f5b6-9c1e-4e29-a56a-0b4c5d841f3c")
    .then(response => response.json())
    .then(body => {
        keys = body;
        



        // Data Objects - Map Options, Tile Servers, Map Layers

        // Map object options These two sets of options are required to use the OS maps, which are in a different projection to the standard web maps
        mapOptionsCrs = {
            crs: new L.Proj.CRS('EPSG:27700', '+proj=tmerc +lat_0=49 +lon_0=-2 +k=0.9996012717 +x_0=400000 +y_0=-100000 +ellps=airy +towgs84=446.448,-125.157,542.06,0.15,0.247,0.842,-20.489 +units=m +no_defs', {
                resolutions: [ 896.0, 448.0, 224.0, 112.0, 56.0, 28.0, 14.0, 7.0, 3.5, 1.75 ],
                origin: [ -238375.0, 1376256.0 ]
            }),
            minZoom: 0,
            maxZoom: 13,
            center: [51.5,0],
            zoom: 6,
            maxBounds: [
                [49.5,-11],
                [61.2, 5]
            ],
            attributionControl: true,
            zoomControl: false
        };
        mapOptionsNonCrs = {
            minZoom: 6,
            maxZoom: 18,
            center: [52.5,-1.5],
            zoom: 13,
            zoomControl: false,
            maxBounds: [
                [49.5,-11],
                [61.2, 5]
            ],
            attributionControl: true
        };



        tileServers = [
            {
                name: "British Isles - OpenStreetMap",
                url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
                options: {
                    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                    minZoom: 6,
                    maxZoom: 16,            

                },
                isCrs: false,
                addOriginHeader: false,
                maxBounds: [
                    [49.5,-9.7],
                    [61.2, 5]
                ],        
            }
            
            ,
            {
                name: "British Isles - Satellite",
                url: `https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=${keys[0]}`,
                options: {
                    id: "mapbox.satellite",
                    attribution: '&copy; <a href="https://www.mapbox.com/about/maps/">Mapbox</a> &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> <strong><a href="https://www.mapbox.com/map-feedback/" target="_blank">Improve this map</a></strong>',
                    minZoom: 6,
                    maxZoom: 16,            
                },
                isCrs: false,
                maxBounds: [
                    [49.5,-9.7],
                    [61.2, 5]
                ],        
            },
            {
                name: "BGS Solid",
                url: "https://map.bgs.ac.uk/arcgis/services/BGS_Detailed_Geology/MapServer/WMSServer?REQUEST=GetMap",
                options: {
                        layers: 'BGS.50k.Bedrock',  // BGS.50k.Superficial.deposits,BGS.50k.Bedrock,BGS.50k.Artificial.ground,BGS.50k.Mass.movement,BGS.50k.Linear.features
                        styles: 'default',
                        format: 'image/gif',
                        transparent: true,
                        version: '1.3.0',
                        attribution: '&copy;<a href="https://www.bgs.ac.uk/">British Geological Survey</a>',
                        minZoom:13,
                        maxZoom:18,
                },
                isCrs: false,
                addOriginHeader: false,
                maxBounds: [
                    [49.5,-9.7],
                    [61.2, 5]
                ],          
            },
            {
                name: "BGS Linear",
                url: "https://map.bgs.ac.uk/arcgis/services/BGS_Detailed_Geology/MapServer/WMSServer?REQUEST=GetMap",
                options: {
                        layers: 'BGS.50k.Linear.features',  // BGS.50k.Superficial.deposits,BGS.50k.Bedrock,BGS.50k.Artificial.ground,BGS.50k.Mass.movement,BGS.50k.Linear.features
                        styles: 'default',
                        format: 'image/gif',
                        transparent: true,
                        version: '1.3.0',
                        minZoom:13,
                        maxZoom:18,                     
                },
                isCrs: false,
                addOriginHeader: false,
                maxBounds: [
                    [49.5,-9.7],
                    [61.2, 5]
                ],    
            },
            {
                name: "GB - OS Road",
                url: `https://api.os.uk/maps/raster/v1/zxy/Road_27700/{z}/{x}/{y}.png`,
                options: { 
                    attribution: `Contains OS data &copy; Crown copyright ${new Date().getFullYear()}.`,
                    minZoom: 0,
                    maxZoom: 9,     

                },

                isCrs: true,
                addOriginHeader: false,
                maxBounds: [
                    [49.5,-9.7],
                    [61.2, 5]
                ],    
            },
            {
                name: "GB - OS Leisure",
                url: `https://api.os.uk/maps/raster/v1/zxy/Leisure_27700/{z}/{x}/{y}.png`,
                options: {
                    attribution: `Contains OS data &copy; Crown copyright ${new Date().getFullYear()}.`  ,
                    minZoom: 0,
                    maxZoom: 9,       
                },        
                isCrs: true,
                addOriginHeader: false,
                maxBounds: [
                    [49.5,-9.7],
                    [61.2, 5]
                ],
            } ,  
            {
                name: "GB - NLS OS 1:63,360 1955-1961",
                url: `https://api.maptiler.com/tiles/uk-osgb63k1955/{z}/{x}/{y}.jpg?key=${keys[1]}`,
                options: { 
                    attribution: '<a href="http://maps.nls.uk/projects/subscription-api/">National Library of Scotland</a> <a href="https://www.maptiler.com" style="position:absolute;left:150px;bottom:18px;z-index:999;"><img src="https://api.maptiler.com/resources/logo.svg" alt="MapTiler logo"></a>',
                    tileSize: 512,
                    zoomOffset: -1,
                    minZoom:6,
                    maxZoom:16,
                    crossOrigin: false
                },
                isCrs: false,
                addOriginHeader: true,
                maxBounds: [
                    [49.5,-9.7],
                    [61.2, 5]
                ],             
            },  
            {
                name: "GB - NLS OS 1:10,560 c1900",
                url: `https://api.maptiler.com/tiles/uk-osgb1888/{z}/{x}/{y}?key=${keys[1]}`,
                options: { 
                    attribution: '<a href="http://maps.nls.uk/projects/subscription-api/">National Library of Scotland</a> <a href="https://www.maptiler.com" style="position:absolute;left:150px;bottom:18px;z-index:999;"><img src="https://api.maptiler.com/resources/logo.svg" alt="MapTiler logo"></a>',            
                    tileSize: 512,
                    zoomOffset: -1,
                    minZoom:6,
                    maxZoom:18,
                    crossOrigin: false
                },
                isCrs: false,
                addOriginHeader: true,
                maxBounds: [
                    [49.5,-9.7],
                    [61.2, 5]
                ],          
            },  
            {
                name: "GB - NLS OS 1:63,360 1885-1903",
                url: `https://api.maptiler.com/tiles/uk-osgb63k1885/{z}/{x}/{y}.png?key=${keys[1]}`,
                options: { 
                    attribution: '<a href="http://maps.nls.uk/projects/subscription-api/">National Library of Scotland</a> <a href="https://www.maptiler.com" style="position:absolute;left:150px;bottom:18px;z-index:999;"><img src="https://api.maptiler.com/resources/logo.svg" alt="MapTiler logo"></a>',            
                    tileSize: 512,
                    zoomOffset: -1,
                    minZoom:6,
                    maxZoom:17,
                    crossOrigin: false
                },
                isCrs: false,
                addOriginHeader: true,
                maxBounds: [
                    [49.5,-9.7],
                    [61.2, 5]
                ],          
            },  
            {
                name: "GB - NLS OS 1:25,000 1937-1961",
                url: `https://api.maptiler.com/tiles/uk-osgb25k1937/{z}/{x}/{y}.jpg?key=${keys[1]}`,
                options: { 
                    attribution: '<a href="http://maps.nls.uk/projects/subscription-api/">National Library of Scotland</a> <a href="https://www.maptiler.com" style="position:absolute;left:150px;bottom:18px;z-index:999;"><img src="https://api.maptiler.com/resources/logo.svg" alt="MapTiler logo"></a>',            
                    tileSize: 512,
                    zoomOffset: -1,
                    minZoom:6,
                    maxZoom:17,
                    crossOrigin: false
                },
                isCrs: false,
                addOriginHeader: true,
                maxBounds: [
                    [49.5,-9.7],
                    [61.2, 5]
                ],          
            },  
            {
                name: "GB - NLS OS 1:10,560 1888-1913",
                url: `https://api.maptiler.com/tiles/uk-osgb10k1888/{z}/{x}/{y}.jpg?key=${keys[1]}`,
                options: { 
                    attribution: '<a href="http://maps.nls.uk/projects/subscription-api/">National Library of Scotland</a> <a href="https://www.maptiler.com" style="position:absolute;left:150px;bottom:18px;z-index:999;"><img src="https://api.maptiler.com/resources/logo.svg" alt="MapTiler logo"></a>',            
                    tileSize: 512,
                    zoomOffset: -1,
                    minZoom:6,
                    maxZoom:18,
                    crossOrigin: false
                },
                isCrs: false,
                addOriginHeader: true,
                maxBounds: [
                    [49.5,-9.7],
                    [61.2, 5]
                ],             
            },  
            {
                name: "GB - NLS OS Historical 1919-1947",
                url: `https://api.maptiler.com/tiles/uk-osgb1919/{z}/{x}/{y}.jpg?key=${keys[1]}`,
                options: { 
                    attribution: '<a href="http://maps.nls.uk/projects/subscription-api/">National Library of Scotland</a> <a href="https://www.maptiler.com" style="position:absolute;left:150px;bottom:18px;z-index:999;"><img src="https://api.maptiler.com/resources/logo.svg" alt="MapTiler logo"></a>',            
                    tileSize: 512,
                    zoomOffset: -1,
                    minZoom:6,
                    maxZoom:15,
                    crossOrigin: false
                },
                isCrs: false ,
                addOriginHeader: true,
                maxBounds: [
                    [49.5,-9.7],
                    [61.2, 5]
                ],               
            } ,  
            {
                name: "Ireland - Bartholomew 1/4\" 1940s",
                url: `https://api.maptiler.com/tiles/uk-baire250k1940/{z}/{x}/{y}.png?key=${keys[1]}`,
                options: { 
                    attribution: '<a href="http://maps.nls.uk/projects/subscription-api/">National Library of Scotland</a> <a href="https://www.maptiler.com" style="position:absolute;left:150px;bottom:18px;z-index:999;"><img src="https://api.maptiler.com/resources/logo.svg" alt="MapTiler logo"></a>',            
                    tileSize: 512,
                    zoomOffset: -1,
                    minZoom:7,
                    maxZoom:13,
                    crossOrigin: false
                },
                isCrs: false,
                addOriginHeader: true,
                maxBounds: [
                    [51.4,-10.5],
                    [55.5, -5.7]
                ],            
            },
            {
                name: "Wales - Lidar",
                url: `https://datamap.gov.wales/geoserver/ows?`,
                options: { 
                    attribution: "<a href='https://datamap.gov.wales'>DataMap Wales</a>",
                    tileSize: 512,
                    continuousWorld: true,
                    version:1.3,
                    format: 'image/png',
                    //       geonode:wales_lidar_dsm_1m_hillshade_cog
                    //       geonode:wales_lidar_dsm_1m_hillshade_multi_cog
                    layers: 'geonode:wales_lidar_dsm_1m_hillshade_cog',
                    minZoom:8,
                    maxZoom:18,
                    transparent: true,
                },
                isCrs: false ,
                addOriginHeader: false,                
                maxBounds: [
                    [51.3,-5.5],
                    [53.4, -2.6]
                ],              
            },  
            {
                name: "England - Lidar",
                url: `https://api.agrimetrics.co.uk/geoservices/datasets/df4e3ec3-315e-48aa-aaaf-b5ae74d7b2bb/wms?`,
                options: { 
                    attribution: "<a href='https://agrimetrics.co.uk'>Agrimetrics</a>",
                    tileSize: 256,
                    continuousWorld: true,
                    version:1.3,
                    format: 'image/png',
                    layers: 'Lidar_Composite_Hillshade_FZ_DSM_1m',
                    transparent: true,
                    minZoom:8,
                    maxZoom:18,            
                },
                isCrs: false  ,
                addOriginHeader: false,                
                    maxBounds: [
                    [49.8,-6.3],
                    [55.8, 2.2]
                ],     
            }
        ];


        mapLayers = [
            {id: "0", name: "British Isles - OpenStreetMap", Layers: [0]},
            {id: "1", name: "British Isles - Satellite", Layers: [1]},
            // What's going on here? Well, 1 layer is solid, and we superimpose the linear features on top of it - so add layers 2 and 3
            {id: "2", name: "GB - Geological (Solid+Linear)", Layers: [2, 3]},
            {id: "3", name: "GB - OS Road", Layers: [4]},
            {id: "4", name: "GB - OS Leisure", Layers: [5]},
            {id: "5", name: "GB - NLS OS 1:63,360 1955-1961", Layers: [6]},
            {id: "6", name: "GB - NLS OS 1:10,560 c1900", Layers: [7]},
            {id: "7", name: "GB - NLS OS 1:63,360 1885-1903", Layers: [8]},
            {id: "8", name: "GB - NLS OS 1:25,000 1937-1961", Layers: [9]},
            {id: "9", name: "GB - NLS OS 1:10,560 1888-1913", Layers: [10]},
            {id: "10", name: "GB - NLS OS Historical 1919-1947", Layers: [11]},
            {id: "11", name: "Ireland - Bartholomew 1/4\" 1940s", Layers: [12]},
            {id: "12", name: "Wales - Lidar", Layers: [13]},
            {id: "13", name: "England - Lidar", Layers: [14]},
        ];





        loadPage();
    })
    .catch(error => console.error('Error fetching data:', error));   
});















function loadPage() {
    // Run after obtaining tokens


    document.getElementById("selMapLayer").addEventListener("change", selectedLayerChanged);

    populateMapLayers(mapLayers);

     //mapOs = L.map('divMap',mapOptionsCrs);
    map = L.map('divMap',mapOptionsNonCrs);
    map.on('zoom', fixZoom);
    map.on('zoomend', function() {
        var currentZoom = map.getZoom();
        var maxZoom = currentLayers[0].options.maxZoom;
        document.getElementById("txtZoom").value =  `Zoom: ${currentZoom}: maxZoom: ${maxZoom}`;

        if(currentZoom ==  maxZoom)
            clusterMines.Cluster.Size = .1;
        else
            clusterMines.Cluster.Size = 6;
        
        


    });

    
    tileServers.forEach(function(tileServer) {
       var layer;
       if(tileServer.isCrs) {
            // This extension comes from leaflet-http-header
            // and allows header to be added to leaflet wms tile request
            layer =  L.TileLayer.wmsHeader(
                tileServer.url,
                tileServer.options,
                [
                    { header: 'Authorization', value: `Bearer ${bearerToken}` }
                ],
                null
            )
            osLayers.push(layer);
        } else 
            layer = L.tileLayer.wms(tileServer.url, tileServer.options);

        availableLayers.push(layer);

    });


    showLayers([0]);            // Dfault to showing the first layer - OpenStreetView
    getAllMines();
    populateFilterDropdowns() ;
    stopMouseEventPropogation();
}


function showLayers(layerIndices) {
    // Store current center and zoom level
    mapCenter = map.getCenter();
    mapZoom = map.getZoom();

    // If a layer changes projection, we need to change the map
    if (isCrs != tileServers[layerIndices[0]].isCrs) {
        var newMapOptions = tileServers[layerIndices[0]].isCrs ? mapOptionsCrs : mapOptionsNonCrs;
        newMapOptions.center = mapCenter;
       
        map.remove();
        map = L.map('divMap', newMapOptions)
        map.on('zoom', fixZoom);
        map.on('zoomend', function() {
            var currentZoom = map.getZoom();
            var maxZoom = currentLayers[0].options.maxZoom;
            document.getElementById("txtZoom").value =  `Zoom: ${currentZoom}: maxZoom: ${maxZoom}`;

            if(currentZoom ==  maxZoom)
            clusterMines.Cluster.Size = .1;
        else
            clusterMines.Cluster.Size = 6;            

        });

        isCrs = tileServers[layerIndices[0]].isCrs;

        if(isCrs)
            map.setView(mapCenter, mapZoom-6);
        else
            map.setView(mapCenter, mapZoom+6);

        map.addLayer(clusterMines);
    }
    

    for (var i = 0; i < currentLayers.length; i++) {
        map.removeLayer(currentLayers[i]);
    }

    currentLayers = [];
    layerIndices.forEach(function(index) {
        var layer = availableLayers[index];
        map.addLayer(layer);
        currentLayers.push(layer);


        // Auto Zoom and Center if we have changed layers and the new layer has different zoom or center bounds
        // if we have changed layers, check current zoom level is within range, otherwise set to min or max for the new layer
        if(map.getZoom() > tileServers[layerIndices[0]].options.maxZoom) {
            map.setZoom(tileServers[layerIndices[0]].options.maxZoom);
        }
        if(map.getZoom() < tileServers[layerIndices[0]].options.minZoom) {
            map.setZoom(tileServers[layerIndices[0]].options.minZoom);
        }

        // If we have changed layers, check current center is within range of the layer's bounds, otherwise set to middle of the bounds
        var minLat = tileServers[layerIndices[0]].maxBounds[0][0];
        var minLon = tileServers[layerIndices[0]].maxBounds[0][1];
        var maxLat = tileServers[layerIndices[0]].maxBounds[1][0];
        var maxLon = tileServers[layerIndices[0]].maxBounds[1][1];

        mapCenter = map.getCenter();
        if((mapCenter.lat < minLat || mapCenter.lat > maxLat) || (mapCenter.lng < minLon || mapCenter.lng > maxLon)) {
            var newCenter = [minLat + (maxLat - minLat)/2, minLon + (maxLon - minLon)/2];
            map.setView(newCenter);
        }
    });
}



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

function getAllMines() {

    fetch(`https://www.buddlepit.co.uk/api/getAllMines.php?s`)
        .then(response => response.json())
        .then(data => {
            mines = data;
            // Clone the array - later we will create it by filtering the original mines array
            filteredMines  =  [...mines];
            populateClusterFromFilteredMines();
         })
        .catch(error => {
            alert(error);
            console.error('Error loading all mines:', error);
        });
}

function populateFilterDropdowns() {
    populateDropdown("selArea", "https://www.buddlepit.co.uk/api/getAreaList.php", "Name");
    populateDropdown("selSiteType", "https://www.buddlepit.co.uk/api/getSiteTypeList.php", "Description");
    populateDropdown("selProduct", "https://www.buddlepit.co.uk/api/getProductList.php", "Name");

}


function populateDropdown(dropdownId, url, bindToProperty) {
    fetch(url)
        .then(response => response.json())
        .then(data => {
            const dropdown = document.getElementById(dropdownId);

            lastProductPrimary = true;
            data.forEach(item => {
                // Add ----------- to Products between Primary and Secondary products
                if(dropdownId == "selProduct") {
                    if(!item.IsPrimary && lastProductPrimary) {
                        const option = document.createElement('option');
                        option.value = "";
                        option.innerText = "-------------------------------";
                        dropdown.appendChild(option);
                    }
                    lastProductPrimary = item.IsPrimary;
                }


                const option = document.createElement('option');
                if(dropdownId == "os-sheet")
                    option.value = item.Sheet;
                else
                    option.value = item.ID;
                option.innerText = item[bindToProperty];
                dropdown.appendChild(option);
            });
        })
        .catch(error => console.error('Error fetching data:', error)
    );
}


function chkMines_CheckedChange(checked) {
    if(checked)  {
        map.addLayer(clusterMines);
        map.fitBounds(clusterBounds);
    } else
       map.removeLayer(clusterMines);
}   

var clusterBounds = L.latLngBounds();       // Bounds of markers - so we can change map view to fit them all in
function populateClusterFromFilteredMines() {
    
    if(clusterMines != null )
        map.removeLayer(clusterMines);


    clusterMines = new PruneClusterForLeaflet();
    
    // Maybe change this with zoom level??
    
    clusterMines.Cluster.Size = 6;




    clusterBounds = L.latLngBounds();
    for(mine of filteredMines) {
        var marker = new PruneCluster.Marker(mine.Lat, mine.Long);
        marker.color = 'red';
        marker.data.name = mine.Name;
        marker.data.products = mine.Products;
        marker.data.id = mine.ID;

        clusterMines.RegisterMarker(marker);
        clusterBounds.extend([mine.Lat, mine.Long]);        // Update bounds of cluster
    }


    // It appears that the pruncluster marker has become a leaflet marker by the time it gets in here, so we can use leaflet methods on it
    clusterMines.PrepareLeafletMarker = function (marker, data) {
        if(data.products == null)
            marker.bindTooltip(`<b>${data.name}</b>`);
        else
            marker.bindTooltip(`<b>${data.name}</b><br />${data.products.map(product => product.Product).join(', ')}`);

        marker.on('click', function() {
            window.open(`./MineDetails.html?id=${btoa(data.id)}`, "_blank");
        });
        
    };
    map.addLayer(clusterMines);

    if(document.getElementById("chkAutofit").checked)
        map.fitBounds(clusterBounds);

}



function fixZoom() {
    var currentZoom = map.getZoom();
    var minZoom = currentLayers[0].options.minZoom;
    var maxZoom = currentLayers[0].options.maxZoom;

    // Adjust the zoom level if it goes beyond the minZoom or maxZoom
    if (currentZoom < minZoom) {
        map.setZoom(minZoom);
    } else if (currentZoom > maxZoom) {
        map.setZoom(maxZoom);
    }
}

var filterOpen = false;
function toggleFilterDisplay() {
    filterOpen = !filterOpen;
    if (filterOpen) {
        document.getElementById("divFilter").style.visibility = "visible";
        document.getElementById("divFilter").style.width = "600px";
        document.getElementById("divFilter").style.height = "320px";
        document.getElementById("txtName").focus();
        document.getElementById("txtName").select();
        document.getElementById("imgIcon").src = "./open-iconic/svg/chevron-left.svg";
    } else {
        document.getElementById("divFilter").style.visibility = "hidden";
        document.getElementById("imgIcon").src = "./open-iconic/svg/chevron-right.svg";
        document.getElementById("divFilter").style.width = "30px";
        document.getElementById("divFilter").style.height = "30px";

    }
}

var isFiltering = false;

function applyFilter() {
    if(!validateFilters()) return;

    isFiltering = true;
    document.getElementById("btnRemoveFilter").disabled =false;
    document.getElementById("txtName").focus();
    document.getElementById("txtName").select();

    // Get the values of the filter fields
    var isCrow = document.getElementById("chkIsCrow").checked;
    var hasDecription = document.getElementById("chkHasTextFields").checked;
    var hasLinks = document.getElementById("chkHasLinks").checked;
    var hasPublication = document.getElementById("chkHasReferences").checked;
    var nameSearch = document.getElementById("txtName").value.trim();
    var descSearch = document.getElementById("txtFreeText").value.trim();
    var areaId = document.getElementById("selArea").value;
    var siteTypeId = document.getElementById("selSiteType").value;
    var productId = document.getElementById("selProduct").value;


    filteredMines = mines.filter(function(item) {
        // Check if the item meets the criteria
        return (
            (isCrow === false || item.IsCrow === isCrow) &&
            (hasDecription === false || item.HasDesc === hasDecription) &&
            (hasLinks === false || item.HasLinks === hasLinks) &&
            (hasPublication === false || item.HasPub === hasPublication) &&
            (siteTypeId === '' || item.SiteTypeID == siteTypeId) &&
            (areaId === '' || item.AreaID == areaId) &&

            (productId === '' || item.Products && item.Products.some(function(product) {
                return product.ID == productId;
            })) &&
            (nameSearch === '' || nameSearch === 'search' || item.Name.toLowerCase().includes(nameSearch.toLowerCase()) ||
                item.Names && item.Names.some(function(name) {
                    return name.Name.toLowerCase().includes(nameSearch.toLowerCase());
                })) &&
            (descSearch === '' || descSearch === 'desc' || item.Desc.toLowerCase().includes(descSearch.toLowerCase()))
        );
    });
    
    if(filteredMines.length == 0) { 
        alert("No mines found that match the criteria");
        return;
    }



 

    // Need to rebind the cluster to the filtered mines ?
    populateClusterFromFilteredMines();



    document.getElementById("chkShowMines").checked = true;

}




function removeFilter() {
    isFiltering = false;
    document.getElementById("txtFreeText").value = "";
    document.getElementById("txtName").value = "";
    document.getElementById("selArea").value = "";   
    document.getElementById("selSiteType").value = "";
    document.getElementById("selProduct").value = "";
    document.getElementById("chkIsCrow").checked = false;
    document.getElementById("chkHasTextFields").checked = false;
    document.getElementById("chkHasLinks").checked = false;
    document.getElementById("chkHasReferences").checked = false;
    document.getElementById("btnRemoveFilter").disabled =true;
    document.getElementById("txtName").focus();

    // Remove filter - clone the original mines array
    filteredMines  =  [...mines];

    // Need to rebind the cluster to the filtered mines ?

    populateClusterFromFilteredMines();
    if(document.getElementById("chkAutofit").checked)
        map.fitBounds(clusterBounds);
}

function validateFilters() {
    if(
           document.getElementById("txtName").value.trim() == ""
        && document.getElementById("txtFreeText").value.trim() == ""
        && document.getElementById("selArea").value == ""   
        && document.getElementById("selSiteType").value == ""
        && document.getElementById("selProduct").value == ""
        && document.getElementById("chkIsCrow").checked == false
        && document.getElementById("chkHasTextFields").checked == false
        && document.getElementById("chkHasLinks").checked == false 
        && document.getElementById("chkHasReferences").checked == false) {
            alert("Please enter at least one filter");
            document.getElementById("txtName").focus();
            document.getElementById("txtName").select();
            return false;
        }

    return true;
}

function stopMouseEventPropogation() {
    stopMouseEventPropogationForId("divFilter");
    stopMouseEventPropogationForId("selMapLayer");
    stopMouseEventPropogationForId("chkShowMines");
    stopMouseEventPropogationForId("btnFilter");
}

function stopMouseEventPropogationForId(id) {
    document.getElementById(id).addEventListener("mousedown", function(e) {
        e.stopPropagation();
    }, { passive: true });
    document.getElementById(id).addEventListener("mousemove", function(e) {
        e.stopPropagation();
    }, { passive: true });    
    document.getElementById(id).addEventListener("mouseup", function(e) {
        e.stopPropagation();
    }, { passive: true });
    document.getElementById(id).addEventListener("click", function(e) {
        e.stopPropagation();
    }, { passive: true });
    document.getElementById(id).addEventListener("dblclick", function(e) {
        e.stopPropagation();
    }, { passive: true });
    document.getElementById(id).addEventListener("wheel", function(e) {
        e.stopPropagation();
    }, { passive: true });


    
}











// OS Map OAuth Stuff
var bearerToken;                    // This should always be the latest valid access token
let tokenExpirationTime;
const tokenRenewalThreshold = 60 * 1000; // Renew token 1 minute before expiry (in milliseconds)

// Make these function async so that we can await the fetchToken function and 
// ensure the token is fetched before getting the map

async function fetchToken() {
    // Make a request to your PHP script to fetch the access token from the OS Maps API
    // Update the bearerToken variable with the fetched token
    // Update the tokenExpirationTime variable with the expiration time
    
    await fetch(`https://www.buddlepit.co.uk/api/getBearerToken.php`)
    .then(response => response.json())
    .then(data => {

        bearerToken = data.access_token; // Placeholder for the fetched access token
        tokenExpirationTime = Date.now() + (data.expires_in * 1000); // Convert expires_in to milliseconds and add to current time        
        console.log(`Token fetched: ${bearerToken}, expires in: ${data.expires_in} seconds, at: ${new Date(tokenExpirationTime).toLocaleString()}`);

        for(var l of osLayers) {
            //console.log(JSON.stringify(l));

            l.headers = [{ header: 'Authorization', value: 'Bearer ' + bearerToken }];
                //console.log(`Token added to map layer${l.url}`);
           // console.log(JSON.stringify(l));
        }


        

        

    })
    .catch(error => {
        console.error('Error:', error);
        
    });

    // Calculate the time until token expiration
    const timeUntilExpiry = tokenExpirationTime - Date.now();
    var t = timeUntilExpiry - tokenRenewalThreshold;

    console.log(`timeout set for ${t/1000}s`);
    setTimeout(fetchToken, t);
}

