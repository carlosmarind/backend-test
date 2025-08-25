import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../../src/app.module';
import { OperacionesService } from '../../../src/tareas/operaciones/operaciones.service';

describe('OperacionesController (e2e)', () => {
  let app: INestApplication;
  let operService: OperacionesService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    operService = app.get<OperacionesService>(OperacionesService);
  });

  it('/operaciones (GET) - caso exitoso', async () => {
    return request(app.getHttpServer())
      .get('/operaciones')
      .query({ operacion: 'suma', a: 10, b: 30 })
      .expect(200)
      .expect(({ body }) => {
        expect(body.mensaje).toBe('operacion exitosa');
      });
  });

  it('/operaciones (GET) - operación inválida', async () => {
    // simulamos que el service devuelve undefined
    jest.spyOn(operService, 'operar').mockReturnValue(undefined);

    return request(app.getHttpServer())
      .get('/operaciones')
      .query({ operacion: 'resta-invalida', a: 10, b: 30 })
      .expect(502)
      .expect(({ body }) => {
        expect(body.mensaje).toBe('operacion no pudo ser calculada');
      });
  });
});
