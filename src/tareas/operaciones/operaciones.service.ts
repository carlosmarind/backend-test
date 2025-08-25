import { Injectable } from "@nestjs/common";

@Injectable()
export class OperacionesService {
  operar(a: number, b: number, operacion: string = ''): number | undefined {
    switch (operacion) {
      case 'suma': return this.suma(a, b);
      case 'resta': return this.resta(a, b);
      case 'multiplicacion': return this.multiplicacion(a, b);
      case 'division': return this.division(a, b);
      default: return undefined;
    }
  }

  private suma(a: number, b: number) { return a + b; }
  private resta(a: number, b: number) { return a - b; }
  private multiplicacion(a: number, b: number) { return a * b; }
  private division(a: number, b: number) {
    if (b === 0) return NaN;
    if (a === 0) return 0;
    return a / b;
  }
}
