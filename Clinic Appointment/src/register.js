// src/register.js
const bcrypt = require('bcrypt');
const pool = require('./database');

async function handleRegistration(userData) {
    const { name, email, password, role } = userData;

    try {
        // 1. Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // 2. Insert into PostgreSQL using $ placeholders
        // Note: We use email instead of username to match your form
        const query = `
            INSERT INTO users (name, email, password, role) 
            VALUES ($1, $2, $3, $4) 
            RETURNING id, name;
        `;
        const values = [name, email, hashedPassword, role];

        const result = await pool.query(query, values);
        
        return { 
            success: true, 
            user: result.rows[0] 
        };

    } catch (err) {
        // Error code 23505 = Unique constraint violation (email already exists)
        if (err.code === '23505') {
            return { success: false, message: 'This email is already registered.' };
        }
        console.error('Registration Error:', err);
        return { success: false, message: 'Server error. Please try again.' };
    }
}

module.exports = handleRegistration;