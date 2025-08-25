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
      expect(appController.getHello()).toBe('Hello !!');
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

    //BEGIN /validate-rut
    it.each([//casos correctos
        ['3257762-8', 'Rut valido num1'],
        ['4382417-1', 'Rut valido num2'],
        ['4808186-k', 'Rut valido k1'],
        ['8072232-K', 'Rut valido K1']
    ])('Deberia retornar 200 porque es un rut valido: %s (%s)', async (rut, descripcion) => {
        return await request(app.getHttpServer())
            .get(`/validate-rut?rut=${rut}`)
            .expect(200)
            .expect((res) => {
                expect(res.body.mensaje).toBe('rut valido');
            });
    });

    it.each([//casos invalidos
        ['11111111-2', 'Rut invalido 1'],
        ['rut invalido', 'Rut invalido 2'],
        ['Felipe Torrico', 'Rut invalido 3'],
        ['', 'Rut invalido 3'],
        ['-4', 'Rut invalido 4']
    ])('Deberia retornar 400 porque es un rut invalido: %s (%s)', async (rut, descripcion) => {
        return await request(app.getHttpServer())
            .get(`/validate-rut?rut=${rut}`)
            .expect(400)
            .expect((res) => {
                expect(res.body.mensaje).toBe('rut invalido');
            });
    });
    //END /validate-rut

    //BEGIN /apikey
    it('Siempre retorna 200. Apikey con !!', () => {
        return request(app.getHttpServer())
        .get(`/apikey`)
        .expect(200)
        .expect((res) => {
            expect(res.text).toMatch(/.*!!/);  // Terminar con !!
            expect(res.text).toBeTruthy();     // No deberia estar vacio
        });
    });
    //END /apikey

    //BEGIN /operaciones
    /* CONSIDERAR: El resultado "0" se considera error */
    it.each([
        ['suma', '1', 1, 2, 'Prueba suma valida'],
        ['suma', 1, '1', 2, 'Prueba suma valida'],
        ['suma', 1, 1, 2, 'Prueba suma 1+1 valida'],
        //['suma', 1, -1, 0, 'Prueba suma 1+(-1) valida'],
        //['suma', -1, 1, 0, 'Prueba suma -1+1 valida'],
        ['suma', -1, -1, -2, 'Prueba suma -1+(-1) valida'],
        //['resta', '1', 1, 0, 'Prueba resta valida'],
        //['resta', 1, '1', 0, 'Prueba resta valida'],
        //['resta', 1, 1, 0, 'Prueba resta 1-1 valida'],
        ['resta', 1, -1, 2, 'Prueba resta 1-(-1) valida'],
        ['resta', -1, 1, -2, 'Prueba resta -1-1 valida'],
        //['resta', -1, -1, 0, 'Prueba resta -1-(-1) valida'],
        ['multiplicacion', '2', 2, 4, 'Prueba multiplicacion valida'],
        ['multiplicacion', 2, '2', 4, 'Prueba multiplicacion valida'],
        ['multiplicacion', 2, 2, 4, 'Prueba multiplicacion 2*2 valida'],
        ['multiplicacion', 2, -2, -4, 'Prueba multiplicacion 2*(-2) valida'],
        ['multiplicacion', -2, 2, -4, 'Prueba multiplicacion -2*2 valida'],
        ['multiplicacion', -2, -2, 4, 'Prueba multiplicacion -2*(-2) valida'],
        ['division', '2', 2, 1, 'Prueba division valida'],
        ['division', 2, '2', 1, 'Prueba division valida'],
        ['division', 2, 2, 1, 'Prueba division 2/2 valida'],
        ['division', 2, -2, -1, 'Prueba division 2/(-2) valida'],
        ['division', -2, 2, -1, 'Prueba division -2/2 valida'],
        ['division', -2, -2, 1, 'Prueba division -2/(-2) valida']
    ])('Operaciones validas', async (operacion, a, b, expectedResult, descripcion) => {
        return await request(app.getHttpServer())
            .get(`/operaciones?operacion=${operacion}&a=${a}&b=${b}`)
            .expect(200)
            .expect((res) => {
                expect(res.body.resultado).toBe(expectedResult);
                expect(res.body.mensaje).toBe('operacion exitosa');
            });
    });

    it.each([
        ['suma', 'a', 1, NaN, 'Prueba suma invalida'],
        ['suma', 1, 'a', NaN, 'Prueba suma invalida'],
        ['suma', 'a', 'b', NaN, 'Prueba suma invalida'],
        ['resta', 1, 'a', NaN, 'Prueba resta invalida'],
        ['resta', 'a', 'b', NaN, 'Prueba resta invalida'],
        ['multiplicacion', 'a', 2, NaN, 'Prueba multiplicacion invalida a es letra'],
        ['multiplicacion', 2, 'a', NaN, 'Prueba multiplicacion invalida b es letra'],
        ['multiplicacion', 'a', 'b', NaN, 'Prueba multiplicacion invalida sin numeros'],
        ['division', 'a', 2, NaN, 'Prueba division invalida a es letra'],
        ['division', 2, 'a', NaN, 'Prueba division invalida b es letra'],
        ['division', 'a', 'b', NaN, 'Prueba division invalida sin numeros'],
        ['division', 2, 0, NaN, 'Prueba division invalida division por 0']
    ])('Operaciones invalidas', async (operacion, a, b, expectedResult, descripcion) => {
        return await request(app.getHttpServer())
            .get(`/operaciones?operacion=${operacion}&a=${a}&b=${b}`)
            .expect(502)
            .expect((res) => {
                expect(res.body.resultado).toBeNull();
                expect(res.body.mensaje).toBe('operacion no pudo ser calculada');
            });
    });
    //END /operaciones
});