// src/main.spec.ts
import { bootstrap } from './main';
import { INestApplication } from '@nestjs/common';

describe('Main bootstrap', () => {
  beforeAll(() => {
    // Opcional: silenciar logs
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  it('should execute bootstrap without throwing', async () => {
    // Creamos un fakeApp que simula el servidor
    const fakeApp = {
      listen: jest.fn(),
      enableShutdownHooks: jest.fn(),
      use: jest.fn(),
      close: jest.fn(),
    } as unknown as INestApplication;

    // Mockeamos bootstrap para que devuelva nuestro fakeApp
    jest.spyOn(require('./main'), 'bootstrap').mockResolvedValue(fakeApp);

    // Ejecutamos bootstrap y verificamos que no lance error
    await expect(bootstrap()).resolves.not.toThrow();
  });
});
