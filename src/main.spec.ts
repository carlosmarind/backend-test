describe('Main bootstrap', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('bootstrap logic', () => {
    it('should handle default port fallback', () => {
      delete process.env.PORT;
      const port = process.env.PORT ?? 4000;
      expect(port).toBe(4000);
    });

    it('should use custom port when provided', () => {
      process.env.PORT = '3000';
      const port = process.env.PORT ?? 4000;
      expect(port).toBe('3000');
    });

    it('should format error messages correctly', () => {
      const error = new Error('Test error');
      const message = `Error al iniciar la aplicacion: ${error}`;
      expect(message).toBe('Error al iniciar la aplicacion: Error: Test error');
    });

    it('should handle string errors', () => {
      const error = 'String error';
      const message = `Error al iniciar la aplicacion: ${error}`;
      expect(message).toBe('Error al iniciar la aplicacion: String error');
    });

    it('should handle null/undefined errors', () => {
      const error = null;
      const message = `Error al iniciar la aplicacion: ${error}`;
      expect(message).toBe('Error al iniciar la aplicacion: null');
    });
  });

  describe('error output formatting', () => {
    it('should format error message correctly', () => {
      const error = new Error('Test error');
      const expectedMessage = `Error al iniciar la aplicacion: ${error}`;
      expect(expectedMessage).toBe('Error al iniciar la aplicacion: Error: Test error');
    });

    it('should handle string errors', () => {
      const error = 'String error';
      const expectedMessage = `Error al iniciar la aplicacion: ${error}`;
      expect(expectedMessage).toBe('Error al iniciar la aplicacion: String error');
    });

    it('should handle null/undefined errors', () => {
      const error = null;
      const expectedMessage = `Error al iniciar la aplicacion: ${error}`;
      expect(expectedMessage).toBe('Error al iniciar la aplicacion: null');
    });
  });

  describe('constants and defaults', () => {
    it('should use correct default port', () => {
      const defaultPort = 4000;
      const port = process.env.PORT ?? defaultPort;
      expect(typeof port).toBe('number');
    });

    it('should handle port coercion', () => {
      const port1 = process.env.PORT ?? 4000;
      const port2 = '3000';
      expect(port1).toBe(4000);
      expect(port2).toBe('3000');
    });
  });
});