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
                       'Id', M.Id,
                       'Name', M.Name,
                       'Lat', M.Lat,
                       'Long', M.Long,
                       'GridRef', M.GridRef,
                       'IsCrow', IF(M.IsCrow, 'true', 'false'),
                       'Description', M.Description,
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
                                          'Product', P.Name
                                      )
                                  )
                           FROM MineProduct MP
                           JOIN Product P ON MP.ProductID = P.ID
                           WHERE MP.MineID = M.ID
                       )
                   )
               )
        FROM Mine M
        ORDER BY M.ID
    );

    SET @sql_query = CONCAT('SELECT ', QUOTE(@json_output), ' INTO OUTFILE ', QUOTE(filepath));
    PREPARE stmt FROM @sql_query;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
END