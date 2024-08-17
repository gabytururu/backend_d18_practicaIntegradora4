import { describe, it, afterEach, before } from "mocha";
import { expect } from "chai";
import supertest from "supertest-session";

const requester=supertest("http://localhost:8080")
//npx mocha ./test/sessionsRouter.test.js --exit

describe("Backend Ecommerce Proyect: Sessions Router Test",function(){
    this.timeout(10000)
    after(async function(){
            try {
                await requester.get("/api/sessions/logout")
            } catch (error) {
                console.log(`Error attempting LOGOUT in api/sessions/login Test`)
            }
    })

    describe("POST api/sessions/login -> enviando datos de user sin privilegios", async function(){
        it("La ruta POST /api/sessions/login enviando datos incorrectos, retorna Error 401", async function(){
            const response = await requester.post("/api/sessions/login")
            expect(response.status).to.equal(401)
            expect(response.body.error).to.equal('Missing credentials')
        })
        it("La ruta POST /api/sessions/login enviando password incorrecto, retorna Error 401", async function(){
            let user={"email":"premium2@test.com", "password":"898989"}            
            const response = await requester.post("/api/sessions/login").send(user)
            expect(response.status).to.equal(401)
            expect(response.body.error).includes('invalid password')
        })
    })

    describe("POST api/sessions/login", async function(){
        it("La ruta POST /api/sessions/login enviando datos correctos opera OK y retorna contenido", async function(){
            let user={"email":"premium2@test.com", "password":"123456"}   
            const response = await requester.post("/api/sessions/login").send(user)
            expect(response.status).to.equal(200)
            expect(response.body).has.property("payload")
            
        })
        it("La ruta POST /api/sessions/login enviando datos correctos opera OK y retorna payload de usuario con props que incluyen nombre, email, rol, y carrito", async function(){
            let user={"email":"premium2@test.com", "password":"123456"}   
            const response = await requester.post("/api/sessions/login").send(user)
            expect(response.status).to.equal(200)
            expect(response.body).has.property("payload")            
            expect(response.body.payload).to.include.keys("nombre","email","rol","carrito")            
        })        
    })

    describe("GET api/sessions/current",async function(){
        it("a ruta GET /api/sessions/current, que retorna el usuario loggeado al momento",async function(){
            const response=await requester.get("/api/sessions/current")
            expect(response.status).to.equal(200)
            expect(response.body).to.has.property("payload")
            expect(response.body.payload).to.include.keys("fullName","email","cart")
        })
    })

})