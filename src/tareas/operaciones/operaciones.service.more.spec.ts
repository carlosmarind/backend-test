import { OperacionesService } from './operaciones.service';

describe('OperacionesService more', () => {
  const s = new OperacionesService();

  it('NaN en a => null', () => {
    expect(s.operar('suma', Number.NaN as any, 2)).toBeNull();
  });

  it('NaN en b => null', () => {
    expect(s.operar('suma', 2, Number.NaN as any)).toBeNull();
  });
});
