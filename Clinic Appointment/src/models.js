const { DataTypes } = require('sequelize');
const sequelize = require('./database');

const User = sequelize.define('User', {
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, unique: true, allowNull: false },
  password: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.ENUM('patient', 'staff'), defaultValue: 'patient' }
});

const Appointment = sequelize.define('Appointment', {
  date: { type: DataTypes.DATEONLY, allowNull: false },
  // FIX: Allow null to stop the "cannot be null" crash
  doctor: { type: DataTypes.STRING, allowNull: true, defaultValue: 'General Clinic' },
  status: { type: DataTypes.ENUM('pending', 'served', 'cancelled'), defaultValue: 'pending' },
  queue_number: { type: DataTypes.INTEGER }
});

Appointment.beforeCreate(async (appointment) => {
  const lastAppt = await Appointment.findOne({
    where: { date: appointment.date },
    order: [['queue_number', 'DESC']]
  });
  appointment.queue_number = lastAppt ? lastAppt.queue_number + 1 : 1;
});

// FIX: Must be lowercase 'patient' for the frontend table to load names
Appointment.belongsTo(User, { as: 'patient' });

module.exports = { User, Appointment, sequelize };