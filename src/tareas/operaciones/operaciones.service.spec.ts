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

  it('el servicio debería estar definido', () => {
    expect(service).toBeDefined();
  });

  it('suma', () => {

    let a: any = 12;
    let b: any = 11;

    expect(service.operar(a, b, 'suma')).toBe(23);
    expect(service.operar(a, b, 'suma')).not.toBe(24);
    expect(service.operar(a, b, 'suma')).toBeGreaterThan(22);

    a = null;
    b = "50";

    expect(() => {
      service.operar(a, b, 'suma')
    }).toThrow('operando indefinido');

    a = undefined;
    b = 50;

    expect(() => {
      service.operar(a, b, 'suma')
    }).toThrow('operando indefinido');

    a = '10';
    b = 30;
    expect(service.operar(a, b, 'suma')).toBeNaN();

    a = Math.PI;
    b = 30;
    expect(service.operar(a, b, 'suma')).toBeCloseTo(33.14, 2);

  });

  it('resta', () => {

    let a: any = 22;
    let b: any = 11;
    expect(service.operar(a, b, 'resta')).toBe(11);
    expect(service.operar(a, b, 'resta')).not.toBe(10);
    expect(service.operar(a, b, 'resta')).toBeGreaterThan(10);

    a = null;
    b = "50";
    expect(() => {
      service.operar(a, b, 'resta')
    }).toThrow('operando indefinido');

    a = undefined;
    b = 50;
    expect(() => {
      service.operar(a, b, 'resta')
    }).toThrow('operando indefinido');

    a = '10';
    b = 30;
    expect(service.operar(a, b, 'resta')).toBeNaN();

    a = Math.PI;
    b = 30;
    expect(service.operar(a, b, 'resta')).toBeCloseTo(-26.858, 2);

  });


  it('multiplicacion', () => {

    let a: any = 10;
    let b: any = 1.5;
    expect(service.operar(a, b, 'multiplicacion')).toBe(15.0);
    expect(service.operar(a, b, 'multiplicacion')).not.toBe(10);
    expect(service.operar(a, b, 'multiplicacion')).toBeGreaterThan(10);

    a = null;
    b = "2";
    expect(() => {
      service.operar(a, b, 'multiplicacion')
    }).toThrow('operando indefinido');

    a = undefined;
    b = 50;
    expect(() => {
      service.operar(a, b, 'multiplicacion')
    }).toThrow('operando indefinido');

    a = '10';
    b = 30;
    expect(service.operar(a, b, 'multiplicacion')).toBeNaN();

    a = Math.PI;
    b = 5;
    expect(service.operar(a, b, 'multiplicacion')).toBeCloseTo(15.707, 2);

    a = 0;
    b = Math.random()*1000;
    expect(service.operar(a, b, 'multiplicacion')).toBe(0);

  });

  it('division', () => {

    let a: any = 10.4;
    let b: any = 2;
    expect(service.operar(a, b, 'division')).toBe(5.2);
    expect(service.operar(a, b, 'division')).not.toBe(5);
    expect(service.operar(a, b, 'division')).toBeGreaterThan(5.1);

    a = null;
    b = "2";
    expect(() => {
      service.operar(a, b, 'division')
    }).toThrow('operando indefinido');

    a = undefined;
    b = 50;
    expect(() => {
      service.operar(a, b, 'division')
    }).toThrow('operando indefinido');

    a = '10';
    b = 30;
    expect(service.operar(a, b, 'division')).toBeNaN();

    a = 10;
    b = 3;
    expect(service.operar(a, b, 'division')).toBeCloseTo(3.333, 2);

    a = 12300
    b = 0
    expect(service.operar(a, b, 'division')).toBeNaN();
    
    a = 0 
    b = -Math.random()*1000;
    expect(service.operar(a, b, 'division')).toBe(0);

  });  

});


