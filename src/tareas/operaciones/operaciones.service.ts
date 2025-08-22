import { Injectable } from '@nestjs/common';

@Injectable()
export class OperacionesService {
operar(a: number, b: number, operacion: string = '') {
  if (operacion === 'suma') {
    return this.#suma(a, b);
  } else if (operacion === 'resta') {
    return this.#resta(a, b);
  } else if (operacion === 'multiplicacion') {
    return this.#multiplicacion(a, b);
  } else if (operacion === 'division') {
    return this.#division(a, b);
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
    if (b === 0) {
      return NaN;
    } else if (a === 0) {
      return 0;
    }
    return a / b;
  }
}
