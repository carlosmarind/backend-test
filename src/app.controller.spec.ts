import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { queryObjects } from 'v8';

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

    test('Esto deberia retornar hola más mi usuario"', () => {
      expect(appController.getHello()).toBe('Hello cesar!!');
    }); 
    
    test('Esto NO deberia retornar hola sin mi usuario"', () => {
      expect(appController.getHello()).not.toBe('Hello !!');
    });

    test('Esto deberia retornar la API_KEY"', () => {
      expect(appController.getApikey()).toBe('#qwerty123456!!');
    });

    test('Esto NO deberia retornar sin la API_KEY"', () => {
      expect(appController.getApikey()).toBe('#qwerty123456!!');
    });

    test('Esto debería retornar válido si el RUT es correcto', () => { 
      const res: any = {
             status: jest.fn().mockReturnThis(),
             json: jest.fn().mockReturnThis(),
          };
      appController.validateRut(res, '11111111-1');

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ mensaje: 'rut valido' });
    });

    test('Esto debería retornar válido si el RUT es correcto', () => { 
      const res: any = {
             status: jest.fn().mockReturnThis(),
             json: jest.fn().mockReturnThis(),
          };
      appController.validateRut(res, '11111111-K');

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
    return request(app.getHttpServer()).get('/').expect(200).expect(/cesar/);
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer()).get('/apikey').expect(200).expect(/#qwerty123456/);
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer()).get('/validate-rut').expect(400).expect(/rut invalido/);
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
         .get('/validate-rut')
         .query({ rut: '11111111-1' })
         .expect(200)
         .expect({ mensaje: 'rut valido' });
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
         .get('/validate-rut')
         .query({ rut: '11111111-K' })
         .expect(400)
         .expect({ mensaje: 'rut invalido' });
  });
});
