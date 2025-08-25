import { OperacionesService } from './operaciones.service';

describe('OperacionesService', () => {
  let service: OperacionesService;

  beforeEach(() => {
    service = new OperacionesService();
  });

  it('debería sumar correctamente', () => {
    expect(service.operar('suma', 3, 2)).toBe(5);
  });

  it('debería restar correctamente', () => {
    expect(service.operar('resta', 5, 2)).toBe(3);
  });

  it('debería multiplicar correctamente', () => {
    expect(service.operar('multiplicacion', 3, 4)).toBe(12);
  });

  it('debería dividir correctamente', () => {
    expect(service.operar('division', 10, 2)).toBe(5);
  });

  it('debería devolver NaN si división por cero', () => {
    expect(service.operar('division', 10, 0)).toBeNaN();
  });

  it('debería devolver 0 si se divide 0 entre algo', () => {
    expect(service.operar('division', 0, 5)).toBe(0);
  });

  it('debería devolver undefined para operación desconocida', () => {
    expect(service.operar('potencia', 2, 3)).toBeUndefined();
  });
});
