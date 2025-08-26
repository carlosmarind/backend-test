// src/app.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import appConfig from './config/configuration';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        {
          provide: appConfig.KEY,
          useValue: {
            port: 3000,
            username: 'jest-user',
            apikey: 'jest-key',
            database: { host: 'localhost', port: 5432 },
          },
        },
      ],
    }).compile();

    appController = module.get<AppController>(AppController);
  });

  describe('Probar el modulo raiz del proyecto', () => {
    test('Esto deberia retornar hola mundo en ingles"', () => {
      expect(appController.getHello()).toBe('Hello jest-user!!');
    });
  });
});
