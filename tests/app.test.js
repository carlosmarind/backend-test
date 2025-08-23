const request = require('supertest');
const app = require('../src/app'); // ajusta si tu archivo principal tiene otro nombre

describe('API Backend Test', () => {
  it('GET / debe responder con 200', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
  });

  it('GET /health debe responder con status OK', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('status');
  });

  it('GET /item/:id borde (id inválido) debe dar 400', async () => {
    const res = await request(app).get('/item/abc');
    expect([400,404]).toContain(res.statusCode); // depende cómo manejes error
  });

  it('POST /item borde (body vacío) debe dar 400', async () => {
    const res = await request(app).post('/item').send({});
    expect([400,422]).toContain(res.statusCode); // depende cómo manejes validación
  });

  it('POST /item válido debe crear item', async () => {
    const payload = { name: 'Test', qty: 1 };
    const res = await request(app).post('/item').send(payload);
    expect([200,201]).toContain(res.statusCode);
    expect(res.body).toMatchObject(payload);
  });
});
