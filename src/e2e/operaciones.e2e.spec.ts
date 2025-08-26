import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../app.module';

describe('Operaciones e2e', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('suma 2+3 => 5', async () => {
    const r = await request(app.getHttpServer())
      .get('/operaciones')
      .query({ operacion: 'suma', a: 2, b: 3 })
      .expect(200);
    expect(r.body).toEqual({ resultado: 5, mensaje: 'operacion exitosa' });
  });

  it('resta 3-2 => 1', async () => {
    const r = await request(app.getHttpServer())
      .get('/operaciones')
      .query({ operacion: 'resta', a: 3, b: 2 })
      .expect(200);
    expect(r.body).toEqual({ resultado: 1, mensaje: 'operacion exitosa' });
  });

  it('multiplicar -4*3 => -12', async () => {
    const r = await request(app.getHttpServer())
      .get('/operaciones')
      .query({ operacion: 'multiplicar', a: -4, b: 3 })
      .expect(200);
    expect(r.body).toEqual({ resultado: -12, mensaje: 'operacion exitosa' });
  });

  it('dividir 10/2 => 5', async () => {
    const r = await request(app.getHttpServer())
      .get('/operaciones')
      .query({ operacion: 'dividir', a: 10, b: 2 })
      .expect(200);
    expect(r.body).toEqual({ resultado: 5, mensaje: 'operacion exitosa' });
  });

  it('resultado cero (1-1) => 0 y 200', async () => {
    const r = await request(app.getHttpServer())
      .get('/operaciones')
      .query({ operacion: 'resta', a: 1, b: 1 })
      .expect(200);
    expect(r.body).toEqual({ resultado: 0, mensaje: 'operacion exitosa' });
  });

  it('división por cero => 502', async () => {
    await request(app.getHttpServer())
      .get('/operaciones')
      .query({ operacion: 'dividir', a: 10, b: 0 })
      .expect(502);
  });

  it('operación inválida => 502', async () => {
    await request(app.getHttpServer())
      .get('/operaciones')
      .query({ operacion: 'potencia', a: 2, b: 3 })
      .expect(502);
  });

  it('faltan parámetros => 502', async () => {
    await request(app.getHttpServer())
      .get('/operaciones')
      .query({ operacion: 'suma', a: 5 })
      .expect(502);
  });
});
