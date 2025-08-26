import { OperacionesController } from './operaciones.controller';
import { OperacionesService } from './operaciones.service';
import { Response } from 'express';

function makeRes(): Response {
  const obj: any = {
    statusCode: 0,
    payload: undefined,
    status(code: number) { this.statusCode = code; return this; },
    json(body: any) { this.payload = body; return this; },
  };
  return obj as Response;
}

describe('OperacionesController more (unit)', () => {
  let ctrl: OperacionesController;

  beforeEach(() => {
    ctrl = new OperacionesController(new OperacionesService());
  });

  it('suma 1 + (-1) = 0 responde 200', () => {
    const res = makeRes();
    ctrl.operar(res, 'suma', 1 as any, -1 as any);
    expect(res.statusCode).toBe(200);
    expect((res as any).payload).toEqual({ resultado: 0, mensaje: 'operacion exitosa' });
  });

  it('operación desconocida responde 502', () => {
    const res = makeRes();
    ctrl.operar(res, 'desconocida', 1 as any, 2 as any);
    expect(res.statusCode).toBe(502);
    expect((res as any).payload).toEqual({ resultado: NaN, mensaje: 'operacion no pudo ser calculada' });
  });

  it('dividir por 0 responde 502', () => {
    const res = makeRes();
    ctrl.operar(res, 'dividir', 10 as any, 0 as any);
    expect(res.statusCode).toBe(502);
    expect((res as any).payload).toEqual({ resultado: NaN, mensaje: 'operacion no pudo ser calculada' });
  });
});
