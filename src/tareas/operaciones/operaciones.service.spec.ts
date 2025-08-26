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
    it('debería sumar dos números y retornar el resultado correcto', () => {
      const resultado = service.operar('suma', 15, 5);
      expect(resultado).toBe(20);
    });

    it('debería restar dos números y retornar un resultado negativo correctamente', () => {
      const resultado = service.operar('resta', 10, 20);
      expect(resultado).toBe(-10);
    });

    it('debería multiplicar por cero y retornar cero', () => {
      const resultado = service.operar('multiplicacion', 100, 0);
      expect(resultado).toBe(0);
    });

    it('debería dividir dos números y retornar el resultado correcto', () => {
      const resultado = service.operar('division', 50, 2);
      expect(resultado).toBe(25);
    });

    it('debería retornar NaN al intentar dividir por cero', () => {
      const resultado = service.operar('division', 10, 0);
      expect(resultado).toBeNaN();
    });
  });
});
