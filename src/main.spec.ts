// src/main.spec.ts
import { bootstrap } from './main';
import { NestFactory } from '@nestjs/core';
import { Logger, INestApplication } from '@nestjs/common';

describe('Main bootstrap', () => {
  let fakeApp: Partial<INestApplication>;

  beforeAll(() => {
    // Silenciamos logs para no llenar la consola en tests
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => {});

    // Creamos un fakeApp que simula un servidor Nest
    fakeApp = {
      listen: jest.fn().mockResolvedValue(undefined),
      getUrl: jest.fn().mockResolvedValue('http://localhost:4000'),
    };

    // Mockeamos NestFactory.create para que devuelva nuestro fakeApp
    jest.spyOn(NestFactory, 'create').mockResolvedValue(fakeApp as INestApplication);
  });

  it('should execute bootstrap without throwing', async () => {
    await expect(bootstrap()).resolves.not.toThrow();
    expect(fakeApp.listen).toHaveBeenCalled();
    expect(fakeApp.getUrl).toHaveBeenCalled();
  });
});
