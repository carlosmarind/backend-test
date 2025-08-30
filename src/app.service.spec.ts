import { Test, TestingModule } from '@nestjs/testing';
import { AppService } from './app.service';
import appConfig from './config/configuration';
import { ConfigType } from '@nestjs/config';
import { validateRut as validateRutLib } from 'rutlib';

jest.mock('rutlib', () => ({
  validateRut: jest.fn(),
}));

describe('AppService', () => {
  let service: AppService;
  let config: ConfigType<typeof appConfig>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppService,
        {
          provide: appConfig.KEY,
          useValue: {
            apikey: 'TEST_API_KEY',
          },
        },
      ],
    }).compile();

    service = module.get<AppService>(AppService);
    config = module.get(appConfig.KEY);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('getHello should return Hello message', () => {
    expect(service.getHello()).toBe('Hello  !!');
  });

  it('getApikey should return the apikey with !!', () => {
    expect(service.getApikey()).toBe(`${config.apikey}!!`);
  });


  it('validateRut should return true for valid RUT', () => {
    (validateRutLib as jest.Mock).mockReturnValue(true);
    expect(service.validateRut('12345678-5')).toBe(true);
    expect(validateRutLib).toHaveBeenCalledWith('12345678-5');
  });

  it('validateRut should return false for invalid RUT', () => {
    (validateRutLib as jest.Mock).mockReturnValue(false);
    expect(service.validateRut('12345678-0')).toBe(false);
    expect(validateRutLib).toHaveBeenCalledWith('12345678-0');
  });
});
