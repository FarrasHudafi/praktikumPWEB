-- Create database for Golang Todo App
CREATE DATABASE IF NOT EXISTS golang_db;

-- Use the database
USE golang_db;

-- Create todos table
CREATE TABLE IF NOT EXISTS todos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    body TEXT NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Optional: Insert some sample data (you can remove this if you don't want sample data)
-- INSERT INTO todos (body, completed) VALUES 
--     ('Learn Go programming', FALSE),
--     ('Build a todo app', FALSE),
--     ('Deploy to production', FALSE);

