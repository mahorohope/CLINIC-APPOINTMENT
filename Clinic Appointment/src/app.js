const express = require('express');
const path = require('path');
const { User, Appointment, sequelize } = require('./models');
const { register, login } = require('./auth');
const { authenticateToken } = require('./middleware');

const app = express();
app.use(express.json());

// --- AUTHENTICATION ---
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const user = await register(name, email, password, role);
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const data = await login(email, password);
    res.json(data);
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
});

// --- APPOINTMENTS (CRUD) ---
app.post('/api/appointments', authenticateToken, async (req, res) => {
  try {
    const appointment = await Appointment.create({
      date: req.body.date,
      patientId: req.user.id,
      doctor: req.body.doctor || 'General Clinic' // Fixes notNull violation
    });
    res.status(201).json(appointment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/appointments', authenticateToken, async (req, res) => {
  try {
    const filter = req.user.role === 'staff' ? {} : { where: { patientId: req.user.id } };
    const list = await Appointment.findAll({
      ...filter,
      include: [{ model: User, as: 'patient', attributes: ['name'] }],
      order: [['queue_number', 'ASC']]
    });
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message }); // Fixes Unexpected token '<'
  }
});

// Admin/Staff Action: Mark as Served
app.patch('/api/appointments/:id/serve', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'staff') return res.status(403).json({ error: "Staff only" });
    const appointment = await Appointment.findByPk(req.params.id);
    if (!appointment) return res.status(404).json({ error: "Not found" });
    await appointment.update({ status: 'served' });
    res.json({ message: "Served" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.use(express.static(path.join(__dirname, '../public')));

// SYNC DATABASE
sequelize.sync({ alter: true }).then(() => {
  if (process.env.NODE_ENV !== 'test') {
    app.listen(3000, () => console.log('🚀 Server on http://localhost:3000'));
  }
});

module.exports = { app, sequelize }; // Export for Jest