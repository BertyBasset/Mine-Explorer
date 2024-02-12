<?php
// Allow requests from any origin
header("Access-Control-Allow-Origin: *");

$clientId = "9GbhH3gT4I4yfbXaj3aEOiC1GtOWpMJH";
$clientSecret = "tKTKrfMZyumOYn06";

// Set up cURL to make the request
$ch = curl_init("https://api.os.uk/oauth2/token/v1");
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query(array('grant_type' => 'client_credentials')));
curl_setopt($ch, CURLOPT_HTTPHEADER, array('Authorization: Basic ' . base64_encode("$clientId:$clientSecret")));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

// Execute the request
$response = curl_exec($ch);
curl_close($ch);

// Decode the JSON response
$tokenData = json_decode($response, true);

// Check if access_token exists in the response
if (isset($tokenData['access_token'])) {
    // Token fetched successfully
    $accessToken = $tokenData['access_token'];
    // Get expires_in and issued_at values
    $expiresIn = isset($tokenData['expires_in']) ? $tokenData['expires_in'] : null;
    $issuedAt = time(); // Assuming the token was issued at the current time
    // Set Content-Type header to JSON
    header('Content-Type: application/json');
    // Return the access token, expires_in, and issued_at as JSON response
    echo json_encode(['access_token' => $accessToken, 'expires_in' => $expiresIn, 'issued_at' => $issuedAt]);
} else {
    // Unable to fetch token, return error response
    http_response_code(500); // Internal Server Error
    echo json_encode(['error' => 'Unable to fetch access token']);
}
?>