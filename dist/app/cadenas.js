export function contarCoincidenciasEnCadena(cadena, subcadena) {
    let coincidencias = 0;
    for (let i = 0; i < cadena.length; i++) {
        for (let j = 0; j < subcadena.length; j++) {
            if (subcadena[j] !== cadena[i + j]) {
                break;
            }
            if (j === subcadena.length - 1) {
                coincidencias++;
            }
        }
    }
    return coincidencias;
}
//# sourceMappingURL=cadenas.js.map