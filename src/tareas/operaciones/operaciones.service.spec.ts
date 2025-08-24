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

  it('probar suma de numeros', () => {
    let a: any = 10;
    let b: any = 40;

    expect(service.operar('suma', a, b)).toBe(50);
    expect(service.operar('suma', a, b)).not.toBe(51);
    expect(service.operar('suma', a, b)).toBeGreaterThan(49);

    a = null;
    b = '50';

    expect(service.operar('suma', a, b)).toBeNaN();

    a = undefined;
    b = 50;

    expect(() => {
      service.operar('suma', a, b);
    }).toThrow('No se puede llamar con numeros indefinidos');

    a = '10';
    b = 30;
    expect(service.operar('suma', a, b)).toBeNaN();

    a = Math.PI;
    b = 30;
    expect(service.operar('suma', a, b)).toBeCloseTo(33.14, 2);
  });

  it('probar resta de numeros', () => {
    let a: any = 140;
    let b: any = 40;

    expect(service.operar('resta', a, b)).toBe(100);
    expect(service.operar('resta', a, b)).not.toBe(101);
    expect(service.operar('resta', a, b)).toBeGreaterThan(90);

    a = null;
    b = '50';

    expect(service.operar('resta', a, b)).toBeNaN();

    a = undefined;
    b = 50;

    expect(() => {
      service.operar('resta', a, b);
    }).toThrow('No se puede llamar con numeros indefinidos');

    a = '10';
    b = 30;
    expect(service.operar('resta', a, b)).toBeNaN();
 
  });

  it('probar multiplicar de numeros', () => {
    let a: any = 15;
    let b: any = 3;

    expect(service.operar('multiplicacion', a, b)).toBe(45);
    expect(service.operar('multiplicacion', a, b)).not.toBe(153);
    expect(service.operar('multiplicacion', a, b)).toBeGreaterThan(18);
    expect(service.operar('multiplicacion', a, b)).toBeLessThan(50);
    expect(service.operar('multiplicacion', a, b)).toBeCloseTo(44.999);

    a = null;
    b = '50';

    expect(service.operar('multiplicacion', a, b)).toBeNaN();

    a = undefined;
    b = 50;

    expect(() => {
      service.operar('multiplicacion', a, b);
    }).toThrow('No se puede llamar con numeros indefinidos');

    a = '10';
    b = 30;
    expect(service.operar('multiplicacion', a, b)).toBeNaN();
 
  });

  it('probar división de numeros', () => {
    let a: any = 15;
    let b: any = 3;

    expect(service.operar('division', a, b)).toBe(5);
    expect(service.operar('division', a, b)).not.toBe(45);
    expect(service.operar('division', a, b)).toBeGreaterThan(3);
    expect(service.operar('division', a, b)).toBeLessThan(15);

    a = null;
    b = '50';

    expect(service.operar('division', a, b)).toBeNaN();

    a = 3;
    b = null;

    expect(service.operar('division', a, b)).toBeNaN();

    a = '10';
    b = 30;
    expect(service.operar('division', a, b)).toBeNaN();

    a = undefined;
    b = 50;

    expect(() => {
      service.operar('division', a, b);
    }).toThrow('No se puede llamar con numeros indefinidos');

    a = 0;
    b = 5;
    expect(service.operar('division', a, b)).toBe(0);

    a = 10;
    b = 0;
    expect(service.operar('division', a, b)).toBeNaN();
 
  });
});
