CREATE DEFINER=`{UserName}`@`%` PROCEDURE `LetterSearch`(
	IN `letter` VARCHAR(1)
)
LANGUAGE SQL
NOT DETERMINISTIC
CONTAINS SQL
SQL SECURITY DEFINER
COMMENT ''
BEGIN
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
        HexColor
    FROM 
        MineSummary S
    WHERE 
        `Name` LIKE CONCAT(letter, '%')
        OR EXISTS (SELECT 1 FROM MineName WHERE MineID = S.ID AND `Name` LIKE CONCAT(letter, '%'))
	ORDER BY `Name`

	;
END