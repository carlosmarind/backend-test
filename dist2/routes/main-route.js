import express from 'express';
import { configuration } from '../config.js';
import { validarRUT } from '../app/rut.js';
import { contarCoincidenciasEnCadena } from '../app/cadenas.js';
let mainRouter = express.Router();
mainRouter.get("/", (_req, res) => {
    return res.send(`Hola mundo al usuario ${configuration.username}`);
});
mainRouter.get("/api-key", (_req, res) => {
    return res.send(`la apikey de mi aplicacion es: ${configuration.apikey}`);
});
mainRouter.get("/validar-rut", (req, res) => {
    const { rut } = req.query;
    let resultado = validarRUT(rut);
    return res.send(`El rut suministrado (${rut}) es : ${resultado ? "valido" : "invalido"}`);
});
mainRouter.get("/buscar-subcadena", (req, res) => {
    const { cadena, subcadena } = req.query;
    const cantidadRepeticiones = contarCoincidenciasEnCadena(cadena, subcadena);
    return res.send(`La cadeja "${cadena}" tiene ${cantidadRepeticiones} repeticiones de la subcadena "${subcadena}"`);
});
export default mainRouter;
//# sourceMappingURL=main-route.js.map