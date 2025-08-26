import { OperacionesService } from './operaciones.service';

describe('OperacionesService extra', () => {
  let s: OperacionesService;

  beforeEach(() => {
    s = new OperacionesService();
  });

  it('suma', () => { expect(s.operar('suma', 2, 3)).toBe(5); });
  it('resta', () => { expect(s.operar('resta', 3, 2)).toBe(1); });
  it('multiplicar', () => { expect(s.operar('multiplicar', -4, 3)).toBe(-12); });
  it('dividir', () => { expect(s.operar('dividir', 10, 2)).toBe(5); });

  it('dividir por 0 devuelve valor no válido', () => {
    const r = s.operar('dividir', 10, 0);
    expect(typeof r === 'number' && isFinite(r)).toBe(false);
  });

  it('operación inválida devuelve valor no válido', () => {
    const r = s.operar('xyz', 1, 2);
    expect(typeof r === 'number' && isFinite(r)).toBe(false);
  });
});
