import { Injectable } from '@nestjs/common';

@Injectable()
export class OperacionesService {
  operar(operacion: string, a: number, b: number): number | undefined {
    if (typeof a !== 'number' || typeof b !== 'number' || Number.isNaN(a) || Number.isNaN(b)) {
      return undefined;
    }

    const op = (operacion || '').toLowerCase().trim();

    switch (op) {
      case 'suma':
      case 'sumar':
      case 'add':
      case '+':
        return a + b;

      case 'resta':
      case 'restar':
      case 'sub':
      case '-':
        return a - b;

      case 'multiplicar':
      case 'multiplicacion':
      case 'producto':
      case 'mul':
      case '*':
        return a * b;

      case 'dividir':
      case 'division':
      case 'div':
      case '/':
        if (b === 0) return NaN;
        return a / b;

      default:
        return undefined;
    }
  }
}
