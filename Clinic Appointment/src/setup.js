const { register } = require('./auth');
const { sequelize } = require('./models');

async function setup() {
  try {
    // Force sync recreates tables based on your models
    await sequelize.sync({ force: true });
    console.log("Database tables created.");

    // Create a Staff account for the reviewer
    await register("Assessor", "staff@clinic.com", "admin123", "staff");
    console.log("✅ Staff Account: staff@clinic.com / admin123");

    // Create a Patient account for testing
    await register("Test Patient", "test@test.com", "password123", "patient");
    console.log("✅ Patient Account: test@test.com / password123");

    process.exit(0);
  } catch (err) {
    console.error("Setup failed:", err.message);
    process.exit(1);
  }
}

setup();