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

describe('OperacionesController inputs (unit)', () => {
  let ctrl: OperacionesController;

  beforeEach(() => {
    ctrl = new OperacionesController(new OperacionesService());
  });

  it('coerciona strings "2" y "3" => 5 (200)', () => {
    const res = makeRes();
    ctrl.operar(res, 'suma', '2' as any, '3' as any);
    expect(res.statusCode).toBe(200);
    expect((res as any).payload).toEqual({ resultado: 5, mensaje: 'operacion exitosa' });
  });

  it('falta "operacion" => 502 y NaN', () => {
    const res = makeRes();
    ctrl.operar(res, undefined as any, '2' as any, '3' as any);
    expect(res.statusCode).toBe(502);
    expect((res as any).payload).toEqual({ resultado: NaN, mensaje: 'operacion no pudo ser calculada' });
  });

  it('falta "a" => 502 y NaN', () => {
    const res = makeRes();
    ctrl.operar(res, 'suma', undefined as any, '3' as any);
    expect(res.statusCode).toBe(502);
    expect((res as any).payload).toEqual({ resultado: NaN, mensaje: 'operacion no pudo ser calculada' });
  });
});
