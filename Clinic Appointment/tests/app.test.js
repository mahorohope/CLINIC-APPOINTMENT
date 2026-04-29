const request = require('supertest');
const { app, sequelize } = require('../app');

describe('QueueCare QA Automation', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true }); // Clean start
  });

  test('Should fail login with wrong credentials (401)', async () => {
    const res = await request(app).post('/api/login').send({
      email: 'wrong@test.com', password: 'wrong'
    });
    expect(res.statusCode).toBe(401);
  });

  test('Should register a new patient', async () => {
    const res = await request(app).post('/api/register').send({
      name: 'Test Patient', email: 'pt@test.com', password: 'password123', role: 'patient'
    });
    expect(res.statusCode).toBe(201);
  });

  afterAll(async () => {
    await sequelize.close();
  });
});