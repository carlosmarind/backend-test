import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './app.module';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { Response } from 'express';

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
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
    appService = app.get<AppService>(AppService);
  });

  describe('getHello', () => {
    it('should return hello message from service', () => {
      const result = 'Hello test!!';
      jest.spyOn(appService, 'getHello').mockReturnValue(result);

      expect(appController.getHello()).toBe(result);
      expect(appService.getHello).toHaveBeenCalled();
    });
  });

  describe('getApikey', () => {
    it('should return api key from service', () => {
      const result = 'test-api-key!!';
      jest.spyOn(appService, 'getApikey').mockReturnValue(result);

      expect(appController.getApikey()).toBe(result);
      expect(appService.getApikey).toHaveBeenCalled();
    });
  });

  describe('validateRut', () => {
    let mockResponse: Partial<Response>;

    beforeEach(() => {
      mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };
    });

    it('should return 200 for valid RUT', () => {
      const validRut = '12345678-9';
      jest.spyOn(appService, 'validateRut').mockReturnValue(true);

      appController.validateRut(mockResponse as Response, validRut);

      expect(appService.validateRut).toHaveBeenCalledWith(validRut);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({ mensaje: 'rut valido' });
    });

    it('should return 400 for invalid RUT', () => {
      const invalidRut = 'invalid-rut';
      jest.spyOn(appService, 'validateRut').mockReturnValue(false);

      appController.validateRut(mockResponse as Response, invalidRut);

      expect(appService.validateRut).toHaveBeenCalledWith(invalidRut);
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ mensaje: 'rut invalido' });
    });

    it('should handle empty RUT', () => {
      const emptyRut = '';
      jest.spyOn(appService, 'validateRut').mockReturnValue(false);

      appController.validateRut(mockResponse as Response, emptyRut);

      expect(appService.validateRut).toHaveBeenCalledWith(emptyRut);
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ mensaje: 'rut invalido' });
    });

    it('should handle undefined RUT', () => {
      const undefinedRut = undefined as any;
      jest.spyOn(appService, 'validateRut').mockReturnValue(false);

      appController.validateRut(mockResponse as Response, undefinedRut);

      expect(appService.validateRut).toHaveBeenCalledWith(undefinedRut);
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ mensaje: 'rut invalido' });
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

  afterEach(async () => {
    await app.close();
  });

  describe('GET /', () => {
    it('should return 200 with hello message', () => {
      return request(app.getHttpServer())
        .get('/')
        .expect(200)
        .expect(/Hello/);
    });
  });

  describe('GET /apikey', () => {
    it('should return 200 with api key', () => {
      return request(app.getHttpServer())
        .get('/apikey')
        .expect(200)
        .expect(/!!/);
    });
  });

  describe('GET /validate-rut', () => {
    it('should return 200 for valid RUT', () => {
      return request(app.getHttpServer())
        .get('/validate-rut')
        .query({ rut: '11111111-1' })
        .expect(200)
        .expect((res) => {
          expect(res.body).toEqual({ mensaje: 'rut valido' });
        });
    });

    it('should return 400 for invalid RUT', () => {
      return request(app.getHttpServer())
        .get('/validate-rut')
        .query({ rut: 'invalid-rut' })
        .expect(400)
        .expect((res) => {
          expect(res.body).toEqual({ mensaje: 'rut invalido' });
        });
    });

    it('should return 400 for empty RUT', () => {
      return request(app.getHttpServer())
        .get('/validate-rut')
        .query({ rut: '' })
        .expect(400)
        .expect((res) => {
          expect(res.body).toEqual({ mensaje: 'rut invalido' });
        });
    });

    it('should return 400 for missing RUT parameter', () => {
      return request(app.getHttpServer())
        .get('/validate-rut')
        .expect(400)
        .expect((res) => {
          expect(res.body).toEqual({ mensaje: 'rut invalido' });
        });
    });

    it('should return 400 for malformed RUT', () => {
      return request(app.getHttpServer())
        .get('/validate-rut')
        .query({ rut: '12345' })
        .expect(400)
        .expect((res) => {
          expect(res.body).toEqual({ mensaje: 'rut invalido' });
        });
    });

    it('should handle RUT with spaces', () => {
      return request(app.getHttpServer())
        .get('/validate-rut')
        .query({ rut: ' 11111111-1 ' })
        .expect(400);
    });
  });
});
