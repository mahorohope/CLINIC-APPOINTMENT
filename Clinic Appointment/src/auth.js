const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('./models');

const JWT_SECRET = 'your_super_secret_key'; // In production, move this to .env

async function register(name, email, password, role = 'patient') {
  // Hash the password so it's not stored in plain text
  const hashedPassword = await bcrypt.hash(password, 10);
  return await User.create({ name, email, password: hashedPassword, role });
}

async function login(email, password) {
  const user = await User.findOne({ where: { email } });
  if (!user) throw new Error('User not found');

  // Compare provided password with hashed password in DB
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error('Invalid credentials');

  // Create a token that expires in 1 hour
  const token = jwt.sign(
    { id: user.id, role: user.role }, 
    JWT_SECRET, 
    { expiresIn: '1h' }
  );

  return { token, user: { id: user.id, name: user.name, role: user.role } };
}

module.exports = { register, login, JWT_SECRET };