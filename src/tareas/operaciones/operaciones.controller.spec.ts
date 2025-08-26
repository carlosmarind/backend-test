import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../../src/app.module';

describe('OperacionesController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /operaciones', () => {
    it('debería sumar dos números correctamente', () => {
      return request(app.getHttpServer())
        .get('/operaciones')
        .query({ operacion: 'suma', a: 10, b: 30 })
        .expect(HttpStatus.OK)
        .expect({ resultado: 40, mensaje: 'operacion exitosa' });
    });

    it('debería restar dos números correctamente', () => {
      return request(app.getHttpServer())
        .get('/operaciones')
        .query({ operacion: 'resta', a: 10, b: 30 })
        .expect(HttpStatus.OK)
        .expect({ resultado: -20, mensaje: 'operacion exitosa' });
    });

    it('debería multiplicar dos números correctamente', () => {
      return request(app.getHttpServer())
        .get('/operaciones')
        .query({ operacion: 'multiplicacion', a: 5, b: 4 })
        .expect(HttpStatus.OK)
        .expect({ resultado: 20, mensaje: 'operacion exitosa' });
    });

    it('debería dividir dos números correctamente', () => {
      return request(app.getHttpServer())
        .get('/operaciones')
        .query({ operacion: 'division', a: 40, b: 2 })
        .expect(HttpStatus.OK)
        .expect({ resultado: 20, mensaje: 'operacion exitosa' });
    });

    it('debería retornar 0 cuando el numerador es 0', () => {
      return request(app.getHttpServer())
        .get('/operaciones')
        .query({ operacion: 'division', a: 0, b: 5 })
        .expect(HttpStatus.OK)
        .expect({ resultado: 0, mensaje: 'operacion exitosa' });
    });

    it('debería retornar 502 para una operación inválida', () => {
      return request(app.getHttpServer())
        .get('/operaciones')
        .query({ operacion: 'potencia', a: 10, b: 2 })
        .expect(HttpStatus.BAD_GATEWAY)
        .expect({ resultado: null, mensaje: 'operacion no pudo ser calculada' });
    });

    it('debería retornar 502 para una división por cero', () => {
      return request(app.getHttpServer())
        .get('/operaciones')
        .query({ operacion: 'division', a: 10, b: 0 })
        .expect(HttpStatus.BAD_GATEWAY)
        .expect({ resultado: null, mensaje: 'operacion no pudo ser calculada' });
    });

    it('debería retornar 502 si faltan parámetros numéricos', () => {
      return request(app.getHttpServer())
        .get('/operaciones')
        .query({ operacion: 'suma', a: 10 })
        .expect(HttpStatus.BAD_GATEWAY)
        .expect({ resultado: null, mensaje: 'operacion no pudo ser calculada' });
    });

    it('debería retornar 502 si un parámetro no es numérico', () => {
      return request(app.getHttpServer())
        .get('/operaciones')
        .query({ operacion: 'suma', a: 'diez', b: 5 })
        .expect(HttpStatus.BAD_GATEWAY)
        .expect({ resultado: null, mensaje: 'operacion no pudo ser calculada' });
    });

    it('debería retornar 502 si no se provee una operación', () => {
      return request(app.getHttpServer())
        .get('/operaciones')
        .query({ a: 10, b: 5 })
        .expect(HttpStatus.BAD_GATEWAY)
        .expect({ resultado: null, mensaje: 'operacion no pudo ser calculada' });
    });
  });
});
