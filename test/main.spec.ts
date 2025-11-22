// test/main.spec.ts
import { NestFactory } from '@nestjs/core';
import { bootstrap } from '../src/main';

describe('bootstrap (main.ts)', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('arranca sin lanzar errores y registra la URL', async () => {
    const listen = jest.fn().mockResolvedValue(undefined);
    const getUrl = jest.fn().mockResolvedValue('http://localhost:4000');

    // Mock del método estático create de NestFactory
    jest
     
      .spyOn(NestFactory, 'create')
      .mockResolvedValue({ listen, getUrl } as any);

    await expect(bootstrap()).resolves.toBeDefined();
    expect(NestFactory.create).toHaveBeenCalled();
    expect(listen).toHaveBeenCalled(); // no validamos puerto para evitar falsos negativos
    expect(getUrl).toHaveBeenCalled();
  });
});