import configuration from './configuration';

describe('Configuration', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should be defined', () => {
    expect(configuration).toBeDefined();
    expect(typeof configuration).toBe('function');
  });

  it('should return configuration object with default values', () => {
    delete process.env.PORT;
    delete process.env.USERNAME;
    delete process.env.API_KEY;
    delete process.env.DATABASE_HOST;
    delete process.env.DATABASE_PORT;

    const config = configuration();
    
    expect(config).toEqual({
      port: 3000,
      username: '',
      apikey: '',
      database: {
        host: 'localhost',
        port: 5432,
      },
    });
  });

  it('should return configuration with environment values', () => {
    process.env.PORT = '4000';
    process.env.USERNAME = 'testuser';
    process.env.API_KEY = 'test-key';
    process.env.DATABASE_HOST = 'db-host';
    process.env.DATABASE_PORT = '3306';

    const config = configuration();
    
    expect(config).toEqual({
      port: 4000,
      username: 'testuser',
      apikey: 'test-key',
      database: {
        host: 'db-host',
        port: 3306,
      },
    });
  });

  it('should handle invalid PORT as NaN', () => {
    process.env.PORT = 'invalid-port';

    const config = configuration();
    
    expect(config.port).toBeNaN();
  });

  it('should handle invalid DATABASE_PORT as NaN', () => {
    process.env.DATABASE_PORT = 'invalid-port';

    const config = configuration();
    
    expect(config.database.port).toBeNaN();
  });

  it('should handle zero values for ports', () => {
    process.env.PORT = '0';
    process.env.DATABASE_PORT = '0';

    const config = configuration();
    
    expect(config.port).toBe(0);
    expect(config.database.port).toBe(0);
  });

  it('should handle negative values for ports', () => {
    process.env.PORT = '-1';
    process.env.DATABASE_PORT = '-1';

    const config = configuration();
    
    expect(config.port).toBe(-1);
    expect(config.database.port).toBe(-1);
  });

  it('should handle very large port numbers', () => {
    process.env.PORT = '65535';
    process.env.DATABASE_PORT = '65535';

    const config = configuration();
    
    expect(config.port).toBe(65535);
    expect(config.database.port).toBe(65535);
  });

  it('should handle empty string values', () => {
    process.env.PORT = '';
    process.env.USERNAME = '';
    process.env.API_KEY = '';
    process.env.DATABASE_HOST = '';
    process.env.DATABASE_PORT = '';

    const config = configuration();
    
    expect(config.port).toBeNaN(); // parseInt('') returns NaN
    expect(config.username).toBe('');
    expect(config.apikey).toBe('');
    expect(config.database.host).toBe(''); // Empty string is used, not the default
    expect(config.database.port).toBeNaN(); // parseInt('') returns NaN
  });

  it('should handle special characters in string values', () => {
    process.env.USERNAME = 'user@domain.com!@#$%';
    process.env.API_KEY = 'key-with-special-chars!@#$%^&*()';
    process.env.DATABASE_HOST = 'db-host.example.com';

    const config = configuration();
    
    expect(config.username).toBe('user@domain.com!@#$%');
    expect(config.apikey).toBe('key-with-special-chars!@#$%^&*()');
    expect(config.database.host).toBe('db-host.example.com');
  });
});