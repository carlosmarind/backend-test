import { bootstrap } from './main';
import { INestApplication, Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

describe('Main bootstrap', () => {
  let fakeApp: Partial<INestApplication>;

  beforeAll(() => {
    // Silenciar logs
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => {});

    // Fake app para no iniciar un servidor real
    fakeApp = {
      listen: jest.fn().mockResolvedValue(undefined),
      getUrl: jest.fn().mockResolvedValue('http://localhost:4000'),
    };
    
    // Mockear NestFactory.create para devolver fakeApp
    jest.spyOn(NestFactory, 'create').mockResolvedValue(fakeApp as INestApplication);
  });

  it('should execute bootstrap without throwing', async () => {
    await expect(bootstrap()).resolves.not.toThrow();

    // Opcional: verificar que listen y getUrl fueron llamados
    expect(fakeApp.listen).toHaveBeenCalled();
    expect(fakeApp.getUrl).toHaveBeenCalled();
  });
});
