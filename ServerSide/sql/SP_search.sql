CREATE DEFINER=`{UserName}`@`%` PROCEDURE `Search`(
	IN `id` INT,
	IN `name` VARCHAR(255),
	IN `text_fields` VARCHAR(255),
	IN `area_id` INT,
	IN `sheet` VARCHAR(255),
	IN `is_crow` BOOLEAN,
	IN `site_type_id` INT,
	IN `product_Ids` VARCHAR(50),
	IN `lat` DECIMAL(10, 6),
	IN `lon` DECIMAL(10, 6),
	IN `distance` DECIMAL(10, 2)
)
LANGUAGE SQL
NOT DETERMINISTIC
CONTAINS SQL
SQL SECURITY DEFINER
COMMENT ''
BEGIN
	SET @earth_radius_km :=  6371; -- Earth's radius in kilometers
	SET @Name2 := REPLACE(REPLACE(NAME, ' ', ''), '-', '');






		DROP TEMPORARY TABLE IF EXISTS temp_prod_ids;
		-- Create a temporary table to store the individual IDs
		CREATE TEMPORARY TABLE temp_prod_ids (
	   	id INT UNSIGNED);


		-- Insert the individual IDs into the temporary table
		SET @start = 1;
		SET @end = 1;
		WHILE @end <= LENGTH(product_Ids)
		DO
		    SET @end = LOCATE(',', product_Ids, @start);
		    IF @end = 0 THEN
		        SET @end = LENGTH(product_Ids) + 1;
		    END IF;
		    INSERT INTO temp_prod_ids (id) VALUES (SUBSTRING(product_Ids, @start, @end - @start));
		    SET @start = @end + 1;
		END WHILE;




    	SELECT 
        M.ID, 
        M.`Name`, 
        M.Location, 
        M.AreaName, 
        M.Lat, 
        M.`Long`, 
        M.GridRef, 
        M.IsCrow, 
        M.`Summary`, 
        M.`Names`, 
        M.Products, 
        M.SiteType,
		  CASE WHEN lat IS NULL OR lon IS NULL OR distance IS NULL
		  THEN NULL ELSE
            (
                @earth_radius_km * ACOS(
                    COS(RADIANS(lat)) * COS(RADIANS(M.Lat)) *
                    COS(RADIANS(M.Long) - RADIANS(lon)) +
                    SIN(RADIANS(lat)) * SIN(RADIANS(M.Lat))
                )
            ) END `Distance`,
		M.HexColor,
		M.IconFilename

		FROM 
        MineSummary M 
    	WHERE 
		  (id IS NULL OR M.ID = id)
        AND (@Name2 IS NULL OR REPLACE(REPLACE(M.Names,' ', ''), '-', '') LIKE CONCAT('%', @Name2, '%'))
        AND (text_fields IS NULL 
		  		OR M.History LIKE CONCAT('%', text_fields, '%')
			   OR M.WorkedStart LIKE CONCAT('%', text_fields, '%')
			   OR M.WorkedEnd LIKE CONCAT('%', text_fields, '%')
			   OR M.AccessDetails LIKE CONCAT('%', text_fields, '%')
			   OR M.`Description` LIKE CONCAT('%', text_fields, '%')
  			   OR M.ConservationNotes LIKE CONCAT('%', text_fields, '%')
  	     )
		  	
        AND (area_id IS NULL OR M.AreaID = area_id)
		  AND (sheet IS NULL OR M.Sheet = sheet)
        AND (is_crow IS NULL OR M.IsCrow = is_crow)
        AND (site_type_id IS NULL OR M.SiteTypeID = site_type_id)
        -- Search
        AND (
				product_Ids IS NULL OR
				EXISTS (SELECT * FROM MineProduct MP JOIN temp_prod_ids P ON MP.ProductID = P.ID WHERE MP.MineID = M.ID) 
        )
        -- Search within distance km of specified point
		  AND (
            lat IS NULL OR lon IS NULL OR distance IS NULL
            OR (
                @earth_radius_km * ACOS(
                    COS(RADIANS(lat)) * COS(RADIANS(M.Lat)) *
                    COS(RADIANS(M.Long) - RADIANS(lon)) +
                    SIN(RADIANS(lat)) * SIN(RADIANS(M.Lat))
                )
            ) < distance
        )
		  ORDER BY M.`Name`
		  LIMIT 500
		  ;
        

	-- Drop the temporary table when done
	DROP TEMPORARY TABLE IF EXISTS temp_prod_ids;
        
END