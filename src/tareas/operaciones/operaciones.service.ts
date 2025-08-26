// src/tareas/operaciones/operaciones.service.ts
import { Injectable } from '@nestjs/common';

@Injectable()
export class OperacionesService {
  operar(
    operacion: string,
    a: number,
    b: number,
  ): number | null | undefined {
    if (!Number.isFinite(a) || !Number.isFinite(b)) {
      return null;
    }

    switch (operacion) {
      case 'suma':
        return a + b;
      case 'resta':
        return a - b;
      case 'multiplicar':
        return a * b;
      case 'dividir':
        return b === 0 ? null : a / b;
      default:
        return undefined;
    }
  }
}
