<?php



    // Read contents of export1.json
    $export1_content = file_get_contents('/var/www/html/api/export1.json');
    $export1_array = json_decode($export1_content, true);

    // Read contents of export2.json
    $export2_content = file_get_contents('/var/www/html/api/export2.json');
    $export2_array = json_decode($export2_content, true);

    // Merge the two arrays
    $merged_array = array_merge($export1_array, $export2_array);

    // Encode the merged array to JSON
    $output_json = json_encode($merged_array, JSON_PRETTY_PRINT);

    // Write the JSON to output.json
    file_put_contents('mines.json', $output_json);

    echo "Merged arrays written to output.json successfully.";

?>
