<?php

// Database connection settings
$host = 'localhost';
$dbname = 'MineSites';
$username = 'rob';
$password = 'Cheese1!';

try {
    // Connect to the database
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);


    // Get MineID from the query string parameter
    $mineId = isset($_GET['MineID']) ? $_GET['MineID'] : null;

    // Check if MineID is provided
    if (!$mineId) {
        echo "Error: MineID not provided.";
        exit;
    }



    // Prepare and execute the stored procedure
    $stmt = $pdo->prepare("CALL GetMineDetails(?)");
    $stmt->bindParam(1, $mineId, PDO::PARAM_INT);
    $stmt->execute();

    // Fetch the result sets
    $mine = $stmt->fetchAll(PDO::FETCH_ASSOC);
    $stmt->nextRowset();
    $products = $stmt->fetchAll(PDO::FETCH_ASSOC);
    $stmt->nextRowset();
    $mineNames = $stmt->fetchAll(PDO::FETCH_ASSOC);
    $stmt->nextRowset();
    $publications = $stmt->fetchAll(PDO::FETCH_ASSOC);
    $stmt->nextRowset();
    $urls = $stmt->fetchAll(PDO::FETCH_ASSOC);
    $stmt->nextRowset();
    $nearest_mines = $stmt->fetchAll(PDO::FETCH_ASSOC);


    // Format the result as JSON
    $result = [
        'Mine' => $mine,
        'Products' => $products,
        'MineNames' => $mineNames,
        'Publications' => $publications,
        'Urls' => $urls,
        'NearestMines' => $nearest_mines
    ];

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