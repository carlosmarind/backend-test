const mockListen = jest.fn().mockResolvedValue(true);
const mockGetUrl = jest.fn().mockResolvedValue('http://localhost:4000');

const mockApp = {
  listen: mockListen,
  getUrl: mockGetUrl,
  close: jest.fn(),
};

const mockCreate = jest.fn().mockResolvedValue(mockApp);

jest.mock('@nestjs/core', () => ({
  NestFactory: { create: mockCreate },
}));

const mockLog = jest.fn();
jest.mock('@nestjs/common', () => ({
  Logger: jest.fn(() => ({ log: mockLog })),
}));

import './main';

describe('main.ts bootstrap', () => {
  it('debería crear y levantar la aplicación correctamente', async () => {

    expect(mockCreate).toHaveBeenCalledWith(expect.any(Function));

    expect(mockListen).toHaveBeenCalledWith(
      process.env.PORT ?? 4000,
      '0.0.0.0'
    );

    expect(mockLog).toHaveBeenCalledWith('Listening on http://localhost:4000');
  });
});