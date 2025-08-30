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

  it('operaciones',() => {
    var a= 10;
    var b=20;
    expect(service.operar('suma', a, b)).toBe(30);
    expect(service.operar('', a, b)).not.toBe(30);
    expect(service.operar('resta', b, a)).toBe(10);
    expect(service.operar('multiplicacion', a, b)).toBe(200);
    expect(service.operar('division', b, a)).toBe(2);
    expect(service.operar('division', a, 0)).toBe(NaN);
    expect(service.operar('division', 0, b)).toBe(0);
  }); 
});
