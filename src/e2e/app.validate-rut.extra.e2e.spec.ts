import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../app.module';

describe('App e2e extra - validate-rut', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('GET /validate-rut sin query rut => 400', () => {
    return request(app.getHttpServer())
      .get('/validate-rut')
      .expect(400)
      .expect({ mensaje: 'rut invalido' });
  });

  it('GET /validate-rut con rut válido sin puntos => 200', () => {
    return request(app.getHttpServer())
      .get('/validate-rut?rut=12345678-5')
      .expect(200)
      .expect({ mensaje: 'rut valido' });
  });
});
