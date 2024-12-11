import { describe, test, expect } from "@jest/globals";

import {validarRUT } from "../../src/app/rut";


describe("Bateria de test de calculadora", () => {
    test("Validar Rut", () => {
        expect(validarRUT('166943833')).toBe(true);

    });

    test("Validar Rut", () => {
        expect(validarRUT('166943833')).toBe(true);

    });
    test("Validar Rut", () => {
        expect(validarRUT('166943854')).toBe(false);

    });

    test("Validar Rut", () => {
        expect(validarRUT('166943')).toBe(false);

    });

    test("Validar Rut", () => {
        expect(validarRUT('//*/*')).toBe(false);

    });

    test("Validar Rut", () => {
        expect(validarRUT('')).toBe(false);

    });

    test("Validar Rut", () => {
        expect(validarRUT('27005392-0')).toBe(true);

    });


    
});