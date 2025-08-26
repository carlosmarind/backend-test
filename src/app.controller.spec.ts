import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('AppController - Unit', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: AppService,
          useValue: {
            getHello: jest.fn().mockReturnValue('Hello !!'),
            getApikey: jest.fn().mockReturnValue('API_KEY!!'),
            validateRut: jest.fn((rut: string) => rut === '12345678-9'),
          },
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  it('getHello should return "Hello !!"', () => {
    expect(appController.getHello()).toBe('Hello !!');
  });

  it('getApikey should return API key', () => {
    expect(appController.getApikey()).toBe('API_KEY!!');
  });

  it('validateRut should return "rut valido" for valid RUT', () => {
    expect(appController.validateRut('12345678-9')).toEqual({ mensaje: 'rut valido' });
  });

  it('validateRut should return "rut invalido" for invalid RUT', () => {
    expect(appController.validateRut('11111111-1')).toEqual({ mensaje: 'rut invalido' });
  });
});

describe('AppController - e2e', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET) should return Hello', () => {
    return request(app.getHttpServer()).get('/').expect(200).expect(/Hello/);
  });

  it('/apikey (GET) should return API key', () => {
    return request(app.getHttpServer())
      .get('/apikey')
      .expect(200)
      .expect(/!!/);
  });

  it('/validate-rut (GET) valid rut', () => {
    return request(app.getHttpServer())
      .get('/validate-rut')
      .query({ rut: '12345678-9' })
      .expect(200)
      .expect({ mensaje: 'rut valido' });
  });

  it('/validate-rut (GET) invalid rut', () => {
    return request(app.getHttpServer())
      .get('/validate-rut')
      .query({ rut: '11111111-1' })
      .expect(200)
      .expect({ mensaje: 'rut invalido' });
  });
});
