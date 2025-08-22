import { Test, TestingModule } from '@nestjs/testing';
import { AppService } from './app.service';
import appConfig from './config/configuration';
import { ConfigType } from '@nestjs/config';
import * as rutlib from 'rutlib';

describe('AppService', () => {
  let service: AppService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppService,
        {
          provide: appConfig.KEY,
          useValue: {
            apikey: 'TEST_API_KEY',
          } as ConfigType<typeof appConfig>,
        },
      ],
    }).compile();

    service = module.get<AppService>(AppService);
  });

  it('Servicio definido', () => {
    expect(service).toBeDefined();
  });

  it('getHello() devuelve saludo', () => {
    expect(service.getHello()).toBe('Hello !!');
  });

  it('getApikey() devuelve la API key con !!', () => {
    expect(service.getApikey()).toBe('TEST_API_KEY!!');
  });

  it('validateRut() retorna true para RUT válido', () => {
    jest.spyOn(rutlib, 'validateRut').mockReturnValue(true);
    expect(service.validateRut('11.111.111-1')).toBe(true);
  });

  it('validateRut() retorna false para RUT inválido', () => {
    jest.spyOn(rutlib, 'validateRut').mockReturnValue(false);
    expect(service.validateRut('22.222.222-2')).toBe(false);
  });
});
