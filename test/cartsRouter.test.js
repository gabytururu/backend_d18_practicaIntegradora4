import { describe, it, afterEach, before } from "mocha";
import { expect } from "chai";
import supertest from "supertest-session";
import mongoose, {isValidObjectId} from "mongoose";


const requester=supertest("http://localhost:8080")
//npx mocha ./test/cartsRouter.test.js --exit

describe("Backend Ecommerce Proyect: Carts Router Test",function(){
    this.timeout(10000)

    describe("GET api/carts/ -> sin usuario loggeado o con usuario incorrecto",async function(){
        it("La ruta GET /api/carts sin usuario loggeado retorna Error 401",async function(){
            const {body,status}= await requester.get("/api/carts")
            expect(status).to.equal(401)
            expect(body).to.exist   
            expect(body.type).to.equal("Authentication failed")   
        })  
        it("La ruta GET /api/carts con usuario invalido retorna Error 403",async function(){
            let user={"email":"pp@test.com", "password":"123456"}
            try {
                user = await requester.post("/api/sessions/login").send(user)
             } catch (error) {
                 console.log(`Error attempting LOGIN in RouterCarts tests: ${error}`)
             }
            const {body,status}= await requester.get("/api/carts")
            expect(status).to.equal(403)
            expect(body).to.exist   
            expect(body.type).to.equal("Authorization failed")   
        })    
    })
    
    describe("GET api/carts/",async function(){
        before(async function(){
            let admin={"email":"adminCoder@coder.com", "password":"adminCod3r123"}
            try {
               user = await requester.post("/api/sessions/login").send(admin)            
            } catch (error) {
                console.log(`Error attempting LOGIN in RouterCarts tests: ${error}`)
            }
        })
        after(async function(){
            try {
                await requester.get("/api/sessions/logout")
            } catch (error) {
                console.log(`Error attempting LOGOUT in RouterCarts Test`)
            }
        })
        it("La ruta GET /api/carts opera OK y retorna contenido",async function(){
            const {body,status}= await requester.get("/api/carts")
            expect(status).to.equal(200)
            expect(body).to.exist
            expect(body.payload).to.exist           
        })  
        it("La ruta GET /api/carts opera OK, retorna contenido, y su contenido es un Array de carritos",async function(){    
            const {body}= await requester.get("/api/carts")                
            expect(body.payload).to.exist
            expect(body.payload).to.be.an("array")
        }) 
        it("La ruta GET /api/carts opera OK, retorna contenido, y su contenido es un Array de carritos con props _id y products",async function(){
            const {body}= await requester.get("/api/carts")                
            expect(body.payload).to.exist
            expect(body.payload).to.be.an("array")
            let carrito=body.payload[0]           
            expect(carrito).has.property("_id")
            expect(carrito).has.property("products")
        })
        it("La ruta GET /api/carts opera OK, retorna contenido, y su contenido tiene una prop llamada products de tipo Array",async function(){
            const {body}= await requester.get("/api/carts")                
            expect(body.payload).to.exist
            expect(body.payload).to.be.an("array")
            let carrito=body.payload[0]           
            expect(carrito).has.property("products").to.be.an("array")
        })
    }) 

    describe("GET api/carts/:cid",function(){       
        before(async function(){
            let user={"email":"premium2@test.com", "password":"123456"}
            try {
               user = await requester.post("/api/sessions/login").send(user)            
            } catch (error) {
                console.log(`Error attempting LOGIN in RouterCarts tests: ${error}`)
            }
        })
        after(async function(){
            try {
                await requester.get("/api/sessions/logout")
            } catch (error) {
                console.log(`Error attempting LOGOUT in RouterCarts Test`)
            }
        })
        it("La ruta GET /api/carts/:cid opera OK, y retorna 1 objeto con mínimo 2 propiedades",async function(){
            let cid= "66340884792a6e5bf8ff52f8"
            const {body,status}=await requester.get(`/api/carts/${cid}`)
            expect(status).to.equal(200)
            expect(body.payload).to.exist
            expect(body.payload).to.be.an("object")
            expect(Object.keys(body.payload).length).to.be.greaterThan(2)
        })
        it("La ruta GET /api/carts/:cid retorna ERROR cuando :cid no es un formato válido",async function(){
            let cid= "66340884792a6e5bf8ff"
            const {status}=await requester.get(`/api/carts/${cid}`)
            expect(status).to.equal(400)
            expect(isValidObjectId(cid)).to.equal(false)
        })
        it("La ruta GET /api/products/:cid retorna ERROR 404 cuando :cid es válido pero no existe en la BD",async function(){
            let cid= "66340884792a6e5bf8ff52f9"
            const {status}=await requester.get(`/api/carts/${cid}`)
            expect(status).to.equal(404)
        })
    })
})

  
