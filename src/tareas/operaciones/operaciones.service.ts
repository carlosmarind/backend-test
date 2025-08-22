import { Injectable } from '@nestjs/common';

@Injectable()
export class OperacionesService {
  operar(operacion: string, a: number, b: number) {
    switch (operacion) {
      case 'suma':
        return this.#suma(a, b);
      case 'resta':
        return this.#resta(a, b);
      case 'multiplicacion':
        return this.#multiplicacion(a, b);
      case 'division':
        return this.#division(a, b);
      default:
        return this.#error();
    }
  }

  #suma(a: number, b: number) {
    return a + b;
  }

  #resta(a: number, b: number) {
    return a - b;
  }

  #multiplicacion(a: number, b: number) {
    return a * b;
  }

  #division(a: number, b: number) {
    if (b === 0) return NaN;
    if (a === 0) return 0;
    return a / b;
  }

  #error() {
    return undefined;
  }
}
