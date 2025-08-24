import { Test, TestingModule } from '@nestjs/testing';
import { AppService } from './app.service'; 
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration'; 

describe('AppService', () => {
  let service: AppService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
          imports: [
            ConfigModule.forRoot({
              isGlobal: true,
              load: [configuration],
            }),
          ], 
          providers: [AppService],
        }).compile();

    service = app.get<AppService>(AppService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('probar RUN incorrecto', () => { 
     let rut: any = '11111111-6';
     expect(service.validateRut(rut)).toBe(false);
  });

  it('probar RUN correcto', () => { 
     let rut: any = '11111111-1';
     expect(service.validateRut(rut)).toBe(true);
  });
});
