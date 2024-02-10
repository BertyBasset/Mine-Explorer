<?php
// Define the key-value pairs
$keyValuePairs = [
    "4f30f5b6-9c1e-4e29-a56a-0b4c5d841f3c" => [
        "pk.eyJ1IjoiYmVydHliYXNzZXQiLCJhIjoiY2l3M3J6Zng2MDAxMjJ5cDY3OGR4aWxtdiJ9.Bpd5wLT-J_jIQLAenzZliQ",
        "wqM4BQpyaSZfEtNgfsTQ"
    ]
];

// Function to return JSON response with appropriate HTTP status code
function jsonResponse($data, $statusCode) {
    http_response_code($statusCode);
    header("Content-Type: application/json"); // Set content type to JSON
    header("Access-Control-Allow-Origin: *"); // Allow requests from any origin
    echo json_encode($data);
    exit();
}

// Check if the key is provided via POST or GET
if(isset($_POST['key'])) {
    $requestedKey = $_POST['key'];
} elseif(isset($_GET['key'])) {
    $requestedKey = $_GET['key'];
} else {
    // No key provided
    jsonResponse("No key provided.", 400); // Bad Request
}

// Check if the specified key exists in the key-value pairs
if(isset($keyValuePairs[$requestedKey])) {
    // Return the entire JSON array corresponding to the specified key
    $response = $keyValuePairs[$requestedKey];
    jsonResponse($response, 200); // Success - OK
} else {
    // Specified key not found
    jsonResponse("Key not found.", 404); // Not Found
}
?>