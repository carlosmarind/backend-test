import { describe, test, expect } from "@jest/globals";
import { contarCoincidenciasEnCadena} from "../../src/app/cadenas";


describe("Bateria de test de cadenas", () => {

    
    describe("test cadenas", () => {


    test("Validar Cadenas", () => {
        expect(contarCoincidenciasEnCadena("casa","dfssd")).toBe(0);

    });

    test("test cadenas", () => {
        expect(contarCoincidenciasEnCadena("","dfssd")).toBe(0);

    });

    test("Validar Cadenas", () => {
        expect(contarCoincidenciasEnCadena("colocolo","colocolo")).toBe(1);

    });

    test("Validar cadenas", () => {
        expect(contarCoincidenciasEnCadena("llorones","llorones")).toBe(1);

    });


    
    });



   

});