import app from '../src/server.js';
import request from 'supertest';

describe("Bateria de test de servidor", () => {

    test("Servidor en endpoint /", async () => {

        return await request(app)
            .get('/')
            .expect(200)
            .expect("Content-Type", /text/)
            .then(response => {
                expect(response.text).toBe("Hola mundo al usuario Julio Santibanez");
            });
    });

    test("Servidor en api-key", async () => {
        return await request(app)
            .get('/api-key')
            .expect(200)
            .expect("Content-Type", /text/)
            .then(response => {
                expect(response.text).toBe("la apikey de mi aplicacion es: api-key");
            })
    })

    test("Validar Rut", async () => {
        return await request(app)
            .get('/validar-rut?rut=166943833')
            .expect(200)
            .expect("Content-Type", /text/)
            .then(response => {
                expect(response.text).toBe("El rut suministrado (166943833) es : valido");
            })
    })
    test("Validar Rut", async () => {
        return await request(app)
            .get('/validar-rut?rut=166943830')
            .expect(200)
            .expect("Content-Type", /text/)
            .then(response => {
                expect(response.text).toBe("El rut suministrado (166943830) es : invalido");
            })
    })

    test("Validar Cadena", async () => {
        return await request(app)
            .get('/buscar-subcadena?cadena=llorones&subcadena=llorones')
            .expect(200)
            .expect("Content-Type", /text/)
            .then(response => {
                expect(response.text).toBe("La cadeja \"llorones\" tiene 1 repeticiones de la subcadena \"llorones\"");
            })
    })

    test("Validar Cadena", async () => {
        return await request(app)
            .get('/buscar-subcadena?cadena=colocolo&subcadena=colocolo')
            .expect(200)
            .expect("Content-Type", /text/)
            .then(response => {
                expect(response.text).toBe("La cadeja \"colocolo\" tiene 1 repeticiones de la subcadena \"colocolo\"");
            })
    })

    test("Validar Cadena", async () => {
        return await request(app)
            .get('/buscar-subcadena?cadena=casa&subcadena=dd')
            .expect(200)
            .expect("Content-Type", /text/)
            .then(response => {
                expect(response.text).toBe("La cadeja \"casa\" tiene 0 repeticiones de la subcadena \"dd\"");
            })
    })

    // test("Servidor en palindromo", async () => {
    //     return await request(app)
    //         .get('/palindromo?frase=reconocer')
    //         .expect(200)
    //         .expect("Content-Type", /text/)
    //         .then(response => {
    //             expect(response.text).toBe("Hola, La frase ingresada es palindromo");
    //         })
    // })

    // test("Servidor en palindromo", async () => {
    //     return await request(app)
    //         .get('/palindromo?frase=reconoce')
    //         .expect(200)
    //         .expect("Content-Type", /text/)
    //         .then(response => {
    //             expect(response.text).toBe("Hola, La frase ingresada no es palindromo");
    //         })
    // })

    // test("Servidor en primo", async () => {
    //     return await request(app)
    //         .get('/primo?numero=7')
    //         .expect(200)
    //         .expect("Content-Type", /text/)
    //         .then(response => {
    //             expect(response.text).toBe("Hola, el numero ingresado es un numero primo");
    //         })
    // })

    // test("Servidor en primo", async () => {
    //     return await request(app)
    //         .get('/primo?numero=1')
    //         .expect(200)
    //         .expect("Content-Type", /text/)
    //         .then(response => {
    //             expect(response.text).toBe("Hola, el numero ingresado no es un numero primo");
    //         })
    // })

});