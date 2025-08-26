import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { INestApplication, HttpStatus } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import configuration from './config/configuration';

describe('AppController (Unit)', () => {
  let appController: AppController;
  let appService: AppService;

  // Mock para AppService, para aislar el controlador en las pruebas unitarias
  const mockAppService = {
    getHello: jest.fn(),
    getApikey: jest.fn(),
    validateRut: jest.fn(),
  };

  // Mock para el objeto Response de Express
  const mockResponse = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: AppService,
          useValue: mockAppService,
        },
      ],
    }).compile();

    appController = module.get<AppController>(AppController);
    appService = module.get<AppService>(AppService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debería estar definido', () => {
    expect(appController).toBeDefined();
  });

  describe('getHello', () => {
    it('debería retornar el saludo provisto por AppService', () => {
      const result = 'Hello World Test!';
      mockAppService.getHello.mockReturnValue(result);
      expect(appController.getHello()).toBe(result);
      expect(mockAppService.getHello).toHaveBeenCalledTimes(1);
    });
  });

  describe('getApikey', () => {
    it('debería retornar la apikey provista por AppService', () => {
      const apiKey = 'test-api-key-123';
      mockAppService.getApikey.mockReturnValue(apiKey);
      expect(appController.getApikey()).toBe(apiKey);
      expect(mockAppService.getApikey).toHaveBeenCalledTimes(1);
    });
  });

  describe('validateRut', () => {
    it('debería retornar status 200 para un RUT válido', () => {
      const rut = '19.815.224-9';
      mockAppService.validateRut.mockReturnValue(true);

      appController.validateRut(mockResponse as unknown as Response, rut);

      expect(mockAppService.validateRut).toHaveBeenCalledWith(rut);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponse.json).toHaveBeenCalledWith({ mensaje: 'rut valido' });
    });

    it('debería retornar status 400 para un RUT inválido', () => {
      const rut = '19.815.224-K';
      mockAppService.validateRut.mockReturnValue(false);

      appController.validateRut(mockResponse as unknown as Response, rut);

      expect(mockAppService.validateRut).toHaveBeenCalledWith(rut);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith({ mensaje: 'rut invalido' });
    });

    it.each([
      { rut: null, description: 'nulo' },
      { rut: undefined, description: 'indefinido' },
      { rut: '', description: 'vacío' },
    ])('debería retornar status 400 para un RUT $description', ({ rut }) => {
      mockAppService.validateRut.mockReturnValue(false);
      appController.validateRut(mockResponse as unknown as Response, rut as string);
      expect(mockAppService.validateRut).toHaveBeenCalledWith(rut);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith({ mensaje: 'rut invalido' });
    });
  });
});

describe('AppController (e2e)', () => {
  let app: INestApplication;
  const mockUsername = 'TestUserFromE2E';
  const mockApiKey = 'TestApiKeyFromE2E';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(configuration.KEY)
      .useValue({
        username: mockUsername,
        apikey: mockApiKey,
        port: 3000,
        database: { host: 'localhost', port: 5432 },
      })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/ (GET) debería retornar el saludo con el usuario mockeado', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect(`Hello ${mockUsername}!!`);
  });

  it('/apikey (GET) debería retornar la apikey mockeada', () => {
    return request(app.getHttpServer())
      .get('/apikey')
      .expect(200)
      .expect(`${mockApiKey}!!`);
  });

  it('/validate-rut (GET) debería retornar 200 para un RUT válido', () => {
    return request(app.getHttpServer()).get('/validate-rut?rut=19.815.224-2').expect(200).expect({ mensaje: 'rut valido' });
  });

  it('/validate-rut (GET) debería retornar 400 para un RUT inválido', () => {
    return request(app.getHttpServer()).get('/validate-rut?rut=19.815.224-K').expect(400).expect({ mensaje: 'rut invalido' });
  });

  it('/validate-rut (GET) debería retornar 400 si no se provee un RUT', () => {
    return request(app.getHttpServer()).get('/validate-rut').expect(400).expect({ mensaje: 'rut invalido' });
  });
});

describe('AppController (e2e) - Default Configuration', () => {
  let app: INestApplication;
  const OLD_ENV = process.env;

  beforeAll(async () => {
    jest.resetModules(); // Limpiar caché de módulos para recargar la configuración.
    process.env = { ...OLD_ENV }; // Crear una copia para no mutar el original.
    delete process.env.PORT;
    delete process.env.USERNAME;

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    process.env = OLD_ENV; // Restaurar env original.
  });

  it('debería usar el puerto por defecto (3000) si no se define PORT en las variables de entorno', () => {
    const configService = app.get(ConfigService);
    expect(configService.get('app.port')).toBe(3000);
  });

  it('debería usar un username vacío si no se define USERNAME en las variables de entorno', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello !!');
  });
});
