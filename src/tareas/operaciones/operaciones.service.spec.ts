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

  it('should perform sum correctly', () => {
    expect(service.operar(2, 3, 'suma')).toBe(5);
  });

  it('should perform subtraction correctly', () => {
    expect(service.operar(5, 3, 'resta')).toBe(2);
  });

  it('should perform multiplication correctly', () => {
    expect(service.operar(2, 3, 'multiplicacion')).toBe(6);
  });

  it('should perform division correctly', () => {
    expect(service.operar(6, 3, 'division')).toBe(2);
  });

  it('should return NaN when dividing by zero', () => {
    expect(service.operar(6, 0, 'division')).toBeNaN();
  });

  it('should return 0 when numerator is 0', () => {
    expect(service.operar(0, 5, 'division')).toBe(0);
  });

  it('should return undefined for unknown operation', () => {
    expect(service.operar(1, 1, 'unknown')).toBeUndefined();
  });

  it('should use default operation when not provided', () => {
  // Llama a operar sin el tercer argumento
  expect(service.operar(4, 5)).toBeUndefined(); // el valor por defecto es ''
});

it('should perform all operations correctly', () => {
  expect(service.operar(2, 3, 'suma')).toBe(5);
  expect(service.operar(5, 3, 'resta')).toBe(2);
  expect(service.operar(2, 3, 'multiplicacion')).toBe(6);
  expect(service.operar(6, 3, 'division')).toBe(2);
  expect(service.operar(6, 0, 'division')).toBeNaN();
  expect(service.operar(0, 5, 'division')).toBe(0);
});

it('should return undefined for unknown operation', () => {
  expect(service.operar(1, 1, 'unknown')).toBeUndefined();
});

});
