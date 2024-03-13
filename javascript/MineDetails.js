var id;


document.addEventListener("DOMContentLoaded", async function() {
    await fetchToken();
    loadPage();
});


function loadPage() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const encryptedId = urlParams.get('id');
        id = atob(encryptedId);                 // Put off the most casual of user from changing the URL
    } catch (error) {                          
        alert('Invalid Mine ID');
        return;
    }

    fetch(`https://www.buddlepit.co.uk/api/getMineDetails.php?MineID=${id}`)
        .then(response => response.json())
        .then(data => {
            populateMineDetails(data);
        })
        .catch(error => {
            console.error('Error:', error);
        });
}



// Mapping Stuff
var centreLatLong;
var map;
var tileServer;
var displayLayer;
function addMap(mine) { 
    centreLatLong  =[parseFloat(mine.Lat), parseFloat(mine.Long)];


    // Projection Info for OS
    const mapOptionsCrs = {
        crs: new L.Proj.CRS('EPSG:27700', '+proj=tmerc +lat_0=49 +lon_0=-2 +k=0.9996012717 +x_0=400000 +y_0=-100000 +ellps=airy +towgs84=446.448,-125.157,542.06,0.15,0.247,0.842,-20.489 +units=m +no_defs', {
            resolutions: [ 896.0, 448.0, 224.0, 112.0, 56.0, 28.0, 14.0, 7.0, 3.5, 1.75 ],
            origin: [ -238375.0, 1376256.0 ]
        }),
        minZoom: 4,
        maxZoom: 10,
        center: [51.5,0],
        zoom: 9,
        maxBounds: [
            [49.5,-11],
            [61.2, 5]
        ],
        attributionControl: true,
        zoomControl: false
    };

    map = L.map('divMap', mapOptionsCrs);

    // Init OS Map Layer
    tileServer =  {
        name: "GB - OS Leisure",
        url: `https://api.os.uk/maps/raster/v1/zxy/Leisure_27700/{z}/{x}/{y}.jpg`,
       
        options: {
            attribution: `OS data &copy; Crown ${new Date().getFullYear()}.`  ,
            minZoom: 4,
            maxZoom: 11,       
        }
    } 

    displayLayer=  L.TileLayer.wmsHeader(
        tileServer.url,
        tileServer.options,
        [
            { header: 'Authorization', value: `Bearer ${bearerToken}` }
        ],
        null
    ).addTo(map);


    map.setView(centreLatLong, 9); // Set the initial view and zoom level

    var marker = L.marker(centreLatLong).addTo(map); // [latitude, longitude]
    marker.bindTooltip(mine.Name);
}

function centreMap() {
    map.setView(centreLatLong, 9);
}




// Data Popluation
function populateMineDetails(data) {
    var mine = data.Mine[0];
    
    var mapDiv = document.createElement("div");
    mapDiv.id = "divMap";
    mapDiv.style.width = "500px";
    mapDiv.style.height = "480px";
    mapDiv.style.margin = "auto";

    
    addFirstrow('ID', mine.ID, 17, mapDiv);
    
    
    addRow('Name', mine.Name);
    var url = `./MineDetails.html?id=${btoa(mine.ParentMineID)}`;
    addRow('Parent Mine', mine.ParentMineName == null? "-" : `<span title="Open  '${mine.ParentMineName}' details in THIS tab." class="letterSearch" onclick="window.location.href='${url}'">${mine.ParentMineName}</span>`);
    addRow('Commodity', mine.Products);
    addRow('Location', mine.Location);
    url = `https://www.buddlepit.co.uk/community/index.php?forums/${mine.ForumID}/`;
    addRow('Area', `<span title="Open Buddlepit ${mine.AreaName} area forum in a NEW tab." class="letterSearch" onclick="window.open('${url}', '_blank')">${mine.AreaName}</span>`);
    addRow('Site Type', mine.SiteTypeDescription ?? '-');
    addRow('Record Origin', mine.Origin);
    addRow('Length', mine.Length == null ? '-' : `${mine.Length}m`);
    addRow('Depth', mine.Length == null ? '-' : `${mine.Length}m`);
    addRow('Altitude', mine.Altitude == null ? '-' : `${mine.Altitude}m`);
    addRow('Lat, Lon', `<span class="letterSearch" title="Centre Map" onClick="centreMap()">${parseFloat(mine.Lat).toFixed(5) + ', ' + parseFloat(mine.Long).toFixed(5)}</span>`);
    addRow('Grid Ref', `<span class="letterSearch" title="Centre Map" onClick="centreMap()">${mine.GridRef}</span>`);
    addRow('Easting, Northing', `<span class="letterSearch" title="Centre Map" onClick="centreMap()">${mine.Easting + ', ' + mine.Northing}</span>`);
    addRow('IsCrow', mine.IsCrow ? "Yes"    : "No");    
    addRow('Start Date', mine.WorkedStart == '' ? '-' : mine.WorkedStart);
    addRow('End Date', mine.WorkedEnd == '' ? '-' : mine.WorkedEnd);
    
    addChildMines(data.ChildMines);

    if(mine.History != null && mine.History != '')
        addRow('History', mine.History,2);
    addRow('All Names', mine.MineNames,2);
    if(mine.AccessDetails != null && mine.AccessDetails != '')
        addRow('Access', mine.AccessDetails,2);
    if(mine.Description != null && mine.Description != '')
        addRow('Description', mine.Description,2);
    if(data.Urls.length > 0)
        addPublications('Links', data.Urls);
    if(data.Publications.length > 0)
        addPublications('Publications', data.Publications);
    var conservation = mine.NPRN == null ? '' : `NPRN: ${mine.NPRN}. `;
    conservation += mine.ConservationNotes
    if(conservation != '')
        addRow('Conservation',conservation, 2);
 
    addMap(mine);;

    // Map must be added before nearest sites as it uses the map to add markers
    addNearestSites(data.NearestMines);
}

