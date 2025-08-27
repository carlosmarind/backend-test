import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../../../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });
  it('/operaciones (GET) suma', () => {
    return request(app.getHttpServer())
      .get('/operaciones')
      .query({ operacion: 'suma', a: 15, b: 10 })
      .expect(200)
      .expect({ resultado: 25, mensaje: 'operacion exitosa' }).then((res) => {
        expect(res.body.resultado).toBe(25);
        expect(res.body.mensaje).toBe('operacion exitosa');
      });
  });
  it('/operaciones (GET) resta', () => {
  return request(app.getHttpServer())
    .get('/operaciones')
    .query({ operacion: 'resta', a: 5, b: 30 })
    .expect(200)
    .expect({ resultado: -25, mensaje: 'operacion exitosa' }).then((res) => {
      expect(res.body.resultado).toBe(-25);
      expect(res.body.mensaje).toBe('operacion exitosa');
    });
  });
  it('/operaciones (GET) multiplicacion', () => {
  return request(app.getHttpServer())
    .get('/operaciones')
    .query({ operacion: 'multiplicacion', a: 5, b: 5 })
    .expect(200)
    .expect({ resultado: 25, mensaje: 'operacion exitosa' }).then((res) => {
      expect(res.body.resultado).toBe(25);
      expect(res.body.mensaje).toBe('operacion exitosa');
    });
  });
  it('/operaciones (GET) division', () => {
  return request(app.getHttpServer())
    .get('/operaciones')
    .query({ operacion: 'division', a: 250, b: 10 })
    .expect(200)
    .expect({ resultado: 25, mensaje: 'operacion exitosa' }).then((res) => {
      expect(res.body.resultado).toBe(25);
      expect(res.body.mensaje).toBe('operacion exitosa');
    });
  });
  it('/operaciones (GET) division con cero en dividendo', () => {
  return request(app.getHttpServer())
    .get('/operaciones')
    .query({ operacion: 'division', a: 0, b: 25 })
    .expect(502)
    .expect({ resultado: null, mensaje: 'operacion no pudo ser calculada' }).then((res) => {
      expect(res.body.resultado).toBe(null);
      expect(res.body.mensaje).toBe('operacion no pudo ser calculada');
    });
  });
  it('/operaciones (GET) division con cero en divisor', () => {
  return request(app.getHttpServer())
    .get('/operaciones')
    .query({ operacion: 'division', a: 25, b: 0 })
    .expect(502)
    .expect({ resultado: null, mensaje: 'operacion no pudo ser calculada' }).then((res) => {
      expect(res.body.resultado).toBe(null);
      expect(res.body.mensaje).toBe('operacion no pudo ser calculada');
    });
  });
   it('/operaciones (GET) numeros no validos', () => {
    return request(app.getHttpServer())
      .get('/operaciones')
      .query({ operacion: 'resta', a: 'numero', b: 'otro  numero' })
      .expect(502)
      .expect({ resultado: null, mensaje: 'operacion no pudo ser calculada'}).then((res) => {
        expect(res.body.resultado).toBe(null);
        expect(res.body.mensaje).toBe('operacion no pudo ser calculada');
      });
  });
});
