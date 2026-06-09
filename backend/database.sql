CREATE DATABASE IF NOT EXISTS enquiry_system;
USE enquiry_system;

-- ── ENQUIRIES TABLE ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS enquiries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    companyName VARCHAR(255),
    bdMemberName VARCHAR(255),
    teamLeaderName VARCHAR(255),
    franchiseeName VARCHAR(255),
    hrExecutiveName VARCHAR(255),
    designation VARCHAR(255),
    gstNo VARCHAR(100),
    addressLine1 TEXT,
    emailId VARCHAR(255),
    mobileNo VARCHAR(50),
    website VARCHAR(255),
    placementFees DECIMAL(10,2),
    positionName VARCHAR(255),
    `from` INT,
    `to` INT,
    creditPeriod INT,
    replacementPeriod INT,
    enquiryStatus VARCHAR(50) DEFAULT 'inprogress',
    remarks TEXT,
    dateOfAllocation DATE,
    dateOfReallocation DATE,
    newTeamLeader VARCHAR(255),
    nameOfFranchisee VARCHAR(255),
    bill_no VARCHAR(100),
    bill_date DATE,
    bill_amount DECIMAL(10,2),
    candidateName VARCHAR(255),
    additionalContacts TEXT,
    tally_pushed TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ── SETTINGS TABLE ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS settings (
    `key` VARCHAR(100) PRIMARY KEY,
    `value` TEXT
);

-- ── SAMPLE DATA ──────────────────────────────────────────────────────────────
INSERT INTO enquiries (
    companyName, bdMemberName, teamLeaderName, franchiseeName, hrExecutiveName,
    designation, gstNo, addressLine1, emailId, mobileNo, website,
    placementFees, positionName, `from`, `to`, creditPeriod, replacementPeriod,
    enquiryStatus, remarks, dateOfAllocation, dateOfReallocation,
    newTeamLeader, nameOfFranchisee, bill_no, bill_date, bill_amount,
    candidateName, additionalContacts, tally_pushed
) VALUES
('TechNova Pvt Ltd','Aman Sharma','Rohit Mehta','Mumbai Franchise','Priya Singh','Backend Dev','GST123','Mumbai','hr@technova.com','9876543210','technova.com',50000,'Node Dev',2,5,30,6,'inprogress','initial lead','2026-05-20',NULL,'Rohit Mehta','Mumbai Franchise','B001','2026-05-21',50000,'John','9876540000',0),
('InnoSoft','Neha Verma','Karan Patel','Pune Franchise','Anjali Desai','Data Analyst','GST456','Pune','hr@innosoft.com','8765432109','innosoft.com',40000,'Data Analyst',1,3,45,12,'invoiced','invoice sent','2026-05-18',NULL,'Karan Patel','Pune Franchise','B002','2026-05-19',40000,'Jane','9988776655',1),
('Alpha Tech','Vikram Joshi','Sneha Kulkarni','Navi Mumbai Franchise','Ritika Shah','Frontend Dev','GST789','Navi Mumbai','info@alpha.com','7654321098','alpha.com',60000,'React Dev',3,6,60,9,'closed','deal closed','2026-05-10','2026-05-25','Sneha Kulkarni','Navi Mumbai Franchise','B003','2026-05-11',60000,'Alex','9012345678',1),
('ByteCraft','Riya Shah','Amit Jain','Thane Franchise','Neel Mehta','UI Designer','GST111','Thane','hr@bytecraft.com','9988123456','bytecraft.com',35000,'UI UX',1,2,30,6,'position_hold','on hold',NULL,NULL,'Amit Jain','Thane Franchise','B004','2026-05-15',35000,'Sara','9123456789',0),
('CloudSync','Aditya Rao','Rohit Mehta','Mumbai Franchise','Priya Singh','DevOps','GST222','Bandra','jobs@cloudsync.com','9000000001','cloudsync.com',70000,'AWS DevOps',4,7,60,12,'inprogress','discussion','2026-05-22',NULL,'Rohit Mehta','Mumbai Franchise','B005','2026-05-22',70000,'Mike','9001112222',0),
('Zenith','Megha Patil','Karan Patel','Pune Franchise','Anjali Desai','QA Engineer','GST333','Pune','hr@zenith.com','8888888888','zenith.com',30000,'Tester',1,3,30,6,'closed','client rejected',NULL,NULL,'Karan Patel','Pune Franchise','B006','2026-05-17',30000,'Rachel','8112233445',0),
('NextGen','Arjun Nair','Sneha Kulkarni','Navi Mumbai Franchise','Ritika Shah','Full Stack','GST444','Airoli','contact@nextgen.com','7777777777','nextgen.com',65000,'MERN Dev',2,5,45,9,'invoiced','invoice done','2026-05-12',NULL,'Sneha Kulkarni','Navi Mumbai Franchise','B007','2026-05-13',65000,'Tom','7999001122',1),
('FusionSoft','Kavita Iyer','Amit Jain','Thane Franchise','Neel Mehta','HR Manager','GST555','Thane','hr@fusion.com','9999999999','fusion.com',45000,'HR',3,6,30,6,'closed','completed','2026-05-01','2026-05-10','Amit Jain','Thane Franchise','B008','2026-05-02',45000,'Emma','9112233445',1),
('PixelSoft','Nikhil Verma','Rohit Mehta','Mumbai Franchise','Priya Singh','Backend Dev','GST666','Andheri','jobs@pixel.com','8881234567','pixel.com',52000,'Node Dev',2,4,45,9,'inprogress','negotiation',NULL,NULL,'Rohit Mehta','Mumbai Franchise','B009','2026-05-23',52000,'Chris','8000001111',0),
('DataWave','Sana Khan','Karan Patel','Pune Franchise','Anjali Desai','Data Scientist','GST777','Hinjewadi','hr@datawave.com','7012345678','datawave.com',80000,'ML Engineer',3,6,60,12,'invoiced','invoice sent','2026-05-20',NULL,'Karan Patel','Pune Franchise','B010','2026-05-21',80000,'Tony','9000002222',1),
('SoftBridge','Varun Joshi','Sneha Kulkarni','Navi Mumbai Franchise','Ritika Shah','Frontend Dev','GST888','Vashi','contact@softbridge.com','9090909090','softbridge.com',48000,'React Dev',2,5,30,6,'cancelled','cancelled',NULL,NULL,'Sneha Kulkarni','Navi Mumbai Franchise','B011','2026-05-16',48000,'Bruce','8123456789',0),
('CodeHive','Priya Nair','Amit Jain','Thane Franchise','Neel Mehta','Backend Dev','GST999','Thane','hr@codehive.com','9871234560','codehive.com',55000,'Java Dev',2,4,45,9,'inprogress','first round',NULL,NULL,'Amit Jain','Thane Franchise','B012','2026-05-24',55000,'Clark','9000011223',0),
('Appify','Rahul Mehta','Rohit Mehta','Mumbai Franchise','Priya Singh','Mobile Dev','GST101','Bandra','jobs@appify.com','9988771122','appify.com',60000,'Flutter',3,6,60,12,'invoiced','invoice created','2026-05-11',NULL,'Rohit Mehta','Mumbai Franchise','B013','2026-05-12',60000,'Peter','9888776655',1),
('LogicLabs','Sneha Kapoor','Karan Patel','Pune Franchise','Anjali Desai','Analyst','GST202','Baner','hr@logiclabs.com','8877665544','logiclabs.com',42000,'System Analyst',1,3,NULL,NULL,'revised','salary revised',NULL,NULL,'Karan Patel','Pune Franchise','B014','2026-05-18',42000,'Steve','9000022334',0),
('BrightTech','Ankit Sharma','Sneha Kulkarni','Navi Mumbai Franchise','Ritika Shah','DevOps','GST303','Airoli','contact@brighttech.com','7766554433','brighttech.com',70000,'AWS Engineer',4,8,60,12,'inprogress','waiting approval',NULL,NULL,'Sneha Kulkarni','Navi Mumbai Franchise','B015','2026-05-19',70000,'Natasha','9000033445',0),
('NullEdge Corp',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'null@demo.com','0000000000',NULL,0,NULL,NULL,NULL,NULL,NULL,'inprogress','edge case test',NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,0),
('MegaSystems','Kunal Shah','Rohit Mehta','Mumbai Franchise','Priya Singh','Cloud Engineer','GST404','Andheri','hr@mega.com','9009009009','mega.com',90000,'Cloud Architect',4,8,90,15,'closed','closed deal','2026-05-01','2026-05-05','Rohit Mehta','Mumbai Franchise','B018','2026-05-02',90000,'Iron Man','9000044556',1),
('CyberCore','Isha Desai','Karan Patel','Pune Franchise','Anjali Desai','Security Analyst','GST505','Hinjewadi','hr@cyber.com','8881112222','cyber.com',75000,'Security Eng',3,5,60,10,'closed','security role filled','2026-05-10',NULL,'Karan Patel','Pune Franchise','B019','2026-05-11',75000,'Batman','9000055667',1),
('FutureStack','Dev Patel','Sneha Kulkarni','Navi Mumbai Franchise','Ritika Shah','Full Stack','GST606','Vashi','hr@future.com','7778889999','future.com',65000,'MERN Dev',2,6,45,9,'invoiced','final round pending',NULL,NULL,'Sneha Kulkarni','Navi Mumbai Franchise','B020','2026-05-22',65000,'Thor','9000066778',1);

