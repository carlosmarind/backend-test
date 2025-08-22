import { OperacionesService } from './operaciones.service';

describe('OperacionesService', () => {
  let service: OperacionesService;

  beforeEach(() => {
    service = new OperacionesService();
  });

  it('suma', () => expect(service.operar('suma', 2, 3)).toBe(5));
  it('resta', () => expect(service.operar('resta', 5, 3)).toBe(2));
  it('multiplicacion', () => expect(service.operar('multiplicacion', 2, 3)).toBe(6));
  it('division', () => expect(service.operar('division', 6, 3)).toBe(2));
  it('division entre cero', () => expect(service.operar('division', 6, 0)).toBeNaN());
  it('division de cero', () => expect(service.operar('division', 0, 5)).toBe(0));
  it('operacion invalida', () => expect(service.operar('potencia' as any, 2, 3)).toBeUndefined());
});
