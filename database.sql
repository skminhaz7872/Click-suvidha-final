-- Database Schema for Recharge & Money Management Admin Panel

CREATE TABLE admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL -- 'Retailer', 'Distributor', 'Master Distributor'
);

CREATE TABLE members (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    mobile_number VARCHAR(15) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    transaction_pin VARCHAR(255) NOT NULL,
    address TEXT,
    state VARCHAR(50),
    district VARCHAR(50),
    pincode VARCHAR(10),
    role_id INT,
    status ENUM('Active', 'Inactive') DEFAULT 'Active',
    kyc_status ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending',
    join_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    FOREIGN KEY (role_id) REFERENCES roles(id)
);

CREATE TABLE wallets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    member_id INT UNIQUE,
    balance DECIMAL(15, 2) DEFAULT 0.00,
    FOREIGN KEY (member_id) REFERENCES members(id)
);

CREATE TABLE wallet_transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    wallet_id INT,
    type ENUM('Credit', 'Debit') NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    closing_balance DECIMAL(15, 2) NOT NULL,
    remark VARCHAR(255),
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (wallet_id) REFERENCES wallets(id)
);

CREATE TABLE operators (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    type ENUM('Mobile', 'DTH') NOT NULL,
    status ENUM('Active', 'Inactive') DEFAULT 'Active'
);

CREATE TABLE recharges (
    id INT AUTO_INCREMENT PRIMARY KEY,
    transaction_id VARCHAR(50) UNIQUE NOT NULL,
    member_id INT,
    mobile_number VARCHAR(15) NOT NULL,
    operator_id INT,
    amount DECIMAL(10, 2) NOT NULL,
    commission DECIMAL(10, 2) DEFAULT 0.00,
    status ENUM('Pending', 'Success', 'Failed', 'Refunded') DEFAULT 'Pending',
    api_response TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (member_id) REFERENCES members(id),
    FOREIGN KEY (operator_id) REFERENCES operators(id)
);

CREATE TABLE dth_recharges (
    id INT AUTO_INCREMENT PRIMARY KEY,
    transaction_id VARCHAR(50) UNIQUE NOT NULL,
    member_id INT,
    customer_id VARCHAR(50) NOT NULL,
    operator_id INT,
    amount DECIMAL(10, 2) NOT NULL,
    commission DECIMAL(10, 2) DEFAULT 0.00,
    status ENUM('Pending', 'Success', 'Failed', 'Refunded') DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (member_id) REFERENCES members(id),
    FOREIGN KEY (operator_id) REFERENCES operators(id)
);

CREATE TABLE fund_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    member_id INT,
    amount DECIMAL(15, 2) NOT NULL,
    payment_mode VARCHAR(50) NOT NULL,
    reference_number VARCHAR(100),
    status ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending',
    admin_remark VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (member_id) REFERENCES members(id)
);

CREATE TABLE api_routes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    api_name VARCHAR(100) NOT NULL,
    api_url TEXT NOT NULL,
    api_key VARCHAR(255),
    recharge_type ENUM('Mobile', 'DTH', 'Both') NOT NULL,
    priority INT DEFAULT 1,
    status ENUM('Active', 'Inactive') DEFAULT 'Active'
);

-- Insert basic roles
INSERT INTO roles (name) VALUES ('Retailer'), ('Distributor'), ('Master Distributor');

-- Insert basic operators
INSERT INTO operators (name, type) VALUES 
('Airtel', 'Mobile'), ('Jio', 'Mobile'), ('Vi', 'Mobile'), ('BSNL', 'Mobile'),
('Airtel Digital TV', 'DTH'), ('Tata Play', 'DTH'), ('Dish TV', 'DTH'), ('Sun Direct', 'DTH'), ('d2h', 'DTH');
