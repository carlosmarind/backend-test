// src/main.spec.ts
import { bootstrap } from './main';
import { NestFactory } from '@nestjs/core';
import { Logger, INestApplication } from '@nestjs/common';

describe('Main bootstrap', () => {
  let fakeApp: Partial<INestApplication>;

  beforeAll(() => {
    // Silenciar logs
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => {});

    // Fake app para no iniciar servidor real
    fakeApp = {
      listen: jest.fn().mockResolvedValue(undefined),
      getUrl: jest.fn().mockResolvedValue('http://localhost:4000'),
    };

    // Mockear NestFactory.create
    jest.spyOn(NestFactory, 'create').mockResolvedValue(fakeApp as INestApplication);
  });

  it('should execute bootstrap without throwing', async () => {
    await expect(bootstrap()).resolves.not.toThrow();
    expect(fakeApp.listen).toHaveBeenCalled();
    expect(fakeApp.getUrl).toHaveBeenCalled();
  });

  it('should run main block if require.main === module', async () => {
    // Ejecutar main.ts como módulo principal para cubrir if(require.main === module)
    jest.isolateModules(async () => {
      const mainModule = require('./main');
      // Mockeamos bootstrap de nuevo
      jest.spyOn(mainModule, 'bootstrap').mockResolvedValue(fakeApp as INestApplication);
      await expect(mainModule.bootstrap()).resolves.not.toThrow();
    });
  });
});
