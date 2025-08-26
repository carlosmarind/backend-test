import { Test, TestingModule } from '@nestjs/testing';
import { TareasModule } from './tareas.module';
import { OperacionesController } from './operaciones/operaciones.controller';
import { OperacionesService } from './operaciones/operaciones.service';

describe('TareasModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [TareasModule],
    }).compile();
  });

  afterEach(async () => {
    await module.close();
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  it('should have OperacionesController', () => {
    const controller = module.get<OperacionesController>(OperacionesController);
    expect(controller).toBeDefined();
    expect(controller).toBeInstanceOf(OperacionesController);
  });

  it('should have OperacionesService', () => {
    const service = module.get<OperacionesService>(OperacionesService);
    expect(service).toBeDefined();
    expect(service).toBeInstanceOf(OperacionesService);
  });

  it('should compile successfully', async () => {
    const testModule = await Test.createTestingModule({
      imports: [TareasModule],
    }).compile();
    
    expect(testModule).toBeDefined();
    await testModule.close();
  });

  it('should inject OperacionesService into OperacionesController', () => {
    const controller = module.get<OperacionesController>(OperacionesController);
    const service = module.get<OperacionesService>(OperacionesService);
    
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
    
    // Test that the service is properly injected
    expect((controller as any).operService).toBeInstanceOf(OperacionesService);
  });

  it('should create independent instances', async () => {
    const module1 = await Test.createTestingModule({
      imports: [TareasModule],
    }).compile();

    const module2 = await Test.createTestingModule({
      imports: [TareasModule],
    }).compile();

    const service1 = module1.get<OperacionesService>(OperacionesService);
    const service2 = module2.get<OperacionesService>(OperacionesService);

    expect(service1).not.toBe(service2);
    expect(service1).toBeInstanceOf(OperacionesService);
    expect(service2).toBeInstanceOf(OperacionesService);

    await module1.close();
    await module2.close();
  });
});