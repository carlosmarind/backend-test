import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';

describe('AppController', () => {
  let app: INestApplication;
  let appService = {
    getHello: jest.fn().mockReturnValue('Hello !!'),
    getApikey: jest.fn().mockReturnValue('123!!'),
    validateRut: jest.fn((rut: string) => rut === '11111111-1'),
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [{ provide: AppService, useValue: appService }],
    }).compile();

    app = module.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

it('/ (GET)', async () => {
  await request(app.getHttpServer())
    .get('/')
    .expect(200)
    .expect('Hello !!')
},  60000); // <- 20 segundos en lugar de 5

  it('/apikey (GET)', async () => {
    await request(app.getHttpServer())
      .get('/apikey')
      .expect(200)
      .expect('123!!');
  });

  it('/validate-rut valido (GET)', async () => {
    await request(app.getHttpServer())
      .get('/validate-rut?rut=11111111-1')
      .expect(400)
      .expect({ mensaje: 'rut valido' });
  });

  it('/validate-rut invalido (GET)', async () => {
    await request(app.getHttpServer())
      .get('/validate-rut?rut=99999999-9')
      .expect(400)
      .expect({ mensaje: 'rut invalido' });
  });
});