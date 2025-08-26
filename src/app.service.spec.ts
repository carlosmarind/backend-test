import { AppService } from './app.service';

describe('AppService', () => {
  let service: AppService;

  beforeEach(() => {
    const mockCfg = {
      port: 3000,
      username: 'jest-user',
      apikey: 'jest-key',
      database: { host: 'localhost', port: 5432 },
    };
    service = new AppService(mockCfg as any);
  });

  it('getHello retorna saludo con username', () => {
    expect(service.getHello()).toBe('Hello jest-user!!');
  });

  it('getApikey retorna api key con !!', () => {
    expect(service.getApikey()).toBe('jest-key!!');
  });

  it('validateRut válido devuelve true', () => {
    expect(service.validateRut('12.345.678-5')).toBe(true);
  });

  it('validateRut inválido devuelve false', () => {
    expect(service.validateRut('12.345.678-9')).toBe(false);
  });
});
