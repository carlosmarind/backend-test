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

  describe('operar()', () => {
    it('debería retornar la suma de dos números', () => {
      expect(service.operar('suma', 5, 3)).toBe(8);
    });

    it('debería retornar la resta de dos números', () => {
      expect(service.operar('resta', 10, 4)).toBe(6);
    });

    it('debería retornar la multiplicación de dos números', () => {
      expect(service.operar('multiplicacion', 7, 2)).toBe(14);
    });

    it('debería retornar la división de dos números', () => {
      expect(service.operar('division', 20, 5)).toBe(4);
    });

    it('debería retornar NaN si se intenta dividir por cero', () => {
      expect(service.operar('division', 10, 0)).toBe(NaN);
    });

    it('debería retornar 0 si se divide 0 por un número', () => {
      expect(service.operar('division', 0, 5)).toBe(0);
    });

    it('debería retornar undefined para una operación no válida', () => {
      expect(service.operar('potencia', 2, 3)).toBeUndefined();
    });
  });
});