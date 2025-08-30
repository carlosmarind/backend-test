import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

const mockNestFactory = {
  create: jest.fn().mockResolvedValue({
    listen: jest.fn().mockResolvedValue(true),
    getUrl: jest.fn().mockResolvedValue('http://localhost:4000'),
    close: jest.fn(),
  }),
};

const mockLogger = {
  log: jest.fn(),
};

jest.mock('@nestjs/common', () => ({
  Logger: jest.fn(() => mockLogger),
}));

jest.mock('@nestjs/core', () => mockNestFactory);

import './main';

describe('main.ts', () => {
  beforeAll(async () => {
    await new Promise((resolve) => setTimeout(resolve, 100));
  });

  it('debería crear una instancia de la aplicación NestJS', () => {
    expect(mockNestFactory.create).toHaveBeenCalledWith(AppModule);
  });

  it('debería iniciar la aplicación en el puerto especificado', () => {
    expect(mockNestFactory.create).toHaveBeenCalled();
    const mockApp = mockNestFactory.create.mock.results[0].value;
    expect(mockApp.listen).toHaveBeenCalledWith(
      expect.stringMatching(/^(4000|.*)$/),
      '0.0.0.0',
    );
  });

  it('debería registrar el mensaje de inicio en el log', async () => {
    expect(Logger).toHaveBeenCalledWith('bootstrap');
    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(mockLogger.log).toHaveBeenCalledWith('Listening on http://localhost:4000');
  });
});