import { OperacionesService } from './operaciones.service';

describe('OperacionesService boundary', () => {
  const s = new OperacionesService();

  it('dividir negativos (-10 / -2) => 5', () => {
    expect(s.operar('dividir', -10, -2)).toBe(5);
  });

  it('resta con mismo número (10 - 10) => 0', () => {
    expect(s.operar('resta', 10, 10)).toBe(0);
  });

  it('suma con decimales (1.5 + 2.25) => 3.75', () => {
    expect(s.operar('suma', 1.5 as any, 2.25 as any)).toBe(3.75);
  });
});
