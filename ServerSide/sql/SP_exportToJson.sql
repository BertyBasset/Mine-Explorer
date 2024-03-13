CREATE DEFINER=`{UserName}`@`%` PROCEDURE `ExportToJson`(
	IN `filepath` VARCHAR(255),
	IN `filepath` VARCHAR(255)
)
LANGUAGE SQL
NOT DETERMINISTIC
CONTAINS SQL
SQL SECURITY DEFINER
COMMENT ''
BEGIN
    SET @json_output = (
        SELECT JSON_ARRAYAGG(
                   JSON_OBJECT(
                       'ID', M.Id,
                       'Name', M.Name,
                       'Lat', M.Lat,
                       'Long', M.Long,
                      #'GridRef', M.GridRef,
                       'IsCrow', IF(M.IsCrow, TRUE, FALSE),
                       'Desc', TRIM(CONCAT(TRIM(IFNULL(M.History, '')), ' ', TRIM(IFNULL(M.AccessDetails, '')), ' ', TRIM(IFNULL(M.Description, '')))),
						     'HasDesc', CASE WHEN TRIM(CONCAT(TRIM(IFNULL(M.History, '')), ' ', TRIM(IFNULL(M.AccessDetails, '')), ' ', TRIM(IFNULL(M.Description, '')))) = '' THEN FALSE ELSE TRUE END,
							  'HasLinks', CASE WHEN EXISTS (SELECT 1 FROM Url WHERE MineID = M.ID) THEN TRUE ELSE FALSE END,
							  'HasPub', CASE WHEN EXISTS (SELECT 1 FROM Publication WHERE MineID = M.ID) THEN TRUE ELSE FALSE END,							  
                       'AreaID', M.AreaID,
                       'SiteTypeID', M.SiteTypeID,
							  'IsCoalOnly', 
							    CASE 
							        WHEN (SELECT COUNT(1) FROM MineProduct WHERE MineID = M.ID) = 1 AND EXISTS (SELECT 1 FROM MineProduct WHERE MineID = M.ID AND ProductID =29)
									  THEN TRUE 
							        ELSE FALSE 
							    END,
                      
                       'Names', (
                           SELECT JSON_ARRAYAGG(
                                      JSON_OBJECT(
                                          'Name', N.Name
                                      )
                                  )
                           FROM MineName N
                           WHERE N.MineID = M.ID
                       ),
                       'Products', (
                           SELECT JSON_ARRAYAGG(
                                      JSON_OBJECT(
                                      	
                                          'ID', P.ID, 'Product', P.Name
                                      )
                                  )
                           FROM MineProduct MP
                           JOIN Product P ON MP.ProductID = P.ID
                           WHERE MP.MineID = M.ID
                       ),
                       'IconFileName', (SELECT IconFilename FROM Product P JOIN MineProduct MP ON MP.ProductID = P.ID WHERE MineID = M.ID ORDER BY IsPrimary DESC LIMIT 1) 
                   )
               )
        FROM Mine M
        WHERE ID BETWEEN fromid AND toid
        ORDER BY M.ID
    );

    SET @sql_query = CONCAT('SELECT ', QUOTE(@json_output), ' INTO OUTFILE ', QUOTE(filepath));
    PREPARE stmt FROM @sql_query;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
END