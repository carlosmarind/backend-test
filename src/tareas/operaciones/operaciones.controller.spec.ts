import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../../../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/operaciones (GET) suma correcta', async () => {
    return request(app.getHttpServer())
      .get('/operaciones')
      .query({ operacion: 'suma', a: 120, b: 20 })
      .expect('Content-type', /application\/json/)
      .expect(200)
      .expect({ resultado: 140, mensaje: 'operación exitosa' }).then((res) => {
        expect(res.body.resultado).toBe(140);
        expect(res.body.mensaje).toBe('operación exitosa');
      });
  });

  it('/operaciones (GET) resta correcta', async () => {
    return request(app.getHttpServer())
      .get('/operaciones')
      .query({ operacion: 'resta', a: 35, b: 5 })
      .expect('Content-type', /application\/json/)
      .expect(200)
      .expect({ resultado: 30, mensaje: 'operación exitosa' }).then((res) => {
        expect(res.body.resultado).toBe(30);
        expect(res.body.mensaje).toBe('operación exitosa');
      });
  });

  it('/operaciones (GET) resta correcta', async () => {
    return request(app.getHttpServer())
      .get('/operaciones')
      .query({ operacion: 'resta', a: 35, b: 5 })
      .expect('Content-type', /application\/json/)
      .expect(200)
      .expect({ resultado: 30, mensaje: 'operación exitosa' }).then((res) => {
        expect(res.body.resultado).toBe(30);
        expect(res.body.mensaje).toBe('operación exitosa');
      });
  });

  it('/operaciones (GET) multiplicación correcta', async () => {
    return request(app.getHttpServer())
      .get('/operaciones')
      .query({ operacion: 'multiplicacion', a: 9, b: 5 })
      .expect('Content-type', /application\/json/)
      .expect(200)
      .expect({ resultado: 45, mensaje: 'operación exitosa' }).then((res) => {
        expect(res.body.resultado).toBe(45);
        expect(res.body.mensaje).toBe('operación exitosa');
      });
  });


  it('/operaciones (GET) división correcta', async () => {
    return request(app.getHttpServer())
      .get('/operaciones')
      .query({ operacion: 'division', a: 63, b: 3 })
      .expect('Content-type', /application\/json/)
      .expect(200)
      .expect({ resultado: 21, mensaje: 'operación exitosa' }).then((res) => {
        expect(res.body.resultado).toBe(21);
        expect(res.body.mensaje).toBe('operación exitosa');
      });
  });

  it('/operaciones (GET) división (a=0)', async () => {
    return request(app.getHttpServer())
      .get('/operaciones')
      .query({ operacion: 'division', a: 0, b: 3 })
      .expect('Content-type', /application\/json/)
      .expect(200)
      .expect({ resultado: 0, mensaje: 'operación exitosa' }).then((res) => {
        expect(res.body.resultado).toBe(0);
        expect(res.body.mensaje).toBe('operación exitosa');
      });
  });


  it('/operaciones (GET) no definida', () => {
    return request(app.getHttpServer())
      .get('/operaciones')
      .query({ operacion: 'potencia', a: 10, b: 2 })
      .expect('Content-type', /application\/json/)
      .expect(422)
      .expect({ resultado: null, mensaje: 'operación indefinida' }); // NaN to null due to serialization
  });


  it('/operaciones (GET) división -> infinito', async () => {
    return request(app.getHttpServer())
      .get('/operaciones')
      .query({ operacion: 'division', a: 10, b: 0 })
      .expect('Content-type', /application\/json/)
      .expect(502)
      .expect({ resultado: null, mensaje: 'operación no pudo ser calculada'}).then((res) => { //Nan to null due to serialization
        expect(res.body.resultado).toBe(null);
        expect(res.body.mensaje).toBe('operación no pudo ser calculada');
      });
      
  });

  it('/operaciones (GET) resta con entradas indefinidas o nulas', () => {
    return request(app.getHttpServer())
      .get('/operaciones')
      .query({ operacion: 'resta', a: undefined, b: null })
      .expect('Content-type', /application\/json/)
      .expect(502)
      .expect({ resultado: null, mensaje: 'operación no pudo ser calculada' }); // NaN to null due to serialization
  });

  it('/operaciones (GET) multiplicación con valores no numéricos', () => {
    return request(app.getHttpServer())
      .get('/operaciones')
      .query({ operacion: 'multiplicacion', a: "30", b: "abc" })
      .expect('Content-type', /application\/json/)
      .expect(502)
      .expect({ resultado: null, mensaje: 'operación no pudo ser calculada' }); // NaN to null due to serialization
  });

});


