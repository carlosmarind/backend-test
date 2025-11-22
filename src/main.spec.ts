import { NestFactory } from '@nestjs/core';
import { bootstrap } from './main';

describe('bootstrap (main.ts)', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('arranca sin errores y registra la URL', async () => {
    const listen = jest.fn().mockResolvedValue(undefined);
    const getUrl = jest.fn().mockResolvedValue('http://localhost:4000');

    jest
      
      .spyOn(NestFactory, 'create')
      .mockResolvedValue({ listen, getUrl } as any);

    await expect(bootstrap()).resolves.toBeDefined();
    expect(NestFactory.create).toHaveBeenCalled();
    expect(listen).toHaveBeenCalled();
    expect(getUrl).toHaveBeenCalled();
  });
});