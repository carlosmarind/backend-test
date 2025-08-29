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

  it('/operaciones (GET)', () => {
    return request(app.getHttpServer())
      .get('/operaciones')
      .query({ operacion: 'suma', a: 10, b: 30 })
      .expect(200);
  });

  it('/Operaciones (GET) division', () => {
    return request(app.getHttpServer())
      .get('/operaciones')
      .query({ operacion: 'division', a: 10, b: 2 })
      .expect(200)
      .expect(({ body }) => {
        expect(body).toEqual({ mensaje: "operacion exitosa", resultado: 5 });
      });
  });

  it('/operaciones (GET) division por cero', () => {
    return request(app.getHttpServer())
      .get('/operaciones')
      .query({ operacion: 'division', a: 10, b: 0 })
      .expect(502);
  });

  it('/operaciones (GET) cero dividido por', () => {
    return request(app.getHttpServer())
      .get('/operaciones')
      .query({ operacion: 'division', a: 0, b: 10 })
      .expect(502);
  });

  it('/operaciones (GET) sin operacion', () => {
    return request(app.getHttpServer())
      .get('/operaciones')
      .query({ operacion: 'unknown', a: 10, b: 30 })
      .expect(502);
  });

  it('operaciones (GET) resta', () => {
    return request(app.getHttpServer())
      .get('/operaciones')
      .query({ operacion: 'resta', a: 10, b: 30 })
      .expect(200)
      .expect(({ body }) => {
        expect(body).toEqual({ mensaje: "operacion exitosa", resultado: -20 });
      });
  });

  it('operaciones (GET) multiplicacion', () => {
    return request(app.getHttpServer())
      .get('/operaciones')
      .query({ operacion: 'multiplicacion', a: 10, b: 30 })
      .expect(200)
      .expect(({ body }) => {
        expect(body).toEqual({ mensaje: "operacion exitosa", resultado: 300 });
      });
  });

  it('operaciones (GET) sin parametros', () => {
    return request(app.getHttpServer())
      .get('/operaciones')
      .expect(502);
  });
});
