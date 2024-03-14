BEGIN
BEGIN
    -- Query 1: Get Mine details
    SELECT M.*, A.`Name` AreaName, A.ForumID `ForumID`, ST.Description SiteTypeDescription, M2.Name ParentMineName,
     (
        SELECT GROUP_CONCAT(`P`.`Name` SEPARATOR ', ')
        FROM (`Product` `P`
        JOIN `MineProduct` `MP` ON (`MP`.`ProductID` = `P`.`ID`))
        WHERE `MP`.`MineID` = `M`.`ID`
     ) AS `Products`,
      (
        SELECT GROUP_CONCAT(`MN`.`Name` SEPARATOR ', ')
        FROM `MineName` `MN`
        WHERE `MN`.`MineID` = `M`.`ID`
    ) AS `MineNames`,
    (
        SELECT `P`.`IconFileName` 
        FROM (`Product` `P` 
        JOIN `MineProduct` `MP` ON (`MP`.`ProductID` = `P`.`ID`)) 
        WHERE `MP`.`MineID` = `M`.`ID` 
        ORDER BY `MP`.`IsPrimary` DESC 
        LIMIT 1
    ) AS `IconFilename`
    
    
	 
	   FROM Mine M
	 JOIN Area A ON M.AreaID = A.ID
	 LEFT OUTER JOIN SiteType ST ON M.SiteTypeID = ST.ID
	 LEFT OUTER JOIN Mine M2 ON M.ParentMineID = M2.ID
	 
	 WHERE M.ID = mineId;

    -- Query 2: Get Products
    SELECT P.* FROM Product P JOIN MineProduct MP ON MP.ProductID = P.ID WHERE MP.MineID = mineId;

    -- Query 3: Get MineNames
    SELECT * FROM MineName MN WHERE MN.MineID = mineId;

    -- Query 4: Get Publications
    SELECT ID, MineID, PublicationName `Value`, HasSurvey FROM Publication P WHERE P.MineID = mineId;

    -- Query 5: Get Urls
    SELECT ID, MineID, `Url` `Value`, HasSurvey FROM Url U WHERE U.MineID = mineId;

    
    -- Query 6: Get sites within 1km of site
	SET @earth_radius_km := 6371; -- Earth's radius in kilometers
	SET @within_distance := 2;
	
	SELECT `Long`, Lat INTO @Longitude, @Latitude
	FROM Mine
	WHERE ID = mineID;
	
	SELECT ID, Name, `Long`, Lat, 
	   (ROUND(@earth_radius_km * ACOS(
	            COS(RADIANS(Lat)) * COS(RADIANS(@Latitude)) *
	            COS(RADIANS(@Longitude) - RADIANS(`Long`)) +
	            SIN(RADIANS(Lat)) * SIN(RADIANS(@Latitude))
	        ) * 1000)
	    ) Distance,
    (
        SELECT GROUP_CONCAT(`P`.`Name` SEPARATOR ', ')
        FROM (`Product` `P`
        JOIN `MineProduct` `MP` ON (`MP`.`ProductID` = `P`.`ID`))
        WHERE `MP`.`MineID` = `M`.`ID`
     ) AS `Products`,
    (
        SELECT `P`.`IconFileName` 
        FROM (`Product` `P` 
        JOIN `MineProduct` `MP` ON (`MP`.`ProductID` = `P`.`ID`)) 
        WHERE `MP`.`MineID` = `M`.`ID` 
        ORDER BY `MP`.`IsPrimary` DESC 
        LIMIT 1
    ) AS `IconFilename`	  		    
	FROM Mine M
	WHERE (
	        @earth_radius_km * ACOS(
	            COS(RADIANS(Lat)) * COS(RADIANS(@Latitude)) *
	            COS(RADIANS(@Longitude) - RADIANS(`Long`)) +
	            SIN(RADIANS(Lat)) * SIN(RADIANS(@Latitude))
	        )
	    ) < @within_distance AND ID <> mineID
	ORDER BY    (@earth_radius_km * ACOS(
	            COS(RADIANS(Lat)) * COS(RADIANS(@Latitude)) *
	            COS(RADIANS(@Longitude) - RADIANS(`Long`)) +
	            SIN(RADIANS(Lat)) * SIN(RADIANS(@Latitude))
	        )
	    );
	    
	    
	    
	-- QUERY 7 Child mines
	SELECT ID, `Name`
	
	 FROM Mine M WHERE ParentMineId = mineID;
    
END
    
END