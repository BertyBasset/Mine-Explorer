<?php

// Database connection settings
$host = 'localhost';
$dbname = 'MineSites';
$username = '{UserName}';
$password = '{Password}';                 // Need to move credentials into server environment variables using export DB_HOST="localhost"    to set, then in php, use    $dbHost = getenv('DB_HOST');

try {
    // Connect to the database
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);

    // Get search parameter from the query string
    $letter = isset($_GET['letter']) ? $_GET['letter'] : '';

    // Check if MineID is provided
    if (!$letter) {
        echo "Error: First Letter not provided.";
        exit;
    }

    // Prepare the SQL query to call the stored procedure
    $stmt = $pdo->prepare("CALL letterSearch(?)");
    $stmt->bindParam(1, $letter, PDO::PARAM_STR);

    // Execute the stored procedure
    $stmt->execute();

    // Fetch the result as an associative array
    $result = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Set the HTTP response headers
    header("Access-Control-Allow-Origin: *"); // Allow requests from any origin
    header('Content-Type: application/json');

    // Output the JSON response
    echo json_encode($result);
} catch (PDOException $e) {
    // Handle database connection errors
    echo "Error: " . $e->getMessage();
}

?>