const MAX_RESULTS = 500;
initiallise();


function reset() {
    document.getElementById("name").value = "";
    document.getElementById("text").value = "";
    document.getElementById("area").value = "";
    document.getElementById("os-sheet").value = "";
    document.getElementById("site-type").value = "";
    document.getElementById("product").value = "";
    document.getElementById("latlong").value = "";
    document.getElementById("latlong").style.background = 'white';
    document.getElementById("gridref").value = "";
    document.getElementById("gridref").style.background = 'white';
    document.getElementById("distance").value = "";
    document.getElementById("is-crow").indeterminate = true;
    state = 2; // Initial state: indeterminate
    document.getElementById("name").focus();
}


function search() {
    // Validate form
    if(!validate())
        return;

    var name = document.getElementById("name").value.trim() == "" ? null : document.getElementById("name").value.trim();
    var text = document.getElementById("text").value.trim() == "" ? null : document.getElementById("text").value.trim();
    var areaID = document.getElementById("area").value.trim() == "" ? null : parseInt(document.getElementById("area").value.trim());
    var sheet = document.getElementById("os-sheet").value.trim() == "" ? null : document.getElementById("os-sheet").value.trim();
    var siteTypeID = document.getElementById("site-type").value.trim() == "" ? null : parseInt(document.getElementById("site-type").value.trim());
    var productID = document.getElementById("product").value.trim() == "" ? null : parseInt(document.getElementById("product").value.trim());
    var lat = null, lon = null;
    if(document.getElementById("latlong").value.trim().length > 0) {
        lat = parseFloat(document.getElementById("latlong").value.trim().split(",")[0]);
        lon = parseFloat(document.getElementById("latlong").value.trim().split(",")[1]);
    }
    var distance = document.getElementById("distance").value.trim() == "" ? null : parseFloat(document.getElementById("distance").value.trim());
    var isCrow = document.getElementById("is-crow").indeterminate ? null :(document.getElementById("is-crow").checked ? true : false);


    startTime = performance.now();
    spinner.style.display = "block";

    var qs =`id=null&name=${name}&text_fields=${text}&area_id=${areaID}&sheet=${sheet}&is_crow=${isCrow}&site_type_id=${siteTypeID}&product_Ids=${productID}&lat=${lat}&lon=${lon}&distance=${distance}`;

    //Connsole.log(qs)

    fetch("https://www.buddlepit.co.uk/api/search.php?" + qs)
        .then(response => response.json())
        .then(data => {
            showResults(data, 'detail');
            spinner.style.display = "none";
        })
        .catch(error => console.error('Error fetching data:', error)
    );
    

}

function validate() {
    var nameNotSet = document.getElementById("name").value.trim() == "";
    var textFieldsNotSet = document.getElementById("text").value.trim() == "";
    var areaNotSelected = document.getElementById("area").value.trim() == "";
    var osSheetNotSelected = document.getElementById("os-sheet").value.trim() == "";
    var siteTypeNotSelected = document.getElementById("site-type").value.trim() == "";
    var productNotSelected = document.getElementById("product").value.trim() == "";
    var latLonNotSelected=  document.getElementById("latlong").value.trim() == "";
    var distanceNotSelected = document.getElementById("distance").value.trim() == "";
    var spinner = document.getElementById("spinner");



    // If latlon or distance set, they must be valid
    if(!latLonNotSelected) {
        if(!document.getElementById("latlong").checkValidity()) {
            alert("Invalid Lat, Lon");
            document.getElementById("latlong").focus();
            return false;
        }
    }
    if(!distanceNotSelected) {
        if(!document.getElementById("distance").checkValidity()) {
            alert("Invalid distance");
            document.getElementById("distance").focus();
            return false;
        }
    }
    if(!latLonNotSelected && distanceNotSelected) {
        alert("If LatLon/GridRef is set, distance must be set");
        document.getElementById("distance").focus();
        return false;
    }

    if(latLonNotSelected && !distanceNotSelected) {
        alert("If distance is set, LatLon/GridRef must be set");
        document.getElementById("latlong").focus();
        return false;
    }

    // Something must have been selected
    if(nameNotSet && textFieldsNotSet && areaNotSelected && osSheetNotSelected && siteTypeNotSelected && productNotSelected && latLonNotSelected && distanceNotSelected) {
        alert("Please enter at least one search criteria");
        document.getElementById("name").focus();
        return false;
    }

    return true;
}


