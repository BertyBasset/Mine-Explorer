
<?php
// Get the query parameters
$lon1 = $_GET['lon1'];
$lon2 = $_GET['lon2'];
$lat1 = $_GET['lat1'];
$lat2 = $_GET['lat2'];

// Check if all parameters are set and not empty
if (isset($lon1) && isset($lon2) && isset($lat1) && isset($lat2) &&
    !empty($lon1) && !empty($lon2) && !empty($lat1) && !empty($lat2)) {

    // Construct the URL with the provided parameters
    $url = "https://map.bgs.ac.uk/arcgis/services/BGS_Detailed_Geology/MapServer/WMSServer?";
    $url .= "version=1.3.0&request=GetFeatureInfo&format=text/xml&layers=BGS.50k.Bedrock";
    $url .= "&query_layers=BGS.50k.Bedrock&info_format=text/xml";
    $url .= "&i=200&j=400&radius=0&crs=CRS:84";
    $url .= "&BBOX=$lon1,$lat1,$lon2,$lat2";
    $url .= "&WIDTH=450&HEIGHT=450&styles=default";

    // Set headers to allow CORS (Cross-Origin Resource Sharing)
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type");

    // Fetch the data from the URL using cURL
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    $response = curl_exec($ch);

    // Check for cURL errors
    if (curl_errno($ch)) {
        echo 'Error: ' . curl_error($ch);
    } else {
        // Return the response
        $xml = simplexml_load_string($response);

        // Extract data from the XML response according to the template
        $name = $xml->FIELDS->attributes()->LEX_RCS_D;
        $time = $xml->FIELDS->attributes()->MIN_TIME_D . ' to ' . $xml->FIELDS->attributes()->MAX_TIME_D;
        $period = $xml->FIELDS->attributes()->MAX_PERIOD . ' to ' . $xml->FIELDS->attributes()->MIN_PERIOD;
        $type = $xml->FIELDS->attributes()->TYPE_D . ', ' . $xml->FIELDS->attributes()->BROAD_D;
        $setting = $xml->FIELDS->attributes()->SETTING_D . ', ' . $xml->FIELDS->attributes()->SETTINGPLUS_D;
        $environment = $xml->FIELDS->attributes()->ENVIRONMENT_D;

        // Build the text string using the template
        $text =  "<tr><td>Name:</td><td>$name</td><td></td></tr>";
        $text .= "<tr><td>Time:</td><td>$time</td><td></td></tr>";
        $text .= "<tr><td>Period:</td><td>$period</td><td></td></tr>";
        $text .= "<tr><td>Type:</td><td>$type</td><td></td></tr>";
        $text .= "<tr><td>Setting:</td><td>$setting</td><td></td></tr>";
        $text .= "<tr><td>Env:</td><td>$environment</td><td></td></tr>";


        // Return the text string
        echo $text;
    }

    // Close cURL resource
    curl_close($ch);
} else {
    // If any parameter is missing or empty
    echo "Error: One or more parameters are missing or empty.";
}
?>