update ENQUIRIES set bill_no = 'B016' where id = 16; 


SET SQL_SAFE_UPDATES = 0;
UPDATE enquiries SET tally_pushed = 0;
SET SQL_SAFE_UPDATES = 1;
SELECT id, companyName, bill_date FROM enquiries WHERE id = 2;

SELECT id, companyName, bill_date, enquiryStatus FROM enquiries WHERE enquiryStatus IN ('closed', 'invoiced');

SELECT id, companyName, bill_date FROM enquiries WHERE id IN (2,3,6,7,10,13,18,19);
SELECT id, companyName, bill_date FROM enquiries WHERE id IN (8,17);

UPDATE enquiries SET tally_pushed = 0 WHERE id IN (8, 17);

SET SQL_SAFE_UPDATES = 0;
UPDATE enquiries SET bill_date = CURDATE() WHERE tally_pushed = 0 AND bill_date IS NOT NULL;
SET SQL_SAFE_UPDATES = 1;

SELECT id, companyName, bill_date FROM enquiries WHERE tally_pushed = 0 AND enquiryStatus IN ('closed','invoiced');

SET SQL_SAFE_UPDATES = 0;
UPDATE enquiries SET bill_date = '2026-05-01' WHERE id IN (2,3,6,7,10,13,18,19);
SET SQL_SAFE_UPDATES = 1;
SELECT id, companyName, remarks FROM enquiries WHERE companyName LIKE '%Zenith%';