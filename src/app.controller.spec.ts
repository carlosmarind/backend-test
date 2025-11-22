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
  });

  
  describe('Probar getters', () => {
    test('hello', () => {
      expect(appController.getHello()).toMatch(/!!/);
    });

    test('apikey', () => {
      expect(appController.getApikey()).toMatch(/!!/)
    });
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
    return request(app.getHttpServer())
    .get('/')
    .expect(200)
    .expect(/Hello/);
  });


  it('/apikey (GET)', () => {
    return request(app.getHttpServer())
    .get('/apikey')
    .expect(200)
    .expect(/!!/);
  });

  it('/validate-rut (GET) [OK] ', () => {
    return request(app.getHttpServer())
    .get('/validate-rut')
    .query({ rut: '16.672.890-8' })
    .expect('Content-type', /application\/json/)
    .then((res) => {
        expect(res.body.mensaje).toBe('rut válido');
        expect(res.status).toBe(200)
      });

  })

  it('/validate-rut (GET) [Bad Request] ', () => {
    return request(app.getHttpServer())
    .get('/validate-rut')
    .query({ rut: '120.345.678-9' })
    .expect('Content-type', /application\/json/)
    .then((res) => {
        expect(res.body.mensaje).toBe('rut inválido');
        expect(res.status).toBe(400)
      });

  })




});
