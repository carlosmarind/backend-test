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

  it('/operaciones (GET)', () => {
    return request(app.getHttpServer())
      .get('/operaciones')
      .query({ operacion: 'multidividir', a: 90, b: 30 })
      .expect(422);
  });

  it('/operaciones (GET)', () => {
    return request(app.getHttpServer())
      .get('/operaciones')
      .query({ operacion: 'division', a: 90, b: 30 })
      .expect(200);
  });

  it('/operaciones (GET)', () => {
    return request(app.getHttpServer())
      .get('/operaciones')
      .query({ operacion: 'multiplicacion', a: 3, b: 30 })
      .expect(200);
  });

  it('/operaciones (GET)', () => {
    return request(app.getHttpServer())
      .get('/operaciones')
      .query({ operacion: 'resta', a: 3, b: 30 })
      .expect(200);
  });
});
