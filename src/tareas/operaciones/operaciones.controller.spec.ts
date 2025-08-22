import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../../src/app.module';

describe('OperacionesController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/operaciones suma', () => {
    return request(app.getHttpServer())
      .get('/operaciones')
      .query({ operacion: 'suma', a: 10, b: 30 })
      .expect(200)
      .expect({ resultado: 40, mensaje: 'operacion exitosa' });
  });

  it('/operaciones resta cero', () => {
    return request(app.getHttpServer())
      .get('/operaciones')
      .query({ operacion: 'resta', a: 2, b: 2 })
      .expect(200)
      .expect({ resultado: 0, mensaje: 'operacion exitosa' });
  });

  it('/operaciones invalida', () => {
    return request(app.getHttpServer())
      .get('/operaciones')
      .query({ operacion: 'potencia', a: 2, b: 3 })
      .expect(502)
      .expect({ resultado: null, mensaje: 'operacion no pudo ser calculada' });
  });
});
