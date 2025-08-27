import { Test, TestingModule } from '@nestjs/testing';
import { AppService } from './app.service'; 
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration'; 
import { notDeepEqual } from 'assert';

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

  it('Esto NO debería devolver un saludo sin mi USRENAME', () => {
    expect(service.getHello()).toBe("Hello !!");
  });

  it('Esto debería devolver un saludo con mi USRENAME', () => {
    expect(service.getHello()).not.toBe("Hello cesar!!");
  });

  it('Esto NO debería devolver un mensaje sin la API_KEY', () => {
    expect(service.getApikey()).toBe("!!");
  });

  it('Esto debería devolver un mensaje con la API_KEY', () => {
    expect(service.getApikey()).not.toBe("#qwerty123456!!");
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
