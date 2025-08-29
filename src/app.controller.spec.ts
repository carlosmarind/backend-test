import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { createRequest, createResponse } from 'node-mocks-http';
import { Response } from 'express'; // Importa los tipos de Express

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
    test('Esto deberia retornar hola mundo en ingles"', () => {
      expect(appController.getHello()).toBe('Hello!!');
    });

    test('Esto deberia retornar la apikey del usuario', () => {
      expect(appController.getApikey()).toBe('12345!!');
    });

    test('Esto deberia validar un rut chileno', () => {
      const mockRes = createResponse();

      expect(appController.validateRut(mockRes, '').statusCode).toEqual(400);
      expect(appController.validateRut(mockRes, '12345678-5').statusCode).toEqual(200);
      expect(appController.validateRut(mockRes, '12.345.678-5').statusCode).toEqual(200);
      expect(appController.validateRut(mockRes, '123456785').statusCode).toEqual(200);
      expect(appController.validateRut(mockRes, '12345678-K').statusCode).toEqual(400);
      expect(appController.validateRut(mockRes, '12345678-k').statusCode).toEqual(400);
      expect(appController.validateRut(mockRes, '12.345.678-K').statusCode).toEqual(400);
      expect(appController.validateRut(mockRes, '12.345.678-k').statusCode).toEqual(400);
      expect(appController.validateRut(mockRes, '12345678K').statusCode).toEqual(400);
      expect(appController.validateRut(mockRes, '00012345678-5').statusCode).toEqual(400);
      expect(appController.validateRut(mockRes, '000012345678-5').statusCode).toEqual(400);
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
});
