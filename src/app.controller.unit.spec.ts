import { AppController } from './app.controller';
import { AppService } from './app.service';

function makeRes() {
  const obj: any = {
    statusCode: 0,
    body: undefined,
    status(code: number) { this.statusCode = code; return this; },
    json(payload: any) { this.body = payload; return this; },
  };
  return obj;
}

describe('AppController (unit)', () => {
  let ctrl: AppController;

  beforeEach(() => {
    const mockCfg = { username: 'jest-user', apikey: 'jest-key' } as any;
    const service = new AppService(mockCfg);
    ctrl = new AppController(service);
  });

  it('getHello contiene Hello', () => {
    expect(ctrl.getHello()).toContain('Hello');
  });

  it('getApikey retorna valor con !!', () => {
    expect(ctrl.getApikey()).toBe('jest-key!!');
  });

  it('validate-rut válido responde 200', () => {
    const res = makeRes();
    ctrl.validateRut(res as any, '12.345.678-5');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ mensaje: 'rut valido' });
  });

  it('validate-rut inválido responde 400', () => {
    const res = makeRes();
    ctrl.validateRut(res as any, '12.345.678-9');
    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ mensaje: 'rut invalido' });
  });
});
