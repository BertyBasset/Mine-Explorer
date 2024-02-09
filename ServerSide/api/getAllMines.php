<?php
// Proxy end point to get all mines from the mines.json file and bypass the CORS policy

// Set the appropriate header to allow cross-origin requests
header("Access-Control-Allow-Origin: *");

// Define the file path to the mines.json file
$minesFilePath = __DIR__ . '/mines.json';

// Check if the file exists
if (file_exists($minesFilePath)) {
    // Read the content of the mines.json file
    $minesJson = file_get_contents($minesFilePath);

    // Set the appropriate content type header
    header('Content-Type: application/json');

    // Output the content of the mines.json file
    echo $minesJson;
} else {
    // Return a 404 Not Found response if the file does not exist
    http_response_code(404);
    echo json_encode(array('error' => 'File not found'));
}
?>