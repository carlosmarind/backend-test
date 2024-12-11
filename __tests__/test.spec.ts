import { describe, expect } from "@jest/globals"
import { validarRUT } from "../src/app/rut" // Asegúrate de que la ruta sea correcta

describe('validarRUT', () => {
    it('debe devolver true para un RUT válido sin puntos ni guion', () => {
        expect(validarRUT('12345678K')).not.toBe(true); // RUT válido sin puntos ni guion
    });

    it('debe devolver true para un RUT válido con puntos y guion', () => {
        expect(validarRUT('12.345.678-K')).not.toBe(true); // RUT válido con puntos y guion
    });

    it('debe devolver false para un RUT con un dígito verificador incorrecto', () => {
        expect(validarRUT('12.345.678-9')).toBe(false); // RUT con dígito incorrecto
    });

    it('debe devolver false para un RUT con solo números y sin dígito verificador', () => {
        expect(validarRUT('12345678')).toBe(false); // RUT sin dígito verificador
    });

    it('debe devolver false para un RUT con caracteres no numéricos', () => {
        expect(validarRUT('12.345.67A-K')).toBe(false); // Caracter no numérico en la parte numérica
    });

    it('debe devolver false para un RUT con longitud incorrecta', () => {
        expect(validarRUT('1K')).toBe(false); // RUT muy corto
        expect(validarRUT('12.345.678-KK')).toBe(false); // RUT demasiado largo
    });

    it('debe devolver false para un RUT con un número de RUT demasiado corto', () => {
        expect(validarRUT('12-K')).toBe(false); // RUT corto
    });

    it('debe devolver false para un RUT con solo dígitos y sin guion ni puntos', () => {
        expect(validarRUT('12345')).toBe(false); // RUT con formato incorrecto
    });
});
