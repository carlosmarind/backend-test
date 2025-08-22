import { Controller, Get, Query, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { Response } from 'express';

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
  validateRut(@Res() res: Response, @Query('rut') rut: string) {
    const valido = this.appService.validateRut(rut);
    if (valido) {
      return res.status(200).json({ mensaje: 'rut valido' });
    }
    return res.status(400).json({ mensaje: 'rut invalido' });
  }
}