import { AppService } from './app.service';
import appConfig from './config/configuration';

describe('AppService', () => {
  let service: AppService;

  beforeEach(() => {
    // Mock del config inyectado
    const mockConfig = {
      username: 'test-user',
      apikey: '1234-API',
    } as any;
    service = new AppService(mockConfig);
  });

  it('debería devolver Hello con el username', () => {
    expect(service.getHello()).toBe('Hello test-user!!');
  });

  it('debería devolver apikey con sufijo !!', () => {
    expect(service.getApikey()).toBe('1234-API!!');
  });

  describe('validateRut', () => {
    it('debería devolver false si el rut es vacío', () => {
      expect(service.validateRut('')).toBe(false);
    });

    it('debería devolver false para rut inválido común 11111111-1', () => {
      expect(service.validateRut('11111111-1')).toBe(false);
    });

    it('debería devolver true para rut válido', () => {
   
      expect(service.validateRut('12.345.678-5')).toBe(true);
    });
  });
});