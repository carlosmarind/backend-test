import { OperacionesService } from './operaciones.service';

describe('OperacionesService', () => {
  let service: OperacionesService;

  beforeEach(() => {
    service = new OperacionesService();
  });

  it('debería sumar correctamente', () => {
    expect(service.operar('suma', 2, 3)).toBe(5);
  });

  it('debería restar correctamente', () => {
    expect(service.operar('resta', 5, 3)).toBe(2);
  });

  it('debería multiplicar correctamente', () => {
    expect(service.operar('multiplicacion', 2, 3)).toBe(6);
  });

  it('debería dividir correctamente', () => {
    expect(service.operar('division', 6, 2)).toBe(3);
  });

  it('debería manejar división por cero', () => {
    expect(service.operar('division', 6, 0)).toBeNaN();
    expect(service.operar('division', 0, 2)).toBe(0);
  });

  it('operación desconocida devuelve undefined', () => {
    expect(service.operar('potencia', 2, 3)).toBeUndefined();
  });
});
