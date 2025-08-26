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

  describe('operar', () => {
    describe('suma operation', () => {
      it('should return sum of two positive numbers', () => {
        expect(service.operar('suma', 5, 3)).toBe(8);
      });

      it('should return sum of two negative numbers', () => {
        expect(service.operar('suma', -5, -3)).toBe(-8);
      });

      it('should return sum of positive and negative numbers', () => {
        expect(service.operar('suma', 5, -3)).toBe(2);
        expect(service.operar('suma', -5, 3)).toBe(-2);
      });

      it('should return sum with zero', () => {
        expect(service.operar('suma', 0, 5)).toBe(5);
        expect(service.operar('suma', 5, 0)).toBe(5);
        expect(service.operar('suma', 0, 0)).toBe(0);
      });

      it('should return sum of decimal numbers', () => {
        expect(service.operar('suma', 1.5, 2.3)).toBeCloseTo(3.8);
        expect(service.operar('suma', 0.1, 0.2)).toBeCloseTo(0.3);
      });

      it('should return sum of very large numbers', () => {
        expect(service.operar('suma', 999999999999, 1)).toBe(1000000000000);
      });

      it('should handle Infinity', () => {
        expect(service.operar('suma', Infinity, 5)).toBe(Infinity);
        expect(service.operar('suma', 5, Infinity)).toBe(Infinity);
        expect(service.operar('suma', Infinity, Infinity)).toBe(Infinity);
      });

      it('should handle NaN inputs', () => {
        expect(service.operar('suma', NaN, 5)).toBeNaN();
        expect(service.operar('suma', 5, NaN)).toBeNaN();
        expect(service.operar('suma', NaN, NaN)).toBeNaN();
      });
    });

    describe('resta operation', () => {
      it('should return difference of two positive numbers', () => {
        expect(service.operar('resta', 8, 3)).toBe(5);
        expect(service.operar('resta', 3, 8)).toBe(-5);
      });

      it('should return difference of two negative numbers', () => {
        expect(service.operar('resta', -5, -3)).toBe(-2);
        expect(service.operar('resta', -3, -5)).toBe(2);
      });

      it('should return difference of positive and negative numbers', () => {
        expect(service.operar('resta', 5, -3)).toBe(8);
        expect(service.operar('resta', -5, 3)).toBe(-8);
      });

      it('should return difference with zero', () => {
        expect(service.operar('resta', 5, 0)).toBe(5);
        expect(service.operar('resta', 0, 5)).toBe(-5);
        expect(service.operar('resta', 0, 0)).toBe(0);
      });

      it('should return difference of decimal numbers', () => {
        expect(service.operar('resta', 5.5, 2.3)).toBeCloseTo(3.2);
        expect(service.operar('resta', 0.3, 0.1)).toBeCloseTo(0.2);
      });

      it('should handle same numbers', () => {
        expect(service.operar('resta', 5, 5)).toBe(0);
        expect(service.operar('resta', -5, -5)).toBe(0);
      });

      it('should handle Infinity', () => {
        expect(service.operar('resta', Infinity, 5)).toBe(Infinity);
        expect(service.operar('resta', 5, Infinity)).toBe(-Infinity);
      });

      it('should handle NaN inputs', () => {
        expect(service.operar('resta', NaN, 5)).toBeNaN();
        expect(service.operar('resta', 5, NaN)).toBeNaN();
      });
    });

    describe('multiplicacion operation', () => {
      it('should return product of two positive numbers', () => {
        expect(service.operar('multiplicacion', 4, 3)).toBe(12);
      });

      it('should return product of two negative numbers', () => {
        expect(service.operar('multiplicacion', -4, -3)).toBe(12);
      });

      it('should return product of positive and negative numbers', () => {
        expect(service.operar('multiplicacion', 4, -3)).toBe(-12);
        expect(service.operar('multiplicacion', -4, 3)).toBe(-12);
      });

      it('should return product with zero', () => {
        expect(service.operar('multiplicacion', 0, 5)).toBe(0);
        expect(service.operar('multiplicacion', 5, 0)).toBe(0);
        expect(service.operar('multiplicacion', 0, 0)).toBe(0);
      });

      it('should return product with one', () => {
        expect(service.operar('multiplicacion', 1, 5)).toBe(5);
        expect(service.operar('multiplicacion', 5, 1)).toBe(5);
        expect(service.operar('multiplicacion', 1, 1)).toBe(1);
      });

      it('should return product of decimal numbers', () => {
        expect(service.operar('multiplicacion', 2.5, 4)).toBe(10);
        expect(service.operar('multiplicacion', 0.5, 0.4)).toBeCloseTo(0.2);
      });

      it('should handle very small numbers', () => {
        expect(service.operar('multiplicacion', 0.0001, 0.0001)).toBeCloseTo(0.00000001);
      });

      it('should handle Infinity', () => {
        expect(service.operar('multiplicacion', Infinity, 5)).toBe(Infinity);
        expect(service.operar('multiplicacion', 5, Infinity)).toBe(Infinity);
        expect(service.operar('multiplicacion', Infinity, 0)).toBeNaN();
      });

      it('should handle NaN inputs', () => {
        expect(service.operar('multiplicacion', NaN, 5)).toBeNaN();
        expect(service.operar('multiplicacion', 5, NaN)).toBeNaN();
      });
    });

    describe('division operation', () => {
      it('should return quotient of two positive numbers', () => {
        expect(service.operar('division', 12, 3)).toBe(4);
        expect(service.operar('division', 5, 2)).toBe(2.5);
      });

      it('should return quotient of two negative numbers', () => {
        expect(service.operar('division', -12, -3)).toBe(4);
      });

      it('should return quotient of positive and negative numbers', () => {
        expect(service.operar('division', 12, -3)).toBe(-4);
        expect(service.operar('division', -12, 3)).toBe(-4);
      });

      it('should return 0 when dividing zero by any number', () => {
        expect(service.operar('division', 0, 5)).toBe(0);
        expect(service.operar('division', 0, -5)).toBe(0);
        expect(service.operar('division', 0, 0.5)).toBe(0);
      });

      it('should return NaN when dividing by zero', () => {
        expect(service.operar('division', 5, 0)).toBeNaN();
        expect(service.operar('division', -5, 0)).toBeNaN();
        expect(service.operar('division', 0.5, 0)).toBeNaN();
      });

      it('should return quotient with one', () => {
        expect(service.operar('division', 5, 1)).toBe(5);
        expect(service.operar('division', -5, 1)).toBe(-5);
      });

      it('should return quotient of decimal numbers', () => {
        expect(service.operar('division', 7.5, 2.5)).toBe(3);
        expect(service.operar('division', 1, 3)).toBeCloseTo(0.3333333333333333);
      });

      it('should handle very large numbers', () => {
        expect(service.operar('division', 1000000000000, 1000000)).toBe(1000000);
      });

      it('should handle very small numbers', () => {
        expect(service.operar('division', 0.0001, 0.01)).toBeCloseTo(0.01);
      });

      it('should handle Infinity', () => {
        expect(service.operar('division', Infinity, 5)).toBe(Infinity);
        expect(service.operar('division', 5, Infinity)).toBe(0);
        expect(service.operar('division', Infinity, Infinity)).toBeNaN();
      });

      it('should handle NaN inputs', () => {
        expect(service.operar('division', NaN, 5)).toBeNaN();
        expect(service.operar('division', 5, NaN)).toBeNaN();
      });

      it('should handle same numbers', () => {
        expect(service.operar('division', 5, 5)).toBe(1);
        expect(service.operar('division', -5, -5)).toBe(1);
      });
    });

    describe('invalid operations', () => {
      it('should return undefined for unknown operation', () => {
        expect(service.operar('invalid', 5, 3)).toBeUndefined();
        expect(service.operar('potencia', 5, 3)).toBeUndefined();
        expect(service.operar('modulo', 5, 3)).toBeUndefined();
      });

      it('should return undefined for empty operation string', () => {
        expect(service.operar('', 5, 3)).toBeUndefined();
      });

      it('should return undefined for null operation', () => {
        expect(service.operar(null as any, 5, 3)).toBeUndefined();
      });

      it('should return undefined for undefined operation', () => {
        expect(service.operar(undefined as any, 5, 3)).toBeUndefined();
      });

      it('should return undefined for case-sensitive operation names', () => {
        expect(service.operar('Suma', 5, 3)).toBeUndefined();
        expect(service.operar('SUMA', 5, 3)).toBeUndefined();
        expect(service.operar('Resta', 5, 3)).toBeUndefined();
        expect(service.operar('MULTIPLICACION', 5, 3)).toBeUndefined();
        expect(service.operar('Division', 5, 3)).toBeUndefined();
      });

      it('should return undefined for operation names with spaces', () => {
        expect(service.operar(' suma', 5, 3)).toBeUndefined();
        expect(service.operar('suma ', 5, 3)).toBeUndefined();
        expect(service.operar(' suma ', 5, 3)).toBeUndefined();
      });

      it('should return undefined for operation names with special characters', () => {
        expect(service.operar('suma!', 5, 3)).toBeUndefined();
        expect(service.operar('#suma', 5, 3)).toBeUndefined();
      });
    });

    describe('default parameter handling', () => {
      it('should use default empty string for operation when not provided', () => {
        expect(service.operar(undefined as any, 5, 3)).toBeUndefined();
      });

      it('should handle operations with default parameters', () => {
        const serviceInstance = service as any;
        expect(serviceInstance.operar()).toBeUndefined();
      });
    });

    describe('edge cases with special numbers', () => {
      it('should handle negative zero', () => {
        expect(service.operar('suma', -0, 0)).toBe(0);
        expect(service.operar('resta', -0, 0)).toBe(-0);
        expect(service.operar('multiplicacion', -0, 5)).toBe(-0);
      });

      it('should handle Number.MAX_VALUE', () => {
        expect(service.operar('suma', Number.MAX_VALUE, 1)).toBe(Number.MAX_VALUE);
      });

      it('should handle Number.MIN_VALUE', () => {
        expect(service.operar('suma', Number.MIN_VALUE, 0)).toBe(Number.MIN_VALUE);
      });

      it('should handle Number.POSITIVE_INFINITY', () => {
        expect(service.operar('suma', Number.POSITIVE_INFINITY, 1)).toBe(Number.POSITIVE_INFINITY);
      });

      it('should handle Number.NEGATIVE_INFINITY', () => {
        expect(service.operar('suma', Number.NEGATIVE_INFINITY, 1)).toBe(Number.NEGATIVE_INFINITY);
      });
    });

    describe('private method coverage (indirect testing)', () => {
      it('should call private suma method', () => {
        const result = service.operar('suma', 2, 3);
        expect(result).toBe(5);
      });

      it('should call private resta method', () => {
        const result = service.operar('resta', 5, 3);
        expect(result).toBe(2);
      });

      it('should call private multiplicacion method', () => {
        const result = service.operar('multiplicacion', 4, 3);
        expect(result).toBe(12);
      });

      it('should call private division method', () => {
        const result = service.operar('division', 12, 4);
        expect(result).toBe(3);
      });
    });
  });
});
