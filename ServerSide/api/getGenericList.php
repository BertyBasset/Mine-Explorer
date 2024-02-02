<?php

// Database connection settings
$host = 'localhost';
$dbname = 'MineSites';
$username = '{UserName}';
$password = '{Password}';

try {
    // Check if the stored procedure name is provided as a parameter
    if(isset($sp_name)) {
        // Connect to the database
        $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);

        // Prepare and execute the stored procedure
        $stmt = $pdo->prepare("CALL $sp_name()");
        $stmt->execute();

        // Fetch the result as an associative array
        $result = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Set the HTTP response headers
        header("Access-Control-Allow-Origin: *"); // Allow requests from any origin
        header('Content-Type: application/json');

        // Output the JSON response
        echo json_encode($result);
    } else {
        echo "Error: Stored procedure name not provided.";
    }
} catch (PDOException $e) {
    // Handle database connection errors
    echo "Error: " . $e->getMessage();
}

?>