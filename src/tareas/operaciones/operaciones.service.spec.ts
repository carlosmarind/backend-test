import { Test, TestingModule } from '@nestjs/testing';
import { OperacionesService } from './operaciones.service';

describe('OperacionesService', () => {
  let service: OperacionesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OperacionesService],
    }).compile();

    service = module.get<OperacionesService>(OperacionesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // Tabla de pruebas para todas las operaciones
  const operacionesTest: {
    a: number;
    b: number;
    op: string;
    expected: number | undefined;
  }[] = [
    { a: 2, b: 3, op: 'suma', expected: 5 },
    { a: 5, b: 3, op: 'resta', expected: 2 },
    { a: 2, b: 3, op: 'multiplicacion', expected: 6 },
    { a: 6, b: 3, op: 'division', expected: 2 },
    { a: 6, b: 0, op: 'division', expected: NaN },
    { a: 0, b: 5, op: 'division', expected: 0 },
    { a: 1, b: 1, op: 'unknown', expected: undefined },
    { a: 4, b: 5, op: '', expected: undefined }, // default operation
  ];

  operacionesTest.forEach(({ a, b, op, expected }) => {
    it(`should return ${expected} for operar(${a}, ${b}, '${op}')`, () => {
      const result = service.operar(a, b, op);

      if (expected === undefined) {
        expect(result).toBeUndefined();
      } else if (typeof expected === 'number' && isNaN(expected)) {
        expect(result).toBeNaN();
      } else {
        expect(result).toBe(expected);
      }
    });
  });
});
