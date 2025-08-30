import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { Response } from 'express';


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

  describe('Probar el modulo raiz del proyecto', () => {
    /*test('Esto deberia retornar hola mundo en ingles"', () => {
      expect(appController.getHello()).toBe('Hello Michael!!');
    });*/

    
    test('Esto deberia retornar el apikey', () => {
      expect(appController.getApikey()).toBe('!!');
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
    return request(app.getHttpServer()).get('/').expect(200).expect(/Hello/);
  });

  it('/apikey (GET)', () => {
    return request(app.getHttpServer()).get('/apikey').expect(200).expect(/!!/);
  });

  it('/validate-rut (GET) con rut valido', () => {
    return request(app.getHttpServer())
      .get('/validate-rut')
      .query({ rut: '26536720-8' })
      .expect('Content-type', /application\/json/)
      .expect(200);
  });

  it('/validate-rut (GET) con rut invalido', () => {
    return request(app.getHttpServer())
      .get('/validate-rut')
      .query({ rut: '26538' })
      .expect('Content-type', /application\/json/)
      .expect(400);
  });
});
