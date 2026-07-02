CREATE DATABASE IF NOT EXISTS client_system;
USE client_system;

CREATE TABLE IF NOT EXISTS clients (
  id INT AUTO_INCREMENT PRIMARY KEY,
  companyName VARCHAR(255),
  bdMemberName VARCHAR(255),
  dateClientAcquired DATE,
  address TEXT,
  city VARCHAR(100),
  pinCode VARCHAR(20),
  locationArea VARCHAR(100),
  state VARCHAR(100),
  country VARCHAR(100),
  yearOfEstablishment VARCHAR(10),
  industry VARCHAR(100),
  subIndustry VARCHAR(100),
  tags VARCHAR(255),
  companyConstitution VARCHAR(100),
  numberOfEmployees VARCHAR(50),
  gstNo VARCHAR(20),
  website VARCHAR(255),
  contactPersonName VARCHAR(255),
  designation VARCHAR(100),
  phoneNumber VARCHAR(20),
  emailId VARCHAR(255),
  contactPersonStatus VARCHAR(50) DEFAULT 'Active',
  placementFees DECIMAL(10,2),
  additionalPlacementFees VARCHAR(10) DEFAULT 'No',
  creditPeriod VARCHAR(20),
  replacementPeriod VARCHAR(20),
  companyCategory VARCHAR(10),
  companyStatus VARCHAR(50),
  approvalStatus VARCHAR(50),
  remarks TEXT,
  dateOfRevivalCall DATE,
  nameOfExecutive VARCHAR(255),
  statusOfCall VARCHAR(50),
  eMeet VARCHAR(10) DEFAULT 'No',
  updated VARCHAR(10) DEFAULT 'No',
  dateOfDataUpdate DATE,
  dataUpdatedBy VARCHAR(255),
  teamLeader VARCHAR(255),
  franchiseeName VARCHAR(255),
  dateOfClientAllocation DATE,
  reallocationStatus VARCHAR(10) DEFAULT 'No',
  billingStatus VARCHAR(50) DEFAULT 'Unbilled',  -- ✅ ADDED
  bill_no VARCHAR(50),                            -- ✅ ADDED
  bill_amount DECIMAL(10,2),                      -- ✅ ADDED
  bill_date DATE,                                 -- ✅ ADDED
  tally_pushed VARCHAR(10) DEFAULT 'No',          -- ✅ ADDED
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ✅ ADDED: settings table (used by authController.js)
CREATE TABLE IF NOT EXISTS settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  `key` VARCHAR(100) UNIQUE NOT NULL,
  value TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ✅ ADDED: allowed_emails table (used by authController.js)
CREATE TABLE IF NOT EXISTS allowed_emails (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);