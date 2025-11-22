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
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
    appService = app.get<AppService>(AppService);
  });

  describe('Pruebas unitarias del AppController', () => {
    it('getHello debería retornar el saludo del servicio', () => {
      jest.spyOn(appService, 'getHello').mockReturnValue('Hello Test!!');
      expect(appController.getHello()).toBe('Hello Test!!');
    });

    it('getApikey debería devolver el apikey', () => {
      jest.spyOn(appService, 'getApikey').mockReturnValue('FAKE_API_KEY');
      expect(appController.getApikey()).toBe('FAKE_API_KEY');
    });

    it('validateRut debería devolver 200 si el rut es válido', () => {
      const res: any = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      jest.spyOn(appService, 'validateRut').mockReturnValue(true);

      appController.validateRut(res, '12345678-9');

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ mensaje: 'rut valido' });
    });

    it('validateRut debería devolver 400 si el rut es inválido', () => {
      const res: any = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      jest.spyOn(appService, 'validateRut').mockReturnValue(false);

      appController.validateRut(res, '11111111-1');

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ mensaje: 'rut invalido' });
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
    return request(app.getHttpServer())
      .get('/apikey')
      .expect(200);
  });

  it('/validate-rut (GET) rut inválido', () => {
    return request(app.getHttpServer())
      .get('/validate-rut?rut=11111111-1')
      .expect(400)
      .expect({ mensaje: 'rut invalido' });
  });
});