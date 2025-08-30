import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../../../src/app.module';

describe('OperacionesController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('GET /operaciones con operacion=suma debería retornar el resultado correcto', () => {
    return request(app.getHttpServer())
      .get('/operaciones')
      .query({ operacion: 'suma', a: 10, b: 30 })
      .expect(200)
      .expect({ resultado: 40, mensaje: 'operacion exitosa' });
  });

  it('GET /operaciones con operacion=resta debería retornar el resultado correcto', () => {
    return request(app.getHttpServer())
      .get('/operaciones')
      .query({ operacion: 'resta', a: 50, b: 20 })
      .expect(200)
      .expect({ resultado: 30, mensaje: 'operacion exitosa' });
  });

  it('GET /operaciones con operacion=multiplicacion debería retornar el resultado correcto', () => {
    return request(app.getHttpServer())
      .get('/operaciones')
      .query({ operacion: 'multiplicacion', a: 5, b: 6 })
      .expect(200)
      .expect({ resultado: 30, mensaje: 'operacion exitosa' });
  });

  it('GET /operaciones con operacion=division debería retornar el resultado correcto', () => {
    return request(app.getHttpServer())
      .get('/operaciones')
      .query({ operacion: 'division', a: 100, b: 10 })
      .expect(200)
      .expect({ resultado: 10, mensaje: 'operacion exitosa' });
  });

  it('GET /operaciones con operacion inválida debería retornar un estado 502', () => {
    return request(app.getHttpServer())
      .get('/operaciones')
      .query({ operacion: 'potencia', a: 2, b: 3 })
      .expect(502)
      .expect({ resultado: null, mensaje: 'operacion no pudo ser calculada' });
  });

  afterAll(async () => {
    await app.close();
  });
});
