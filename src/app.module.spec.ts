import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from './app.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TareasModule } from './tareas/tareas.module';
import { ConfigModule } from '@nestjs/config';

describe('AppModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
  });

  afterEach(async () => {
    await module.close();
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  it('should have AppController', () => {
    const controller = module.get<AppController>(AppController);
    expect(controller).toBeDefined();
    expect(controller).toBeInstanceOf(AppController);
  });

  it('should have AppService', () => {
    const service = module.get<AppService>(AppService);
    expect(service).toBeDefined();
    expect(service).toBeInstanceOf(AppService);
  });

  it('should have ConfigModule imported', () => {
    const configModule = module.get(ConfigModule);
    expect(configModule).toBeDefined();
  });

  it('should have TareasModule imported', () => {
    const tareasModule = module.get(TareasModule);
    expect(tareasModule).toBeDefined();
  });

  it('should compile successfully', async () => {
    const testModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    
    expect(testModule).toBeDefined();
    await testModule.close();
  });

  it('should create app with proper dependencies', async () => {
    const testModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    const app = testModule.createNestApplication();
    await app.init();
    
    expect(app).toBeDefined();
    
    await app.close();
    await testModule.close();
  });
});