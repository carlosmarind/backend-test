import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../app.module';

describe('App e2e', () => {
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

  it('GET / responde 200 y contiene Hello', async () => {
    await request(app.getHttpServer()).get('/').expect(200).expect(/Hello/);
  });

  it('GET /apikey responde 200 y termina en !!', async () => {
    const res = await request(app.getHttpServer()).get('/apikey');
    expect(res.status).toBe(200);
    expect(res.text.endsWith('!!')).toBe(true);
  });

  it('GET /validate-rut válido con puntos y guion', async () => {
    const res = await request(app.getHttpServer()).get('/validate-rut').query({ rut: '12.345.678-5' });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ mensaje: 'rut valido' });
  });

  it('GET /validate-rut válido sin puntos', async () => {
    const res = await request(app.getHttpServer()).get('/validate-rut').query({ rut: '12345678-5' });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ mensaje: 'rut valido' });
  });

  it('GET /validate-rut dv incorrecto', async () => {
    const res = await request(app.getHttpServer()).get('/validate-rut').query({ rut: '12.345.678-9' });
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ mensaje: 'rut invalido' });
  });

  it('GET /validate-rut sin rut', async () => {
    const res = await request(app.getHttpServer()).get('/validate-rut');
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ mensaje: 'rut invalido' });
  });

  it('/validate-rut válido (GET)', () => {
    return request(app.getHttpServer())
      .get('/validate-rut?rut=12.345.678-5')
      .expect(200)
      .expect({ mensaje: 'rut valido' });
  });

  it('/validate-rut inválido (GET)', () => {
    return request(app.getHttpServer())
      .get('/validate-rut?rut=12.345.678-9')
      .expect(400)
      .expect({ mensaje: 'rut invalido' });
  });



});
