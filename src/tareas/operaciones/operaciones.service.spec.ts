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
    it('debería sumar correctamente', () => {
      expect(service.operar('suma', 2, 3)).toBe(5);
    });

    it('debería restar correctamente', () => {
      expect(service.operar('resta', 5, 2)).toBe(3);
    });

    it('debería multiplicar correctamente', () => {
      expect(service.operar('multiplicacion', 4, 3)).toBe(12);
    });

    it('debería dividir correctamente', () => {
      expect(service.operar('division', 10, 2)).toBe(5);
    });

    it('debería devolver undefined si la operación no existe', () => {
      expect(service.operar('invalida', 10, 2)).toBeUndefined();
    });
  });

  describe('casos borde de división', () => {
    it('debería devolver NaN si se divide por 0', () => {
      expect(service.operar('division', 10, 0)).toBeNaN();
    });

    it('debería devolver 0 si numerador es 0', () => {
      expect(service.operar('division', 0, 5)).toBe(0);
    });
  });
});
