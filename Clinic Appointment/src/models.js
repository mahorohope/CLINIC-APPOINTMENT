// app.js
require('dotenv').config();
const express = require('express');
const path = require('path');

// 1. Import the new modular logic
const handleRegistration = require('./src/register');
const handleLogin = require('./src/login');

const app = express();
const PORT = process.env.PORT || 3000;

// 2. Middleware
app.use(express.json()); 
app.use(express.static(path.join(__dirname, 'public')));

// 3. API Routes

/**
 * Registration API
 * Uses the new handleRegistration from src/register.js
 */
app.post('/api/register', async (req, res) => {
    try {
        const result = await handleRegistration(req.body);
        if (result.success) {
            res.status(201).json({ message: "Registration successful!", user: result.user });
        } else {
            res.status(400).json({ error: result.message });
        }
    } catch (err) {
        console.error("Route Error:", err);
        res.status(500).json({ error: "Server error" });
    }
});

/**
 * Login API
 * Uses the new handleLogin from src/login.js
 */
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const result = await handleLogin(email, password);

        if (result.success) {
            res.status(200).json({ 
                message: "Login successful", 
                user: result.user,
                token: "session-" + Date.now() // Placeholder for your frontend
            });
        } else {
            res.status(401).json({ error: result.message });
        }
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

// 4. Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});