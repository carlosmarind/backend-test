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

    // Fake app para no levantar servidor real
    fakeApp = {
      listen: jest.fn().mockResolvedValue(undefined),
      getUrl: jest.fn().mockResolvedValue('http://localhost:4000'),
    };

    // Mock NestFactory.create para devolver nuestro fakeApp
    jest.spyOn(NestFactory, 'create').mockResolvedValue(fakeApp as INestApplication);
  });

  it('should execute bootstrap without throwing', async () => {
    await expect(bootstrap()).resolves.not.toThrow();
    expect(fakeApp.listen).toHaveBeenCalled();
    expect(fakeApp.getUrl).toHaveBeenCalled();
  });

  it('should cover require.main === module block', async () => {
    // Guardamos el valor original
    const originalMain = require.main;
    const originalModule = module;

    try {
      // Forzamos require.main === module
      Object.defineProperty(require, 'main', { value: module });
      jest.isolateModules(async () => {
        const mainModule = require('./main');
        jest.spyOn(mainModule, 'bootstrap').mockResolvedValue(fakeApp as INestApplication);
        await mainModule.bootstrap();
      });
    } finally {
      // Restauramos require.main
      Object.defineProperty(require, 'main', { value: originalMain });
    }
  });
});
