import { Test, TestingModule } from '@nestjs/testing';
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

  it('debería retornar resultado correcto cuando la operación es válida', () => {
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    jest.spyOn(service, 'operar').mockReturnValue(5);

    controller.operar(res, 'suma', 2, 3);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      resultado: 5,
      mensaje: 'operacion exitosa',
    });
  });

  it('debería retornar error cuando la operación no es válida', () => {
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    jest.spyOn(service, 'operar').mockReturnValue(undefined);

    controller.operar(res, 'potencia', 2, 3);

    expect(res.status).toHaveBeenCalledWith(502);
    expect(res.json).toHaveBeenCalledWith({
      resultado: null,
      mensaje: 'operacion no pudo ser calculada',
    });
  });

  it('debería retornar NaN si el service devuelve NaN', () => {
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    jest.spyOn(service, 'operar').mockReturnValue(NaN);

    controller.operar(res, 'division', 10, 0);

    expect(res.status).toHaveBeenCalledWith(502);
    expect(res.json).toHaveBeenCalledWith({
      resultado: null,
      mensaje: 'operacion no pudo ser calculada',
    });
  });
});
