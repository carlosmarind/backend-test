import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../app.module';

describe('Operaciones edges e2e', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('resta 1-1 => 0 responde 200', async () => {
    const r = await request(app.getHttpServer())
      .get('/operaciones')
      .query({ operacion: 'resta', a: 1, b: 1 })
      .expect(200);
    expect(r.body).toEqual({ resultado: 0, mensaje: 'operacion exitosa' });
  });

  it('dividir por 0 => 502', async () => {
    const r = await request(app.getHttpServer())
      .get('/operaciones')
      .query({ operacion: 'dividir', a: 10, b: 0 })
      .expect(502);
    expect(r.body).toEqual({ resultado: null, mensaje: 'operacion no pudo ser calculada' });
  });

  it('operación inválida => 502', async () => {
    const r = await request(app.getHttpServer())
      .get('/operaciones')
      .query({ operacion: 'potencia', a: 2, b: 3 })
      .expect(502);
    expect(r.body).toEqual({ resultado: null, mensaje: 'operacion no pudo ser calculada' });
  });

  it('param a no numérico => 502', async () => {
    const r = await request(app.getHttpServer())
      .get('/operaciones')
      .query({ operacion: 'suma', a: 'abc', b: 2 })
      .expect(502);
    expect(r.body).toEqual({ resultado: null, mensaje: 'operacion no pudo ser calculada' });
  });

});
