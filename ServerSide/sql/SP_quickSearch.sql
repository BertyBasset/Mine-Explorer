CREATE DEFINER=`{UserName}`@`%` PROCEDURE `QuickSearch`(
	IN `search` VARCHAR(255)
)
LANGUAGE SQL
NOT DETERMINISTIC
CONTAINS SQL
SQL SECURITY INVOKER
COMMENT ''
BEGIN
    SET @Search = Search;

    SET @Search := REPLACE(@Search, ' ', '');
    SET @Search := REPLACE(@Search, '-', '');

    SELECT 
        ID, 
        `Name`, 
        Location, 
        AreaName, 
        Lat, 
        `Long`, 
        GridRef, 
        IsCrow, 
        `Summary`, 
        `Names`, 
        Products, 
        SiteType,
        NULL Distance,
        HexColor,
        IconFilename
    FROM 
        MineSummary  
    WHERE 
        REPLACE(REPLACE(Names, ' ', ''), '-', '') LIKE CONCAT('%', @Search, '%')
        OR REPLACE(REPLACE(Location, ' ', ''), '-', '') LIKE CONCAT('%', @Search, '%')
        OR `History` LIKE CONCAT('%', Search, '%')
        OR `WorkedStart` LIKE CONCAT('%', Search, '%')
        OR `WorkedEnd` LIKE CONCAT('%', Search, '%')
        OR AccessDetails LIKE CONCAT('%', Search, '%')
        OR `Description` LIKE CONCAT('%', Search, '%')
        OR `ConservationNotes` LIKE CONCAT('%', Search, '%')
        OR `Products` LIKE CONCAT('%', Search, '%')
	ORDER BY `Name`	
	LIMIT 500  
		  ;
END