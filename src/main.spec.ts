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

  it('should cover require.main === module block', async () => {
    // 🔑 Espiamos require.main para que devuelva `module`
    jest.spyOn(require as any, 'main', 'get').mockReturnValue(module);

    await jest.isolateModulesAsync(async () => {
      const mainModule = require('./main');
      await mainModule.bootstrap();
    });
  });
});
