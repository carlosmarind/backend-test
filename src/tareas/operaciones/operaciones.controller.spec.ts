import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../../app.module';
import { OperacionesController } from './operaciones.controller';
import { OperacionesService } from './operaciones.service';
import { Response } from 'express';

describe('OperacionesController', () => {
  let controller: OperacionesController;
  let service: OperacionesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OperacionesController],
      providers: [OperacionesService],
    }).compile();

    controller = module.get<OperacionesController>(OperacionesController);
    service = module.get<OperacionesService>(OperacionesService);
  });

  describe('operar', () => {
    let mockResponse: Partial<Response>;

    beforeEach(() => {
      mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };
    });

    it('should return 200 with result when operation is successful', () => {
      const result = 15;
      jest.spyOn(service, 'operar').mockReturnValue(result);

      controller.operar(mockResponse as Response, 'suma', 10, 5);

      expect(service.operar).toHaveBeenCalledWith('suma', 10, 5);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        resultado: result,
        mensaje: 'operacion exitosa',
      });
    });

    it('should return 502 when operation returns undefined', () => {
      jest.spyOn(service, 'operar').mockReturnValue(undefined);

      controller.operar(mockResponse as Response, 'invalid', 10, 5);

      expect(service.operar).toHaveBeenCalledWith('invalid', 10, 5);
      expect(mockResponse.status).toHaveBeenCalledWith(502);
      expect(mockResponse.json).toHaveBeenCalledWith({
        resultado: NaN,
        mensaje: 'operacion no pudo ser calculada',
      });
    });

    it('should return 502 when operation returns null', () => {
      jest.spyOn(service, 'operar').mockReturnValue(null as any);

      controller.operar(mockResponse as Response, 'null', 10, 5);

      expect(service.operar).toHaveBeenCalledWith('null', 10, 5);
      expect(mockResponse.status).toHaveBeenCalledWith(502);
      expect(mockResponse.json).toHaveBeenCalledWith({
        resultado: NaN,
        mensaje: 'operacion no pudo ser calculada',
      });
    });

    it('should return 502 when operation returns NaN', () => {
      jest.spyOn(service, 'operar').mockReturnValue(NaN);

      controller.operar(mockResponse as Response, 'division', 10, 0);

      expect(service.operar).toHaveBeenCalledWith('division', 10, 0);
      expect(mockResponse.status).toHaveBeenCalledWith(502);
      expect(mockResponse.json).toHaveBeenCalledWith({
        resultado: NaN,
        mensaje: 'operacion no pudo ser calculada',
      });
    });

    it('should handle zero result as successful operation', () => {
      jest.spyOn(service, 'operar').mockReturnValue(0);

      controller.operar(mockResponse as Response, 'resta', 5, 5);

      expect(service.operar).toHaveBeenCalledWith('resta', 5, 5);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        resultado: 0,
        mensaje: 'operacion exitosa',
      });
    });

    it('should handle negative result as successful operation', () => {
      jest.spyOn(service, 'operar').mockReturnValue(-10);

      controller.operar(mockResponse as Response, 'resta', 5, 15);

      expect(service.operar).toHaveBeenCalledWith('resta', 5, 15);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        resultado: -10,
        mensaje: 'operacion exitosa',
      });
    });

    it('should handle decimal result as successful operation', () => {
      jest.spyOn(service, 'operar').mockReturnValue(2.5);

      controller.operar(mockResponse as Response, 'division', 5, 2);

      expect(service.operar).toHaveBeenCalledWith('division', 5, 2);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        resultado: 2.5,
        mensaje: 'operacion exitosa',
      });
    });
  });
});

