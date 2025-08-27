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

  describe('Probar el modulo raiz del proyecto', () => {
    test('Esto deberia retornar hola mundo en ingles"', () => {
      //expect(appController.getHello()).toBe('Hello Usuario!!');
      expect(appController.getHello()).toBe('Hello !!');
    });
  });
  /* describe('Probar el modulo raiz del proyecto', () => {
    test('Esto debería retornar "Hello <USERNAME>!!"', () => {
      // Obtiene el valor de la variable de entorno, si no existe usa "Usuario"
      const expectedUsername = process.env.USERNAME ?? 'Usuario';

      // Compara con el resultado real del appController
      expect(appController.getHello()).toBe(`Hello ${expectedUsername}!!`);
    });
  }); */
});


  /* describe('AppController (Unit)', () => {
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
  }); */

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



  /* Validar mas endpoints */
  it('/apikey (GET)', () => {
    return request(app.getHttpServer())
      .get('/apikey')
      .expect(200)
      .expect((res) => {
        expect(res.text).toBeDefined();
      });
  });

  it('/validate-rut (GET) rut válido', () => {
    return request(app.getHttpServer())
      .get('/validate-rut')
      .query({ rut: '11111111-1' })
      .expect(200)
      .expect((res) => {
        expect(res.body).toEqual({ mensaje: 'rut valido' });
      });
  });

  it('/validate-rut (GET) rut válido k minuscula', () => {
    return request(app.getHttpServer())
      .get('/validate-rut')
      .query({ rut: '10316639-k' })
      .expect(200)
      .expect((res) => {
        expect(res.body).toEqual({ mensaje: 'rut valido' });
      });
  });

  it('/validate-rut (GET) rut válido k mayuscula', () => {
    return request(app.getHttpServer())
      .get('/validate-rut')
      .query({ rut: '10316639-K' })
      .expect(200)
      .expect((res) => {
        expect(res.body).toEqual({ mensaje: 'rut valido' });
      });
  });

  it('/validate-rut (GET) rut inválido', () => {
    return request(app.getHttpServer())
      .get('/validate-rut')
      .query({ rut: '123' })
      .expect(400)
      .expect((res) => {
        expect(res.body).toEqual({ mensaje: 'rut invalido' });
      });
  });
});
