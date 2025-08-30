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
      controllers: [AppController],
      // Se crea un mock de AppService para aislar las pruebas del controlador.
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

  // Pruebas unitarias para el controlador, aislando el servicio.
  describe('Pruebas unitarias', () => {

    test('getHello() debería llamar a appService.getHello() y retornar "Hello World!"', () => {
      // expect() comprueba el valor de retorno del método.
      expect(appController.getHello()).toBe('Hello World!');
      // toHaveBeenCalled() verifica si el método del mock fue llamado.
      expect(appService.getHello).toHaveBeenCalled();
    });

    test('getApikey() debería llamar a appService.getApikey() y retornar "mock-api-key"', () => {
      expect(appController.getApikey()).toBe('mock-api-key');
      expect(appService.getApikey).toHaveBeenCalled();
    });

    test('validateRut() debería retornar un objeto con "rut valido" si el rut es válido', async () => {
      // Se utiliza mockRes para simular la respuesta HTTP.
      const mockRes = {
        status: jest.fn(() => mockRes),
        json: jest.fn(),
      };
      // Se llama al método del controlador con un RUT de prueba.
      await appController.validateRut(mockRes as any, '11.111.111-1');
      // Se comprueba que el status y el JSON de la respuesta son los esperados.
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

// describe() para las pruebas end-to-end (e2e).
describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    // Se crea un módulo de NestJS con el AppModule completo.
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    // Se inicializa la aplicación para realizar peticiones reales.
    app = moduleFixture.createNestApplication();
    await app.init();
  });

  test('/ (GET) debería retornar "Hello World!"', () => {
    // request() de supertest simula peticiones HTTP.
    return request(app.getHttpServer()).get('/').expect(200).expect('Hello !!');
  });

  test('/apikey (GET) debería retornar la API key', () => {
    return request(app.getHttpServer()).get('/apikey').expect(200).expect(/test-api-key/);
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