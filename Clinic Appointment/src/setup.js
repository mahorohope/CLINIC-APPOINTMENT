// src/setup.js
require('dotenv').config();
const pool = require('./database');

const createTables = async () => {
    const query = `
        -- Create Users Table
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'patient',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        -- Create Appointments Table
        CREATE TABLE IF NOT EXISTS appointments (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            patient_name TEXT NOT NULL,
            appointment_date DATE NOT NULL,
            status TEXT DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `;

    try {
        console.log("⏳ Initializing Supabase tables...");
        await pool.query(query);
        console.log("✅ Tables created successfully or already exist.");
    } catch (err) {
        console.error("❌ Error setting up database:", err);
    } finally {
        // Close the pool so the script finishes and exits the terminal
        await pool.end();
    }
};

createTables();