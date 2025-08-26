import { Controller, Get, Query, Res } from '@nestjs/common';
import { OperacionesService } from './operaciones.service';
import { Response } from 'express';

@Controller('operaciones')
export class OperacionesController {
  constructor(private readonly operService: OperacionesService) {}

  @Get()
  operar(
    @Res() res: Response,
    @Query('operacion') operacion: string,
    @Query('a') a: number,
    @Query('b') b: number,
  ) {
    const calculo = this.operService.operar(operacion, +a, +b);

    // Se comprueba explícitamente que el resultado no sea undefined (operación inválida) o NaN (división por cero).
    // Esto permite que el 0 sea un resultado válido.
    if (calculo !== undefined && !Number.isNaN(calculo)) {
      return res
        .status(200)
        .json({ resultado: calculo, mensaje: 'operacion exitosa' });
    }

    return res
      .status(502)
      .json({ resultado: null, mensaje: 'operacion no pudo ser calculada' });
  }
}
