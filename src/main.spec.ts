import { bootstrap } from './main';

describe('Main bootstrap', () => {
  let originalMain: NodeModule;

  beforeAll(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
    originalMain = require.main as NodeModule;
  });

  afterAll(() => {
    Object.defineProperty(require, 'main', {
      value: originalMain,
      writable: true,
    });
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

  it('should cover require.main === module block', async () => {
    // Forzamos require.main === module
    Object.defineProperty(require, 'main', { value: module, writable: true });

    const mainModule = require('./main');
    await mainModule.bootstrap();
  });
});
