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

  /* Validar operaciones */
  it('/operaciones (GET) campo operacion no definido', () => {
    return request(app.getHttpServer())
      .get('/operaciones')
      .query({ operacions: 'sumas', a: 10, b: 30 })
      .expect(502)
      .expect((res) => {
        expect(res.body).toEqual({"resultado":null,"mensaje":"operacion no pudo ser calculada"});
      });
  });

  it('/operaciones (GET) operacion definida con valor no valido', () => {
    return request(app.getHttpServer())
      .get('/operaciones')
      .query({ operacion: 'sumas', a: 10, b: 30 })
      .expect(502)
      .expect((res) => {
        expect(res.body).toEqual({"resultado":null,"mensaje":"operacion no pudo ser calculada"});
      });
  });

  it('/operaciones (GET) operacion definida como numero', () => {
    return request(app.getHttpServer())
      .get('/operaciones')
      .query({ operacion: 123, a: 10, b: 30 })
      .expect(502)
      .expect((res) => {
        expect(res.body).toEqual({"resultado":null,"mensaje":"operacion no pudo ser calculada"});
      });
  });

  /* Validar sumas */
  it('/operaciones (GET)', () => {
    return request(app.getHttpServer())
      .get('/operaciones')
      .query({ operacion: 'suma', a: 10, b: 30 })
      .expect(200)
      .expect((res) => {
        expect(res.body).toEqual({"resultado":40,"mensaje":"operacion exitosa"});
      });
  });

  it('/operaciones (GET) suma con operador string', () => {
    return request(app.getHttpServer())
      .get('/operaciones')
      .query({ operacion: 'suma', a: 30, b: 'hola'})
      .expect(502) 
      .expect((res) => {
        expect(res.body).toEqual({"resultado":null,"mensaje":"operacion no pudo ser calculada"});
      });
  });

  it('/operaciones (GET) suma sin definir "b"', () => {
    return request(app.getHttpServer())
      .get('/operaciones')
      .query({ operacion: 'suma', a: 30})
      .expect(502) 
      .expect((res) => {
        expect(res.body).toEqual({"resultado":null,"mensaje":"operacion no pudo ser calculada"});
      });
  });

  it('/operaciones (GET) suma sin definir "a"', () => {
    return request(app.getHttpServer())
      .get('/operaciones')
      .query({ operacion: 'suma', b: 30})
      .expect(502) 
      .expect((res) => {
        expect(res.body).toEqual({"resultado":null,"mensaje":"operacion no pudo ser calculada"});
      });
  });

  it('/operaciones (GET) suma con b vacío/null', () => {
    return request(app.getHttpServer())
      .get('/operaciones')
      .query({ operacion: 'suma', a: 30, b: 'null' }) // simulamos null
      .expect(502)
      .expect((res) => {
        expect(res.body).toEqual({
          "resultado": null,
          "mensaje": 'operacion no pudo ser calculada',
        });
      });
  });

  it('/operaciones (GET) suma con a vacío/null', () => {
    return request(app.getHttpServer())
      .get('/operaciones')
      .query({ operacion: 'suma', a: 'null', b: 30 }) // simulamos null
      .expect(502)
      .expect((res) => {
        expect(res.body).toEqual({
          "resultado": null,
          "mensaje": 'operacion no pudo ser calculada',
        });
      });
  });




  /* Validar restas */
  it('/operaciones (GET) resta correcta', () => {
    return request(app.getHttpServer())
      .get('/operaciones')
      .query({ operacion: 'resta', a: 30, b: 10 })
      .expect(200) 
      .expect((res) => {
        expect(res.body).toEqual({"resultado":20,"mensaje":"operacion exitosa"});
      });
  });

  it('/operaciones (GET) resta con operador string', () => {
    return request(app.getHttpServer())
      .get('/operaciones')
      .query({ operacion: 'resta', a: 30, b: 'hola'})
      .expect(502) 
      .expect((res) => {
        expect(res.body).toEqual({"resultado":null,"mensaje":"operacion no pudo ser calculada"});
      });
  });

  it('/operaciones (GET) resta sin definir "b"', () => {
    return request(app.getHttpServer())
      .get('/operaciones')
      .query({ operacion: 'resta', a: 30})
      .expect(502) 
      .expect((res) => {
        expect(res.body).toEqual({"resultado":null,"mensaje":"operacion no pudo ser calculada"});
      });
  });

  it('/operaciones (GET) resta sin definir "a"', () => {
    return request(app.getHttpServer())
      .get('/operaciones')
      .query({ operacion: 'resta', b: 30})
      .expect(502) 
      .expect((res) => {
        expect(res.body).toEqual({"resultado":null,"mensaje":"operacion no pudo ser calculada"});
      });
  });

  it('/operaciones (GET) resta con b vacío/null', () => {
    return request(app.getHttpServer())
      .get('/operaciones')
      .query({ operacion: 'resta', a: 30, b: 'null' }) // simulamos null
      .expect(502)
      .expect((res) => {
        expect(res.body).toEqual({
          "resultado": null,
          "mensaje": 'operacion no pudo ser calculada',
        });
      });
  });

  it('/operaciones (GET) resta con a vacío/null', () => {
    return request(app.getHttpServer())
      .get('/operaciones')
      .query({ operacion: 'resta', a: 'null', b: 30 }) // simulamos null
      .expect(502)
      .expect((res) => {
        expect(res.body).toEqual({
          "resultado": null,
          "mensaje": 'operacion no pudo ser calculada',
        });
      });
  });



  /* Validar multiplicaciones */
  it('/operaciones (GET) multiplicacion correcta', () => {
    return request(app.getHttpServer())
      .get('/operaciones')
      .query({ operacion: 'multiplicacion', a: 30, b: 10 })
      .expect(200) 
      .expect((res) => {
        expect(res.body).toEqual({"resultado":300,"mensaje":"operacion exitosa"});
      });
  });

  it('/operaciones (GET) multiplicacion con operador string', () => {
    return request(app.getHttpServer())
      .get('/operaciones')
      .query({ operacion: 'multiplicacion', a: 30, b: 'hola'})
      .expect(502) 
      .expect((res) => {
        expect(res.body).toEqual({"resultado":null,"mensaje":"operacion no pudo ser calculada"});
      });
  });

  it('/operaciones (GET) multiplicacion sin definir "b"', () => {
    return request(app.getHttpServer())
      .get('/operaciones')
      .query({ operacion: 'multiplicacion', a: 30})
      .expect(502) 
      .expect((res) => {
        expect(res.body).toEqual({"resultado":null,"mensaje":"operacion no pudo ser calculada"});
      });
  });

  it('/operaciones (GET) multiplicacion sin definir "a"', () => {
    return request(app.getHttpServer())
      .get('/operaciones')
      .query({ operacion: 'multiplicacion', b: 30})
      .expect(502) 
      .expect((res) => {
        expect(res.body).toEqual({"resultado":null,"mensaje":"operacion no pudo ser calculada"});
      });
  });

  it('/operaciones (GET) multiplicacion con b vacío/null', () => {
    return request(app.getHttpServer())
      .get('/operaciones')
      .query({ operacion: 'multiplicacion', a: 30, b: 'null' }) // simulamos null
      .expect(502)
      .expect((res) => {
        expect(res.body).toEqual({
          "resultado": null,
          "mensaje": 'operacion no pudo ser calculada',
        });
      });
  });

  it('/operaciones (GET) multiplicacion con a vacío/null', () => {
    return request(app.getHttpServer())
      .get('/operaciones')
      .query({ operacion: 'multiplicacion', a: 'null', b: 30 }) // simulamos null
      .expect(502)
      .expect((res) => {
        expect(res.body).toEqual({
          "resultado": null,
          "mensaje": 'operacion no pudo ser calculada',
        });
      });
  });



  /* Validar divisiones */
  it('/operaciones (GET) division correcta', () => {
    return request(app.getHttpServer())
      .get('/operaciones')
      .query({ operacion: 'division', a: 30, b: 10 })
      .expect(200) 
      .expect((res) => {
        expect(res.body).toEqual({"resultado":3,"mensaje":"operacion exitosa"});
      });
  });

  it('/operaciones (GET) division dividendo = 0', () => {
    return request(app.getHttpServer())
      .get('/operaciones')
      .query({ operacion: 'division', a: 0, b: 10 })
      .expect(200) 
      .expect((res) => {
        expect(res.body).toEqual({"resultado":0,"mensaje":"operacion exitosa"});
      });
  });

  it('/operaciones (GET) division con divisor = 0 ', () => {
    return request(app.getHttpServer())
      .get('/operaciones')
      .query({ operacion: 'division', a: 30, b: 0})
      .expect(502) 
      .expect((res) => {
        expect(res.body).toEqual({"resultado":null,"mensaje":"operacion no pudo ser calculada"});
      });
  });

  it('/operaciones (GET) division con operador string', () => {
    return request(app.getHttpServer())
      .get('/operaciones')
      .query({ operacion: 'division', a: 30, b: 'hola'})
      .expect(502) 
      .expect((res) => {
        expect(res.body).toEqual({"resultado":null,"mensaje":"operacion no pudo ser calculada"});
      });
  });

  it('/operaciones (GET) division sin definir "b"', () => {
    return request(app.getHttpServer())
      .get('/operaciones')
      .query({ operacion: 'division', a: 30})
      .expect(502) 
      .expect((res) => {
        expect(res.body).toEqual({"resultado":null,"mensaje":"operacion no pudo ser calculada"});
      });
  });

  it('/operaciones (GET) division sin definir "a"', () => {
    return request(app.getHttpServer())
      .get('/operaciones')
      .query({ operacion: 'division', b: 30})
      .expect(502) 
      .expect((res) => {
        expect(res.body).toEqual({"resultado":null,"mensaje":"operacion no pudo ser calculada"});
      });
  });

  it('/operaciones (GET) division con b vacío/null', () => {
    return request(app.getHttpServer())
      .get('/operaciones')
      .query({ operacion: 'division', a: 30, b: 'null' }) // simulamos null
      .expect(502)
      .expect((res) => {
        expect(res.body).toEqual({
          "resultado": null,
          "mensaje": 'operacion no pudo ser calculada',
        });
      });
  });

  it('/operaciones (GET) division con a vacío/null', () => {
    return request(app.getHttpServer())
      .get('/operaciones')
      .query({ operacion: 'division', a: 'null', b: 30 }) // simulamos null
      .expect(502)
      .expect((res) => {
        expect(res.body).toEqual({
          "resultado": null,
          "mensaje": 'operacion no pudo ser calculada',
        });
      });
  });

});