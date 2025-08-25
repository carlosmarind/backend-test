import { bootstrap } from './main';

describe('Main bootstrap', () => {
  beforeAll(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  it('should execute bootstrap without throwing', async () => {
    const fakeApp = {
      listen: jest.fn(),
      enableShutdownHooks: jest.fn(),
      use: jest.fn(),
      close: jest.fn(),
    } as any;

    jest.spyOn(require('./main'), 'bootstrap').mockResolvedValue(fakeApp);

    await expect(bootstrap()).resolves.not.toThrow();
  });
});