function addChildMines(childMines) {
    if(childMines.length == 0) 
        return;
   
    var separator = ",&nbsp;&nbsp;&nbsp; "
    var list = '';
    for (var m of childMines) {
        url = `./MineDetails.html?id=${btoa(m.ID)}`;
        list += `<span title="Open details in THIS tab" class="letterSearch" onclick="window.location.href='${url}'">${m.Name.replace(/ /g, '&nbsp;')}</span>${separator}`;
    }
        list = list.slice(0, -separator.length);
        addRow('Child mines', list == ""? "-":list, 2);
}


function addNearestSites(nearestMines) {
    var separator = ",&nbsp;&nbsp;&nbsp; "


    var list = '';
    for (var m of nearestMines) {
        url = `./MineDetails.html?id=${btoa(m.ID)}`;
        list += `<span title="Open details in THIS tab" class="letterSearch" onclick="window.location.href='${url}'">${m.Name.replace(/ /g, '&nbsp;')}&nbsp;(${m.Distance.toLocaleString('en-GB')}m)</span>${separator}`;
    
        // Create a closure to capture the value of 'm' for each iteration
        (function(m) {
            let marker = L.circleMarker([parseFloat(m.Lat), parseFloat(m.Long)], {
                radius: 7,
                color: 'blue',
                fillColor: 'white',
                fillOpacity: 1
            }).addTo(map);
            marker.bindTooltip(m.Name);
            marker.on('click', function(e) {
                window.location.href = `./MineDetails.html?id=${btoa(m.ID)}`;
            });
        })(m);
    }

    list = list.slice(0, -separator.length);
    addRow('Sites within 2km', list == ""? "-":list, 2);
}

function addFirstrow(title, value, rowspan, div) {
    var table = document.getElementById('mine-details');
    var row = table.insertRow(-1);
    var cell1 = row.insertCell(0);
    var cell2 = row.insertCell(1);
    var cell3 = row.insertCell(2);
    cell3.style.width = "500px";
    cell3.appendChild(div);
    cell3.rowSpan= rowspan;

    cell1.style.minWidth = "130px";
    cell1.innerHTML = title;
    cell2.innerHTML = value;
}

function addRow(title, value, colspan = 1) {
    var table = document.getElementById('mine-details');
    var row = table.insertRow(-1);
    var cell1 = row.insertCell(0);
    var cell2 = row.insertCell(1);
    cell1.innerHTML = title;
    cell2.innerHTML = value;
    cell2.colSpan = colspan;
}

function addPublications(title, list) {
    var table = document.getElementById('mine-details');
    var row = table.insertRow(-1);
    var cell1 = row.insertCell(0);
    cell1.rowSpan = list.length > 1? list.length : 1;
    cell1.innerHTML = title;
    var cell2 = row.insertCell(1);
    cell2.colSpan = 2;
    
    if(list.length > 0) {
        if(title == "Links")
            cell2.innerHTML = `<span title="Open link in THIS tab" class="lettersearch" onclick="window.location.href='${list[0].Value}'">${list[0].Value}</span>`;
        else
            cell2.innerHTML = list[0].Value;
    }
  
    
    
    for(i = 1; i < list.length; i++) {
        var row = table.insertRow(-1);
        var cell2 = row.insertCell(0);
        cell2.colSpan = 2;
        if(title == "Links")
            cell2.innerHTML = `<span title="Open link in THIS tab" class="lettersearch" onclick="window.location.href='${list[i].Value}'">${list[i].Value}</span>`;
        else
            cell2.innerHTML = list[i].Value;
    }
}







// OS Map OAuth Stuff
var bearerToken;                    // This should always be the latest valid access token
let tokenExpirationTime;
const tokenRenewalThreshold = 60 * 1000; // Renew token 1 minute before expiry (in milliseconds)

// Make these funciton async so that we can await the fetchToken function and 
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
        if(displayLayer != null) {
            displayLayer.headers = [{ header: 'Authorization', value: 'Bearer ' + bearerToken }];
            console.log('Token added to map layer');
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







