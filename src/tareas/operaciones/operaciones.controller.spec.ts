import { Test, TestingModule } from '@nestjs/testing';
import { OperacionesController } from './operaciones.controller';
import { OperacionesService } from './operaciones.service';
import { Response } from 'express';

describe('OperacionesController', () => {
  let controller: OperacionesController;

  const mockResponse = () => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res as Response;
};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OperacionesController],
      providers: [OperacionesService],
    }).compile();

    controller = module.get<OperacionesController>(OperacionesController);
  });

  it('retorna 200 para operacion valida', () => {
    const res = mockResponse();
    controller.operar(res, 'suma', 2, 3);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      resultado: 5,
      mensaje: 'operacion exitosa',
    });
  });

  it('retorna 502 para operacion invalida', () => {
    const res = mockResponse();
    controller.operar(res, 'potencia', 2, 3);
    expect(res.status).toHaveBeenCalledWith(502);
    expect(res.json).toHaveBeenCalledWith({
      resultado: NaN,
      mensaje: 'operacion no pudo ser calculada',
    });
  });
});
