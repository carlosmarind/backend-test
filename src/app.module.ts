import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;
  let appService: AppService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: AppService,
          useValue: {
            getHello: jest.fn().mockReturnValue('Hello !!'),
            getApikey: jest.fn().mockReturnValue('APIKEY!!'),
            validateRut: jest.fn((rut: string) => rut === '12345678-9'),
          },
        },
      ],
    }).compile();

    appController = module.get<AppController>(AppController);
    appService = module.get<AppService>(AppService);
  });

  it('should return hello', () => {
    expect(appController.getHello()).toBe('Hello !!');
  });

  it('should return apikey', () => {
    expect(appController.getApikey()).toBe('APIKEY!!');
  });

  it('should validate rut valid', () => {
    expect(appController.validateRut('12345678-9')).toEqual({ mensaje: 'rut valido' });
  });

  it('should validate rut invalid', () => {
    expect(appController.validateRut('11111111-1')).toEqual({ mensaje: 'rut invalido' });
  });
});
