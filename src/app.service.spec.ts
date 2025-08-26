import { Test, TestingModule } from '@nestjs/testing';
import { AppService } from './app.service';
import appConfig from './config/configuration';

describe('AppService', () => {
  let service: AppService;

  const mockConfig = { apikey: 'test-key' };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppService,
        { provide: appConfig.KEY, useValue: mockConfig },
      ],
    }).compile();

    service = module.get<AppService>(AppService);
  });

  it('getHello should return "Hello !!"', () => {
    expect(service.getHello()).toBe('Hello !!');
  });

  it('getApikey should return API key', () => {
    expect(service.getApikey()).toBe('test-key!!');
  });

  it('validateRut should return true for valid RUT', () => {
    expect(service.validateRut('12345678-5')).toBe(true);
  });

  it('validateRut should return false for invalid RUT', () => {
    expect(service.validateRut('11111112-1')).toBe(false);
  });
});