describe('OperacionesController (e2e)', () => {
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

  describe('GET /operaciones', () => {
    describe('suma operation', () => {
      it('should return 200 with sum result', () => {
        return request(app.getHttpServer())
          .get('/operaciones')
          .query({ operacion: 'suma', a: 10, b: 30 })
          .expect(200)
          .expect((res) => {
            expect(res.body).toEqual({
              resultado: 40,
              mensaje: 'operacion exitosa',
            });
          });
      });

      it('should handle negative numbers in sum', () => {
        return request(app.getHttpServer())
          .get('/operaciones')
          .query({ operacion: 'suma', a: -10, b: 5 })
          .expect(200)
          .expect((res) => {
            expect(res.body).toEqual({
              resultado: -5,
              mensaje: 'operacion exitosa',
            });
          });
      });

      it('should handle decimal numbers in sum', () => {
        return request(app.getHttpServer())
          .get('/operaciones')
          .query({ operacion: 'suma', a: 1.5, b: 2.3 })
          .expect(200)
          .expect((res) => {
            expect(res.body.resultado).toBeCloseTo(3.8);
            expect(res.body.mensaje).toBe('operacion exitosa');
          });
      });
    });

    describe('resta operation', () => {
      it('should return 200 with subtraction result', () => {
        return request(app.getHttpServer())
          .get('/operaciones')
          .query({ operacion: 'resta', a: 30, b: 10 })
          .expect(200)
          .expect((res) => {
            expect(res.body).toEqual({
              resultado: 20,
              mensaje: 'operacion exitosa',
            });
          });
      });

      it('should handle negative result in subtraction', () => {
        return request(app.getHttpServer())
          .get('/operaciones')
          .query({ operacion: 'resta', a: 5, b: 10 })
          .expect(200)
          .expect((res) => {
            expect(res.body).toEqual({
              resultado: -5,
              mensaje: 'operacion exitosa',
            });
          });
      });
    });

    describe('multiplicacion operation', () => {
      it('should return 200 with multiplication result', () => {
        return request(app.getHttpServer())
          .get('/operaciones')
          .query({ operacion: 'multiplicacion', a: 5, b: 4 })
          .expect(200)
          .expect((res) => {
            expect(res.body).toEqual({
              resultado: 20,
              mensaje: 'operacion exitosa',
            });
          });
      });

      it('should handle zero in multiplication', () => {
        return request(app.getHttpServer())
          .get('/operaciones')
          .query({ operacion: 'multiplicacion', a: 0, b: 10 })
          .expect(200)
          .expect((res) => {
            expect(res.body).toEqual({
              resultado: 0,
              mensaje: 'operacion exitosa',
            });
          });
      });

      it('should handle negative numbers in multiplication', () => {
        return request(app.getHttpServer())
          .get('/operaciones')
          .query({ operacion: 'multiplicacion', a: -3, b: 4 })
          .expect(200)
          .expect((res) => {
            expect(res.body).toEqual({
              resultado: -12,
              mensaje: 'operacion exitosa',
            });
          });
      });
    });

    describe('division operation', () => {
      it('should return 200 with division result', () => {
        return request(app.getHttpServer())
          .get('/operaciones')
          .query({ operacion: 'division', a: 20, b: 4 })
          .expect(200)
          .expect((res) => {
            expect(res.body).toEqual({
              resultado: 5,
              mensaje: 'operacion exitosa',
            });
          });
      });

      it('should return 502 when dividing by zero', () => {
        return request(app.getHttpServer())
          .get('/operaciones')
          .query({ operacion: 'division', a: 10, b: 0 })
          .expect(502)
          .expect((res) => {
            expect(res.body).toEqual({
              resultado: null,
              mensaje: 'operacion no pudo ser calculada',
            });
          });
      });

      it('should return 200 when dividing zero by number', () => {
        return request(app.getHttpServer())
          .get('/operaciones')
          .query({ operacion: 'division', a: 0, b: 5 })
          .expect(200)
          .expect((res) => {
            expect(res.body).toEqual({
              resultado: 0,
              mensaje: 'operacion exitosa',
            });
          });
      });

      it('should handle decimal division', () => {
        return request(app.getHttpServer())
          .get('/operaciones')
          .query({ operacion: 'division', a: 5, b: 2 })
          .expect(200)
          .expect((res) => {
            expect(res.body).toEqual({
              resultado: 2.5,
              mensaje: 'operacion exitosa',
            });
          });
      });
    });

    describe('invalid operation', () => {
      it('should return 502 for unknown operation', () => {
        return request(app.getHttpServer())
          .get('/operaciones')
          .query({ operacion: 'invalid', a: 10, b: 5 })
          .expect(502)
          .expect((res) => {
            expect(res.body).toEqual({
              resultado: null,
              mensaje: 'operacion no pudo ser calculada',
            });
          });
      });

      it('should return 502 for empty operation', () => {
        return request(app.getHttpServer())
          .get('/operaciones')
          .query({ operacion: '', a: 10, b: 5 })
          .expect(502)
          .expect((res) => {
            expect(res.body).toEqual({
              resultado: null,
              mensaje: 'operacion no pudo ser calculada',
            });
          });
      });

      it('should return 502 for missing operation parameter', () => {
        return request(app.getHttpServer())
          .get('/operaciones')
          .query({ a: 10, b: 5 })
          .expect(502)
          .expect((res) => {
            expect(res.body).toEqual({
              resultado: null,
              mensaje: 'operacion no pudo ser calculada',
            });
          });
      });
    });

    describe('invalid parameters', () => {
      it('should return 502 for missing parameter a', () => {
        return request(app.getHttpServer())
          .get('/operaciones')
          .query({ operacion: 'suma', b: 5 })
          .expect(502)
          .expect((res) => {
            expect(res.body).toEqual({
              resultado: null,
              mensaje: 'operacion no pudo ser calculada',
            });
          });
      });

      it('should return 502 for missing parameter b', () => {
        return request(app.getHttpServer())
          .get('/operaciones')
          .query({ operacion: 'suma', a: 10 })
          .expect(502)
          .expect((res) => {
            expect(res.body).toEqual({
              resultado: null,
              mensaje: 'operacion no pudo ser calculada',
            });
          });
      });

      it('should return 502 for missing both parameters', () => {
        return request(app.getHttpServer())
          .get('/operaciones')
          .query({ operacion: 'suma' })
          .expect(502)
          .expect((res) => {
            expect(res.body).toEqual({
              resultado: null,
              mensaje: 'operacion no pudo ser calculada',
            });
          });
      });

      it('should return 502 for non-numeric parameter a', () => {
        return request(app.getHttpServer())
          .get('/operaciones')
          .query({ operacion: 'suma', a: 'abc', b: 5 })
          .expect(502)
          .expect((res) => {
            expect(res.body).toEqual({
              resultado: null,
              mensaje: 'operacion no pudo ser calculada',
            });
          });
      });

      it('should return 502 for non-numeric parameter b', () => {
        return request(app.getHttpServer())
          .get('/operaciones')
          .query({ operacion: 'suma', a: 10, b: 'xyz' })
          .expect(502)
          .expect((res) => {
            expect(res.body).toEqual({
              resultado: null,
              mensaje: 'operacion no pudo ser calculada',
            });
          });
      });

      it('should handle very large numbers', () => {
        return request(app.getHttpServer())
          .get('/operaciones')
          .query({ operacion: 'suma', a: 999999999999, b: 1 })
          .expect(200)
          .expect((res) => {
            expect(res.body.resultado).toEqual(1000000000000);
            expect(res.body.mensaje).toBe('operacion exitosa');
          });
      });

      it('should handle scientific notation', () => {
        return request(app.getHttpServer())
          .get('/operaciones')
          .query({ operacion: 'suma', a: '1e2', b: '5e1' })
          .expect(200)
          .expect((res) => {
            expect(res.body.resultado).toEqual(150);
            expect(res.body.mensaje).toBe('operacion exitosa');
          });
      });
    });
  });
});
