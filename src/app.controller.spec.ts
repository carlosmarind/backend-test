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
  let appService: AppService;

  beforeEach(async () => {

    const app: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [configuration],
        }),
      ],
      controllers: [AppController],
      providers: [
        {
          provide: AppService,
          useValue: {
            getHello: jest.fn(() => 'Hello World!'),
            getApikey: jest.fn(() => 'mock-api-key'),
            validateRut: jest.fn((rut: string) => rut === '11.111.111-1'),
          },
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
    appService = app.get<AppService>(AppService);
  });

  describe('Pruebas unitarias', () => {

    test('getHello() debería llamar a appService.getHello() y retornar "Hello World!"', () => {
 
      expect(appController.getHello()).toBe('Hello World!');

      expect(appService.getHello).toHaveBeenCalled();
    });

    test('getApikey() debería llamar a appService.getApikey() y retornar "mock-api-key"', () => {
      expect(appController.getApikey()).toBe('mock-api-key');
      expect(appService.getApikey).toHaveBeenCalled();
    });

    test('validateRut() debería retornar un objeto con "rut valido" si el rut es válido', async () => {
    
      const mockRes = {
        status: jest.fn(() => mockRes),
        json: jest.fn(),
      };
     
      await appController.validateRut(mockRes as any, '11.111.111-1');
      
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ mensaje: 'rut valido' });
    });

    test('validateRut() debería retornar un objeto con "rut invalido" si el rut no es válido', async () => {
      const mockRes = {
        status: jest.fn(() => mockRes),
        json: jest.fn(),
      };
      await appController.validateRut(mockRes as any, '12345');
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ mensaje: 'rut invalido' });
    });

  });
});

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  test('/ (GET) debería retornar "Hello World!"', () => {
    return request(app.getHttpServer()).get('/').expect(200).expect('Hello  !!');
  });

  test('/apikey (GET) debería retornar la API key', () => {
    return request(app.getHttpServer()).get('/apikey').expect(200).expect('!!');
  });

  test('/validate-rut (GET) con rut válido debería retornar "rut valido"', () => {
    return request(app.getHttpServer())
      .get('/validate-rut')
      .query({ rut: '11.111.111-1' })
      .expect(200)
      .expect({ mensaje: 'rut valido' });
  });

  test('/validate-rut (GET) con rut inválido debería retornar "rut invalido"', () => {
    return request(app.getHttpServer())
      .get('/validate-rut')
      .query({ rut: '12345' })
      .expect(400)
      .expect({ mensaje: 'rut invalido' });
  });

  afterAll(async () => {
    await app.close();
  });
});