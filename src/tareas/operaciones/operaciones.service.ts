import { Injectable } from '@nestjs/common';

@Injectable()
export class OperacionesService {
  private operacionesMap: Record<string, (a: number, b: number) => number> = {
    suma: (a, b) => a + b,
    resta: (a, b) => a - b,
    multiplicacion: (a, b) => a * b,
    division: (a, b) => {
      if (b === 0) return NaN;
      if (a === 0) return 0;
      return a / b;
    },
  };

  operar(a: number, b: number, operacion: string = ''): number | undefined {
    operacion = operacion || '';
    const fn = this.operacionesMap[operacion];
    return fn ? fn(a, b) : undefined;
  }
}
