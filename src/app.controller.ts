import { Controller, Get, Query } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('/apikey')
  getApikey(): string {
    return this.appService.getApikey();
  }

  @Get('/validate-rut')
  validateRut(@Query('rut') rut: string) {
    const esValido = this.appService.validateRut(rut);

    return esValido
      ? { mensaje: 'rut valido' }
      : { mensaje: 'rut invalido' };
  }
}
