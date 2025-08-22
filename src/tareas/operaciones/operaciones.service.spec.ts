import { OperacionesService } from './operaciones.service';

describe('OperacionesService', () => {
  let service: OperacionesService;

  beforeEach(() => {
    service = new OperacionesService();
  });

  it('debe sumar correctamente', () => {
    expect(service.operar('suma', 2, 3)).toBe(5);
  });

  it('debe restar correctamente', () => {
    expect(service.operar('resta', 5, 3)).toBe(2);
  });

  it('debe multiplicar correctamente', () => {
    expect(service.operar('multiplicacion', 2, 3)).toBe(6);
  });

  it('debe dividir correctamente', () => {
    expect(service.operar('division', 6, 3)).toBe(2);
  });

  it('division entre cero retorna NaN', () => {
    expect(service.operar('division', 6, 0)).toBeNaN();
  });

  it('division de cero retorna cero', () => {
    expect(service.operar('division', 0, 5)).toBe(0);
  });

  it('operacion no valida retorna undefined', () => {
    expect(service.operar('potencia', 2, 3)).toBeUndefined();
  });
});
