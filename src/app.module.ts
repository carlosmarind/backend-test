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
    const result: string = appController.getHello();
    expect(result).toBe('Hello !!');
  });

  it('should return apikey', () => {
    const result: string = appController.getApikey();
    expect(result).toBe('APIKEY!!');
  });

  it('should validate rut as valid', () => {
    const result = appController.validateRut('12345678-9');
    expect(result).toEqual({ mensaje: 'rut valido' });
  });

  it('should validate rut as invalid', () => {
    const result = appController.validateRut('11111111-1');
    expect(result).toEqual({ mensaje: 'rut invalido' });
  });
});
