import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    process.env.USERNAME = 'cata';
    process.env.API_KEY = 'cata-api-key';
    const app: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [configuration],
        }),
      ],
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
  });

  describe('Probar el modulo raiz del proyecto', () => {
    test('Esto deberia retornar hola cata en ingles"', () => {
      expect(appController.getHello()).toBe('Hello cata!!');
    });
  });
  describe('Probar metodo getApikey', () => {
    test('Esto deberia retornar cata-api-key"', () => {
      expect(appController.getApikey()).toBe('cata-api-key!!');
    });
  });
});

describe('GET /validate-rut (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('debería responder 200 con mensaje "rut valido"', () => {
    return request(app.getHttpServer())
      .get('/validate-rut?rut=4707309-k')
      .expect(200)
      .expect({ mensaje: 'rut valido' });
  });

    it('debería responder 400 con mensaje "rut invalido"', () => {
    return request(app.getHttpServer())
      .get('/validate-rut?rut=47')
      .expect(400)
      .expect({ mensaje: 'rut invalido' });
  });

});
describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer()).get('/').expect(200).expect(/Hello/);
  });
});
