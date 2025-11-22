import { Controller, Get, Query, Res } from '@nestjs/common';
import { OperacionesService } from './operaciones.service';
import { Response } from 'express';

@Controller('operaciones')
export class OperacionesController {
  constructor(private readonly operService: OperacionesService) { }

  @Get()
  async operar(
    @Res() res: Response,
    @Query('operacion') operacion: string,
    @Query('a') a: number,
    @Query('b') b: number,
  ) {
    try {

      const calculo = this.operService.operar(+a, +b, operacion);

      if (!Number.isNaN(calculo) && calculo !== undefined) {
        return res
          .status(200)
          .json({ resultado: calculo, mensaje: 'operación exitosa' });
      }

      return res
        .status(502)
        .json({ resultado: NaN, mensaje: 'operación no pudo ser calculada' });

    } catch (error){
      return res
        .status(422)
        .json({ resultado: NaN, mensaje: `${error.message}` })
    }
  }
}