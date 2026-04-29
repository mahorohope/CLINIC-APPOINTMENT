// src/login.js
const bcrypt = require('bcrypt');
const pool = require('./database'); // Ensure this exports your Pool instance

async function handleLogin(email, password) {
    try {
        // 1. Search for the user (using the new 'email' column)
        const query = 'SELECT * FROM users WHERE email = $1';
        const result = await pool.query(query, [email]);

        if (result.rows.length === 0) {
            return { success: false, message: 'Invalid email or password.' };
        }

        const user = result.rows[0];

        // 2. Security Check: Handle case where stored password might not be a hash
        // Bcrypt hashes usually start with '$2b$' or '$2a$'
        if (!user.password.startsWith('$2')) {
            console.error('Security Alert: User has plain-text password in DB. Comparison will fail.');
            // Temporary fix for your current data: direct comparison
            if (password === user.password) return loginSuccess(user);
        }

        // 3. Compare hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        
        if (isMatch) {
            return loginSuccess(user);
        } else {
            return { success: false, message: 'Invalid email or password.' };
        }

    } catch (err) {
        console.error('Login Database Error:', err);
        return { success: false, message: 'A server error occurred.' };
    }
}

// Helper to keep the main function clean
function loginSuccess(user) {
    return { 
        success: true, 
        user: { 
            id: user.id, 
            name: user.name, 
            email: user.email, 
            role: user.role 
        } 
    };
}

module.exports = handleLogin;