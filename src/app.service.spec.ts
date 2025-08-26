import { Test, TestingModule } from '@nestjs/testing';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';

// Mock the rutlib module
jest.mock('rutlib', () => ({
  validateRut: jest.fn(),
}));

import { validateRut } from 'rutlib';

describe('AppService', () => {
  let service: AppService;

  beforeEach(async () => {
    // Clear environment variables before each test
    delete process.env.USERNAME;
    delete process.env.API_KEY;
    
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [configuration],
        }),
      ],
      providers: [AppService],
    }).compile();

    service = module.get<AppService>(AppService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getHello', () => {
    it('should return hello message with username from config', async () => {
      process.env.USERNAME = 'testuser';
      
      const module: TestingModule = await Test.createTestingModule({
        imports: [
          ConfigModule.forRoot({
            isGlobal: true,
            load: [configuration],
          }),
        ],
        providers: [AppService],
      }).compile();

      const testService = module.get<AppService>(AppService);
      const result = testService.getHello();
      expect(result).toBe('Hello testuser!!');
    });

    it('should return hello message with empty username when not set', async () => {
      delete process.env.USERNAME;
      
      const module: TestingModule = await Test.createTestingModule({
        imports: [
          ConfigModule.forRoot({
            isGlobal: true,
            load: [configuration],
          }),
        ],
        providers: [AppService],
      }).compile();

      const testService = module.get<AppService>(AppService);
      const result = testService.getHello();
      expect(result).toBe('Hello !!');
    });

    it('should handle special characters in username', async () => {
      process.env.USERNAME = 'user@domain.com';
      
      const module: TestingModule = await Test.createTestingModule({
        imports: [
          ConfigModule.forRoot({
            isGlobal: true,
            load: [configuration],
          }),
        ],
        providers: [AppService],
      }).compile();

      const testService = module.get<AppService>(AppService);
      const result = testService.getHello();
      expect(result).toBe('Hello user@domain.com!!');
    });

    it('should handle numeric username', async () => {
      process.env.USERNAME = '12345';
      
      const module: TestingModule = await Test.createTestingModule({
        imports: [
          ConfigModule.forRoot({
            isGlobal: true,
            load: [configuration],
          }),
        ],
        providers: [AppService],
      }).compile();

      const testService = module.get<AppService>(AppService);
      const result = testService.getHello();
      expect(result).toBe('Hello 12345!!');
    });
  });

  describe('getApikey', () => {
    it('should return api key with config value', async () => {
      process.env.API_KEY = 'test-api-key';
      
      const module: TestingModule = await Test.createTestingModule({
        imports: [
          ConfigModule.forRoot({
            isGlobal: true,
            load: [configuration],
          }),
        ],
        providers: [AppService],
      }).compile();

      const testService = module.get<AppService>(AppService);
      const result = testService.getApikey();
      expect(result).toBe('test-api-key!!');
    });

    it('should return api key with empty value when not set', async () => {
      delete process.env.API_KEY;
      
      const module: TestingModule = await Test.createTestingModule({
        imports: [
          ConfigModule.forRoot({
            isGlobal: true,
            load: [configuration],
          }),
        ],
        providers: [AppService],
      }).compile();

      const testService = module.get<AppService>(AppService);
      const result = testService.getApikey();
      expect(result).toBe('!!');
    });

    it('should handle special characters in api key', async () => {
      process.env.API_KEY = 'key-with-special-chars!@#$%';
      
      const module: TestingModule = await Test.createTestingModule({
        imports: [
          ConfigModule.forRoot({
            isGlobal: true,
            load: [configuration],
          }),
        ],
        providers: [AppService],
      }).compile();

      const testService = module.get<AppService>(AppService);
      const result = testService.getApikey();
      expect(result).toBe('key-with-special-chars!@#$%!!');
    });

    it('should handle very long api key', async () => {
      const longKey = 'a'.repeat(1000);
      process.env.API_KEY = longKey;
      
      const module: TestingModule = await Test.createTestingModule({
        imports: [
          ConfigModule.forRoot({
            isGlobal: true,
            load: [configuration],
          }),
        ],
        providers: [AppService],
      }).compile();

      const testService = module.get<AppService>(AppService);
      const result = testService.getApikey();
      expect(result).toBe(longKey + '!!');
    });
  });

  describe('validateRut', () => {
    it('should return true for valid RUT', () => {
      const validRut = '12345678-9';
      (validateRut as jest.Mock).mockReturnValue(true);

      const result = service.validateRut(validRut);

      expect(result).toBe(true);
      expect(validateRut).toHaveBeenCalledWith(validRut);
    });

    it('should return false for invalid RUT', () => {
      const invalidRut = 'invalid-rut';
      (validateRut as jest.Mock).mockReturnValue(false);

      const result = service.validateRut(invalidRut);

      expect(result).toBe(false);
      expect(validateRut).toHaveBeenCalledWith(invalidRut);
    });

    it('should handle empty RUT string', () => {
      const emptyRut = '';
      (validateRut as jest.Mock).mockReturnValue(false);

      const result = service.validateRut(emptyRut);

      expect(result).toBe(false);
      expect(validateRut).toHaveBeenCalledWith(emptyRut);
    });

    it('should handle undefined RUT', () => {
      const undefinedRut = undefined as any;
      (validateRut as jest.Mock).mockReturnValue(false);

      const result = service.validateRut(undefinedRut);

      expect(result).toBe(false);
      expect(validateRut).toHaveBeenCalledWith(undefinedRut);
    });

    it('should handle null RUT', () => {
      const nullRut = null as any;
      (validateRut as jest.Mock).mockReturnValue(false);

      const result = service.validateRut(nullRut);

      expect(result).toBe(false);
      expect(validateRut).toHaveBeenCalledWith(nullRut);
    });

    it('should handle RUT with only numbers', () => {
      const numbersOnlyRut = '123456789';
      (validateRut as jest.Mock).mockReturnValue(false);

      const result = service.validateRut(numbersOnlyRut);

      expect(result).toBe(false);
      expect(validateRut).toHaveBeenCalledWith(numbersOnlyRut);
    });

    it('should handle RUT with spaces', () => {
      const rutWithSpaces = ' 12345678-9 ';
      (validateRut as jest.Mock).mockReturnValue(false);

      const result = service.validateRut(rutWithSpaces);

      expect(result).toBe(false);
      expect(validateRut).toHaveBeenCalledWith(rutWithSpaces);
    });

    it('should handle RUT with letters in verification digit', () => {
      const rutWithK = '12345678-k';
      (validateRut as jest.Mock).mockReturnValue(true);

      const result = service.validateRut(rutWithK);

      expect(result).toBe(true);
      expect(validateRut).toHaveBeenCalledWith(rutWithK);
    });

    it('should handle very long invalid RUT', () => {
      const longInvalidRut = '1'.repeat(100);
      (validateRut as jest.Mock).mockReturnValue(false);

      const result = service.validateRut(longInvalidRut);

      expect(result).toBe(false);
      expect(validateRut).toHaveBeenCalledWith(longInvalidRut);
    });

    it('should handle rutlib throwing an error', () => {
      const errorRut = 'error-rut';
      (validateRut as jest.Mock).mockImplementation(() => {
        throw new Error('rutlib error');
      });

      expect(() => service.validateRut(errorRut)).toThrow('rutlib error');
      expect(validateRut).toHaveBeenCalledWith(errorRut);
    });
  });
});