ALTER ALGORITHM = UNDEFINED DEFINER=`{UserName}`@`%` SQL SECURITY DEFINER 
VIEW `MineSummary` AS 
SELECT 
    `m`.`ID` AS `ID`,
    `m`.`Name` AS `Name`,
    `m`.`Location` AS `Location`,
    `m`.`AreaID` AS `AreaID`,
    `m`.`Length` AS `Length`,
    `m`.`Depth` AS `Depth`,
    `m`.`Altitude` AS `Altitude`,
    `m`.`Lat` AS `Lat`,
    `m`.`Long` AS `Long`,
    `m`.`GridRef` AS `GridRef`,
    `m`.`Sheet` AS `Sheet`,
    `m`.`Easting` AS `Easting`,
    `m`.`Northing` AS `Northing`,
    `m`.`History` AS `History`,
    `m`.`WorkedStart` AS `WorkedStart`,
    `m`.`WorkedEnd` AS `WorkedEnd`,
    `m`.`AccessDetails` AS `AccessDetails`,
    `m`.`IsCrow` AS `IsCrow`,
    `m`.`Description` AS `Description`,
    `m`.`ProductsTentative` AS `ProductsTentative`,
    `m`.`ConservationNotes` AS `ConservationNotes`,
    `m`.`NPRN` AS `NPRN`,
    `m`.`Origin` AS `Origin`,
    `m`.`SensitivityID` AS `SensitivityID`,
    `m`.`SiteTypeID` AS `SiteTypeID`,
    `m`.`ParentMineID` AS `ParentMineID`,
    `m`.`RecordIsLocked` AS `RecordIsLocked`,
    CONCAT_WS(
        ', ',
        IF(`m`.`History` <> '', CONCAT('<u>History:</u> ', `m`.`History`), NULL),
        IF(`m`.`WorkedStart` <> '', CONCAT('<u>Start:</u> ', `m`.`WorkedStart`), NULL),
        IF(`m`.`WorkedEnd` <> '', CONCAT('<u>End:</u> ', `m`.`WorkedEnd`), NULL),
        IF(`m`.`AccessDetails` <> '', CONCAT('<u>Access:</u> ', `m`.`AccessDetails`), NULL),
        IF(`m`.`Description` <> '', CONCAT('<u>Description:</u> ', `m`.`Description`), NULL),
        IF(`m`.`ConservationNotes` <> '', CONCAT('<u>Conservation Notes:</u> ', `m`.`ConservationNotes`), NULL)
    ) AS `Summary`,
    (
        SELECT GROUP_CONCAT(`MineName`.`Name` SEPARATOR ', ') 
        FROM `MineName` 
        WHERE `MineName`.`MineID` = `m`.`ID`
    ) AS `Names`,
    (
        SELECT GROUP_CONCAT(`P`.`Name` SEPARATOR ', ') 
        FROM (`Product` `P` 
        JOIN `MineProduct` `MP` ON `MP`.`ProductID` = `P`.`ID`) 
        WHERE `MP`.`MineID` = `m`.`ID`
    ) AS `Products`,
    `a`.`Name` AS `AreaName`,
    `st`.`Description` AS `SiteType`
FROM 
    (
        (`Mine` `m` 
        JOIN `Area` `a` ON `m`.`AreaID` = `a`.`ID`)
        LEFT JOIN `SiteType` `st` ON `m`.`SiteTypeID` = `st`.`ID`
    );
