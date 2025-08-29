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

  /* Validar errores generales */
  it('/operaciones (GET) campo operacion no definido', () => {
    return request(app.getHttpServer())
      .get('/operaciones')
      .query({ operacions: 'sumas', a: 10, b: 30 })
      .expect(502)
      .expect((res) => {
        expect(res.body).toEqual({ resultado: null, mensaje: 'operacion no pudo ser calculada' });
      });
  });

  it('/operaciones (GET) operacion no válida', () => {
    return request(app.getHttpServer())
      .get('/operaciones')
      .query({ operacion: 'sumas', a: 10, b: 30 })
      .expect(502)
      .expect((res) => {
        expect(res.body).toEqual({ resultado: null, mensaje: 'operacion no pudo ser calculada' });
      });
  });

  /* Validar sumas */
  it('/operaciones (GET) suma correcta', () => {
    return request(app.getHttpServer())
      .get('/operaciones')
      .query({ operacion: 'suma', a: 10, b: 30 })
      .expect(200)
      .expect((res) => {
        expect(res.body).toEqual({ resultado: 40, mensaje: 'operacion exitosa' });
      });
  });

  it('/operaciones (GET) suma con datos inválidos', () => {
    return request(app.getHttpServer())
      .get('/operaciones')
      .query({ operacion: 'suma', a: 30, b: 'hola' })
      .expect(502)
      .expect((res) => {
        expect(res.body).toEqual({ resultado: null, mensaje: 'operacion no pudo ser calculada' });
      });
  });

  /* Validar restas */
  it('/operaciones (GET) resta correcta', () => {
    return request(app.getHttpServer())
      .get('/operaciones')
      .query({ operacion: 'resta', a: 30, b: 10 })
      .expect(200)
      .expect((res) => {
        expect(res.body).toEqual({ resultado: 20, mensaje: 'operacion exitosa' });
      });
  });

  /* Validar multiplicaciones */
  it('/operaciones (GET) multiplicacion correcta', () => {
    return request(app.getHttpServer())
      .get('/operaciones')
      .query({ operacion: 'multiplicacion', a: 30, b: 10 })
      .expect(200)
      .expect((res) => {
        expect(res.body).toEqual({ resultado: 300, mensaje: 'operacion exitosa' });
      });
  });

  /* Validar divisiones */
  it('/operaciones (GET) division correcta', () => {
    return request(app.getHttpServer())
      .get('/operaciones')
      .query({ operacion: 'division', a: 30, b: 10 })
      .expect(200)
      .expect((res) => {
        expect(res.body).toEqual({ resultado: 3, mensaje: 'operacion exitosa' });
      });
  });

  it('/operaciones (GET) division con divisor = 0', () => {
    return request(app.getHttpServer())
      .get('/operaciones')
      .query({ operacion: 'division', a: 30, b: 0 })
      .expect(502)
      .expect((res) => {
        expect(res.body).toEqual({ resultado: null, mensaje: 'operacion no pudo ser calculada' });
      });
  });
});
