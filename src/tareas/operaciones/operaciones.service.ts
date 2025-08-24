import { Injectable } from '@nestjs/common';

@Injectable()
export class OperacionesService {
  operar(operacion: string = '', a: number, b: number) {
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
    if (a === undefined || b === undefined) {
      throw new Error('No se puede llamar con numeros indefinidos');
    }

    if (typeof a !== 'number' || typeof b !== 'number') {
      return NaN;
    }

    return a + b;
  }

  #resta(a: number, b: number) {
    if (a === undefined || b === undefined) {
      throw new Error('No se puede llamar con numeros indefinidos');
    }

    if (typeof a !== 'number' || typeof b !== 'number') {
      return NaN;
    }

    return a - b;
  }

  #multiplicacion(a: number, b: number) {
    if (a === undefined || b === undefined) {
      throw new Error('No se puede llamar con numeros indefinidos');
    }

    if (typeof a !== 'number' || typeof b !== 'number') {
      return NaN;
    }

    return a * b;
  }

  #division(a: number, b: number) {
    if (a === undefined || b === undefined) {
      throw new Error('No se puede llamar con numeros indefinidos');
    }

    if (typeof a !== 'number' || typeof b !== 'number') {
      return NaN;
    }

    if (b === 0) {
      return NaN;
    } else if (a === 0) {
      return 0;
    }
    return a / b;
  }
}