var startTime;
var lastLetterSelected = "";
function letterSearch(letter) {
    lastLetterSelected = letter;
    startTime = performance.now();
    spinner.style.display = "block";
    fetch('https://www.buddlepit.co.uk/api/letterSearch.php?letter=' + letter)
        .then(response => response.json())
        .then(data => {
            showResults(data, "letter");
            spinner.style.display = "none";
        })
        .catch(error => console.error('Error fetching data:', error)
    );

}


function quickSearch() {
    var quicksearch = document.getElementById("quick-search");

    if (quicksearch.value.trim().length <1) {
        alert("Please enter a quick search term.)");
        quicksearch.focus();
        return;
    }

    startTime = performance.now();
    spinner.style.display = "block";
    fetch('https://www.buddlepit.co.uk/api/quickSearch.php?search=' + quicksearch.value)
        .then(response => response.json())
        .then(data => {
            showResults(data, "quick");
            spinner.style.display = "none";
        })
        .catch(error => console.error('Error fetching data:', error)
    );
    
    quicksearch.focus();
    quicksearch.select();
}

function showResults(data, searchType) {
    //                     letter, detail, quick

    const tableBody = document.querySelector('#data-table tbody');
    tableBody.innerHTML = '';
    data.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.ID}</td>
            <td>${highlightSiteName(item.Names,searchType)}</td>
            <td>${highlightLocation(item.Location, searchType)}</td>
            <td style='text-align: center'>${item.IsCrow?"Y":"N"}</td>
            <td>${item.AreaName}</td>
            <td>${highlightWithSpaces(item.Products, searchType)}</td>
            <td>${isNaN(item.Lat) ? "" : parseFloat(item.Lat).toFixed(5)},${isNaN(item.Lat) ? "" : parseFloat(item.Long).toFixed(5)}</td>
            <td>${item.GridRef}</td>
            <td>${item.Distance ==null ? "-" : item.Distance.toFixed(1) + "km"}</td>
            <td>${item.SiteType??"-"}</td>
            <td title="${item.Summary.replace(/<[^>]*>/g, '')}">${highlightWithSpaces(truncateWithEllipsis(item.Summary, 300), searchType)}</td>

        `;
        tableBody.appendChild(row);
    });
    


    var elapsed = performance.now() - startTime;
    if(data.length == 0) {
        document.getElementById("data-table").style.display = "none";
        document.getElementById("search-summary").style.display = "block";
        document.getElementById("search-summary").innerText = `No matching records found in ${elapsed.toFixed(0)}ms.`;
        // Letter search not capped for now
    } else if (data.length >= MAX_RESULTS && searchType != "letter") {
        document.getElementById("data-table").style.display = "block";
        document.getElementById("search-summary").style.display = "block";
        document.getElementById("search-summary").innerText = `Maximum of ${MAX_RESULTS} records returned in ${elapsed.toFixed(0)}mS. Please refine your search.`;
    } else {
        document.getElementById("data-table").style.display = "block";
        document.getElementById("search-summary").style.display = "block";
        document.getElementById("search-summary").innerText = `${data.length} matching records found in ${elapsed.toFixed(0)}ms.`;
    }

}




function highlightSiteName(text, searchType) {
    //                           detail, letter, quick
    if(text == null)
        return text;


    var search = document.getElementById("quick-search").value;
    if(searchType == "quick") {
        const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

        // Create a regular expression pattern with spaces optional
        const pattern = escapedSearch.split(' ').join('\\s*');

        // Create a regular expression object with global and case-insensitive flags
        const regex = new RegExp(pattern, 'gi');

        // Replace matches with brackets
        const highlightedText = text.replace(regex, '<span style="background-color:black;color: yellow;">$&</span>');
        return highlightedText;
    } else if (searchType == "letter") {
        let regexPattern = new RegExp(`(?:^|(?<=,\\s))(${lastLetterSelected})`, "ig");
        return text.replace(regexPattern, '<span style="background-color:black;color: yellow;">$&</span>');
    } else 
        return text;

}


function highlightLocation(text, searchType) {
    //                           detail, letter, quick

    if(text == null)
        return text;


    var search = document.getElementById("quick-search").value;
    if(searchType == "quick") {
        const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

        // Create a regular expression pattern with spaces optional
        const pattern = escapedSearch.split(' ').join('\\s*');

        // Create a regular expression object with global and case-insensitive flags
        const regex = new RegExp(pattern, 'gi');

        // Replace matches with brackets
        const highlightedText = text.replace(regex, '<span style="background-color:black;color: yellow;">$&</span>');
        return highlightedText;
    } else
        return text;

}

function highlightWithSpaces(text, searchType) {
    //                           detail, letter, quick

    if(text == null)
        return text;


    if(searchType == "quick") {
        let regexPattern = new RegExp(document.getElementById("quick-search").value, "gi");
        let highlightedHtml = text.replace(regexPattern, (match) => {
            return `<span style="background-color:black;color: yellow;">${match}</span>`;
        });
        return highlightedHtml;
    } else
        return text;
}



ckIsCrow = document.getElementById('is-crow');
let state = 2; // Initial state: indeterminate
ckIsCrow.indeterminate=true;
ckIsCrow.title = "No preference";
function toggleCheckbox() {
    
    state = (state + 1) % 3; // Cycle through states: 0, 1, 2

    switch (state) {
        case 0:
            ckIsCrow.checked = false;
            ckIsCrow.indeterminate = false;
            ckIsCrow.title = "Not Crow land";
            break;
        case 1:
            ckIsCrow.checked = true;
            ckIsCrow.indeterminate = false;
            ckIsCrow.title = "Is Crow land";
            break;
        case 2:
            ckIsCrow.checked = false;
            ckIsCrow.indeterminate = true;
            ckIsCrow.title = "No preference";
            break;
    }
}

function truncateWithEllipsis(str, maxLength) {
    if (str.length > maxLength) {
        return str.substring(0, maxLength - 3) + '...';
    }
    return str;
}


// Set initial focus and populate dropdowns
function initiallise() {
    populateDropdown("area", "https://www.buddlepit.co.uk/api/getAreaList.php", "Name");
    populateDropdown("os-sheet", "https://www.buddlepit.co.uk/api/getSheetList.php", "Sheet");    
    populateDropdown("site-type", "https://www.buddlepit.co.uk/api/getSiteTypeList.php", "Description");
    populateDropdown("product", "https://www.buddlepit.co.uk/api/getProductList.php", "Name");
}

function populateDropdown(dropdownId, url, bindToProperty) {
    fetch(url)
        .then(response => response.json())
        .then(data => {
            const dropdown = document.getElementById(dropdownId);
            data.forEach(item => {
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

// Ensure that the min and max attributes of the number input are set correctly
function updateMinMax(input) {
    if (input.value === '') {
        return
    }

    var value = parseInt(input.value);


    // Check if the value is less than the minimum
    if (value < parseInt(input.min)) {
        input.value = input.min;
    }

    // Check if the value is greater than the maximum
    if (value > parseFloat(input.max)) {
        input.value = input.max;
    }

    input.value = value.toFixed(1);
}

function validateGridRef(gridRef) {
    gridRef.value = gridRef.value.toUpperCase().trim().replace(/\s+/g, "");

    if(gridRef.value == "") {
        document.getElementById("latlong").value = "";
        return;
    }


    if (!gridRef.checkValidity() && gridRef.value !== '') {
        gridRef.style.background = 'red';
    } else {
        gridRef.style.background = 'white';
    }

    if(gridRef.checkValidity()) {
        // Format as SS EEEE WWWW 
        var g = gridRef.value;
        let firstGroupLength = 2;
        let secondGroupLength = Math.ceil((g.length - firstGroupLength) / 2);
        gridRef.value  = g.slice(0, firstGroupLength) + " " +
            g.slice(firstGroupLength, firstGroupLength + secondGroupLength) + " " +
            g.slice(firstGroupLength + secondGroupLength);


        // Set latlon
        osgb=new GT_OSGB();
        if(osgb.parseGridRef(gridRef.value)) {
            wgs84=osgb.getWGS84();
                document.getElementById("latlong").value = wgs84.latitude.toFixed(4) + ", " + wgs84.longitude.toFixed(4);
        }
    } 
}


function validateLatLong(latLon) {
    if(latLon.value == "") {
        document.getElementById("gridref").value = "";
        return;
    }




    if (!latLon.checkValidity() && latLon.value !== '') {
        latLon.style.background = 'red';
        document.getElementById("latlong").value = "";
        document.getElementById("gridref").value = "";
    } else {
        latLon.style.background = 'white';
    }

    if(latLon.checkValidity()) {
        // Set latlon
        latLon.value = latLon.value.toUpperCase().trim().replace(/\s+/g, "");
        var arr = latLon.value.split(",");
        var lat = parseFloat(arr[0]);
        var lon = parseFloat(arr[1]);

        
        latLon.value = lat.toFixed(4) + ", " + lon.toFixed(4);
        wgs84 = new GT_WGS84();

        wgs84.setDegrees(lat, lon);
        osgb=wgs84.getOSGB();
            
        document.getElementById("gridref").value = osgb.getGridRef(4);
    }
}