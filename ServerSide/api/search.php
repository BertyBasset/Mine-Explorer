<?php

function sanitizeInput($input) {
    $stripped= htmlspecialchars(strip_tags(trim($input)));

    return $stripped === 'null' ? null : $stripped;

}

// Database connection settings
$host = 'localhost';
$dbname = 'MineSites';
$username = '{UserName}';
$password = '{Password}';

try {
    // Connect to the database
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);

    // Get and sanitize search parameters
    $id = isset($_REQUEST['id']) ? sanitizeInput($_REQUEST['id']) : null;
    $name = isset($_REQUEST['name']) ? sanitizeInput($_REQUEST['name']) : null;
    $text_fields = isset($_REQUEST['text_fields']) ? sanitizeInput($_REQUEST['text_fields']) : null;
    $area_id = isset($_REQUEST['area_id']) ? sanitizeInput($_REQUEST['area_id']) : null;
    $sheet = isset($_REQUEST['sheet']) ?     sanitizeInput($_REQUEST['sheet']) : null;

    $is_crow_query = isset($_REQUEST['is_crow']) ? strtolower($_REQUEST['is_crow']) : null;
    // 3 state bool - Parse the query string value to boolean or null 
    if ($is_crow_query === "true") {
        $is_crow = true;
    } elseif ($is_crow_query === "false") {
        $is_crow = false;
    } else {
        $is_crow = null;
    }

    $site_type_id = isset($_REQUEST['site_type_id']) ? sanitizeInput($_REQUEST['site_type_id']) : null;
    $product_Ids = isset($_REQUEST['product_Ids']) ? sanitizeInput($_REQUEST['product_Ids']) : null;
    $lat = isset($_REQUEST['lat']) ? sanitizeInput($_REQUEST['lat']) : null;
    $lon = isset($_REQUEST['lon']) ? sanitizeInput($_REQUEST['lon']) : null;
    $distance = isset($_REQUEST['distance']) ? sanitizeInput($_REQUEST['distance']) : null;





    // Prepare the SQL query to call the stored procedure
    $stmt = $pdo->prepare("CALL Search(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");

    // Bind parameters
    $stmt->bindParam(1, $id, PDO::PARAM_INT);
    $stmt->bindParam(2, $name, PDO::PARAM_STR);
    $stmt->bindParam(3, $text_fields, PDO::PARAM_STR);
    $stmt->bindParam(4, $area_id, PDO::PARAM_INT);
    $stmt->bindParam(5, $sheet, PDO::PARAM_STR);
    $stmt->bindParam(6, $is_crow, PDO::PARAM_BOOL);
    $stmt->bindParam(7, $site_type_id, PDO::PARAM_INT);
    $stmt->bindParam(8, $product_Ids, PDO::PARAM_STR);
    $stmt->bindParam(9, $lat, PDO::PARAM_STR);
    $stmt->bindParam(10, $lon, PDO::PARAM_STR);
    $stmt->bindParam(11, $distance, PDO::PARAM_STR);

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