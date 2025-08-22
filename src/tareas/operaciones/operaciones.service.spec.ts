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
    expect(service.operar('suma', 2, 3)).toBe(5);
  });

  it('should perform subtraction correctly', () => {
    expect(service.operar('resta', 5, 3)).toBe(2);
  });

  it('should perform multiplication correctly', () => {
    expect(service.operar('multiplicacion', 2, 3)).toBe(6);
  });

  it('should perform division correctly', () => {
    expect(service.operar('division', 6, 3)).toBe(2);
  });

  it('should return NaN when dividing by zero', () => {
    expect(service.operar('division', 6, 0)).toBeNaN();
  });

  it('should return 0 when numerator is 0', () => {
    expect(service.operar('division', 0, 5)).toBe(0);
  });

  it('should return undefined for unknown operation', () => {
    expect(service.operar('unknown', 1, 1)).toBeUndefined();
  });
});
