-- Create users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(150) NOT NULL UNIQUE,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(128) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create customers table
CREATE TABLE customers (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id),
    business_name VARCHAR(255) NOT NULL,
    business_address VARCHAR(255) NOT NULL,
    phone_number VARCHAR(15) NOT NULL,
    email VARCHAR(150) NOT NULL,
    bank_name VARCHAR(255) NOT NULL,
    bank_account_number VARCHAR(20) NOT NULL,
    bank_routing_number VARCHAR(9) NOT NULL,
    ein VARCHAR(9) NOT NULL,
    incorporation_date DATE NOT NULL
);

-- Create checks table
CREATE TABLE checks (
    id SERIAL PRIMARY KEY,
    payer_id INT NOT NULL REFERENCES customers(id),
    recipient_id INT NOT NULL REFERENCES customers(id),
    amount NUMERIC(10, 2) NOT NULL,
    memo VARCHAR(255),
    date_issued DATE  NOT NULL DEFAULT(CURRENT_DATE),
    is_signed BOOLEAN DEFAULT FALSE,
    is_confirmed BOOLEAN DEFAULT FALSE,
    ipfs_hash VARCHAR(255)
);

-- Example of creating an index for faster search on username
CREATE INDEX idx_users_username ON users(username);

-- Example of creating an index for faster search on email
CREATE INDEX idx_users_email ON users(email);