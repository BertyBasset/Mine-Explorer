var id;
var API_KEY_BING = "Aqv51PgdNN4aM7Zz0JO77lnhWrrV2r8EwSPJjsD0jMLSqqI93NKUCcuRAr8oMdO8";     

window.onload = function() {

    try {
        const urlParams = new URLSearchParams(window.location.search);
        const encryptedId = urlParams.get('id');
        id = atob(encryptedId);
    } catch (error) {
        alert('Invalid Mine ID');
        return;
    }

    fetch(`https://www.buddlepit.co.uk/api/getMineDetails.php?MineID=${id}`)
        .then(response => response.json())
        .then(data => {
            console.log(data);
            populateMineDetails(data);
        })
        .catch(error => {
            console.error('Error:', error);
        });



};

var centreLatLong;
var map;
function addMap(mine) { 
  

    centreLatLong  =[parseFloat(mine.Lat), parseFloat(mine.Long)];


     map = L.map('divMap', {
        zoomControl: false,
        maxZoom:17,
        minZoom:12
    }).setView(centreLatLong, 14); // Set the initial view and zoom level

    // Init OS Map Layer
    var osLayer = L.tileLayer.bing(API_KEY_BING, { 
        opacity: 1, 
        zIndex: 0, 
        attribution: 'Bing Maps, OS Maps'
    });
    osLayer.addTo(map);
  

    var marker = L.marker(centreLatLong).addTo(map); // [latitude, longitude]
    marker.bindTooltip(mine.Name);
}

function centreMap() {
    map.setView(centreLatLong, 14);
}


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
    addRow('Products', mine.Products);
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
    addRow('Start Date', mine.WorkedStart);
    addRow('End Date', mine.WorkedEnd);
    addRow('History', mine.History,2);
    addRow('Alternative Names', mine.MineNames,2);
    addRow('Access', mine.AccessDetails,2);
    addRow('Description', mine.Description,2);
    addPublications('Links', data.Urls);
    addPublications('Publications', data.Publications);
    var conservation = mine.NPRN == null ? '' : `NPRN: ${mine.NPRN}. `;
    addRow('Conservation', conservation + mine.ConservationNotes, 2);
 
    addMap(mine);;

    // Map must be added before nearest sites as it uses the map to add markers
    addNearestSites(data.NearestMines);
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
                fillOpacity: 0
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

