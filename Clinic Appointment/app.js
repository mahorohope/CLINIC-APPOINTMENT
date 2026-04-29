const express = require('express');
const path = require('path');
const { Pool } = require('pg');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt'); 
const handleLogin = require('./src/login'); // Import your login logic

dotenv.config();
const app = express();
const PORT = 3000;

// 1. Static File Middleware - FIXES "Cannot GET /login.html"
// This tells Express to look inside the "public" folder for HTML/CSS/JS files
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// 2. Database Connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

pool.connect((err, client, release) => {
  if (err) {
    return console.error('❌ Supabase connection error:', err.message);
  }
  console.log('✅ Connected to Supabase PostgreSQL successfully!');
  release();
});

// 3. Registration Route - FIXES the password mismatch
app.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const query = 'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4)';
    await pool.query(query, [name, email, hashedPassword, role]);
    
    res.status(201).json({ message: "Registration successful!" });
  } catch (err) {
    console.error("Registration Error:", err.message);
    res.status(500).json({ error: "Database error" });
  }
});

// 4. Login Route - Uses your handleLogin logic
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const result = await handleLogin(email, password);

        if (result.success) {
            res.json({ success: true, user: result.user });
        } else {
            res.status(401).json({ success: false, error: result.message });
        }
    } catch (err) {
        res.status(500).json({ success: false, error: "Internal server error" });
    }
});
// ... existing imports and pool setup above ...

// 1. Route for Patients: Book an Appointment
app.post('/api/book-appointment', async (req, res) => {
    const { date, patientName } = req.body; 

    if (!date || !patientName) {
        return res.status(400).json({ error: "Missing date or patient name" });
    }

    try {
        // We insert the appointment and return the 'id' as the Queue Number
        const query = `
            INSERT INTO appointments (patient_name, appointment_date, status) 
            VALUES ($1, $2, $3) 
            RETURNING id;
        `;
        const result = await pool.query(query, [patientName, date, 'Pending']);
        
        res.status(201).json({ 
            success: true, 
            queueNumber: result.rows[0].id 
        });
    } catch (err) {
        console.error("Booking Error:", err.message);
        res.status(500).json({ error: "Database error during booking" });
    }
});

// 2. Route for Staff: Fetch the Queue
app.get('/api/appointments', async (req, res) => {
    try {
        // Fetch all appointments, newest or soonest first
        const query = 'SELECT * FROM appointments ORDER BY id ASC';
        const result = await pool.query(query);
        
        res.json(result.rows);
    } catch (err) {
        console.error("Fetch Error:", err.message);
        res.status(500).json({ error: "Could not retrieve appointment queue" });
    }
});

/// 1. Export the app instance for Vercel
module.exports = app;

// 2. Only run the listener if we are NOT on Vercel
// This prevents "Port already in use" errors during deployment
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`🚀 Clinic System online at http://localhost:${PORT}/index.html`);
    });
}