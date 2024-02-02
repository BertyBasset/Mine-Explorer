CREATE DEFINER=`{UserName}`@`%` PROCEDURE `GetMineDetails`(
	IN `mineId` INT
)
LANGUAGE SQL
NOT DETERMINISTIC
CONTAINS SQL
SQL SECURITY DEFINER
COMMENT ''
BEGIN
    -- Query 1: Get Mine details
    SELECT * FROM Mine M WHERE M.ID = mineId;

    -- Query 2: Get Products
    SELECT P.* FROM Product P JOIN MineProduct MP ON MP.ProductID = P.ID WHERE MP.MineID = mineId;

    -- Query 3: Get MineNames
    SELECT * FROM MineName MN WHERE MN.MineID = mineId;

    -- Query 4: Get Publications
    SELECT * FROM Publication P WHERE P.MineID = mineId;

    -- Query 5: Get Urls
    SELECT * FROM Url U WHERE U.MineID = mineId;
END