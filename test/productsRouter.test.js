import { describe, it, afterEach, before } from "mocha";
import { expect } from "chai";
import supertest from "supertest-session";
import mongoose, {isValidObjectId} from "mongoose";


const requester=supertest("http://localhost:8080")
//npx mocha ./test/productsRouter.test.js --exit

describe("Backend Ecommerce Proyect: Products Router Test",function(){
    this.timeout(10000)        
    describe("GET api/products/",function(){
        it("La ruta GET /api/products opera OK y retorna contenido",async function(){
            const {body,status}= await requester.get("/api/products")
            expect(status).to.equal(200)
            expect(body).to.exist
            expect(body.payload).to.exist           
        })

        it("La ruta GET /api/products opera OK, retorna contenido, y su contenido es un Array de productos",async function(){    
            const {body}= await requester.get("/api/products")                
            expect(body.payload).to.exist
            expect(Array.isArray(body.payload)).to.exist
            expect(Array.isArray(body.payload)).to.be.true
        })

        it("La ruta GET /api/products opera OK, retorna contenido, y su contenido es un Array de productos con props _id,code,y title",async function(){
            const {body}= await requester.get("/api/products")                
            expect(body.payload).to.exist
            expect(Array.isArray(body.payload)).to.exist
            expect(Array.isArray(body.payload)).to.be.true    
            let producto=body.payload[0]           
            expect(producto).has.property("_id")
            expect(producto).has.property("code")
            expect(producto).has.property("title")
        })

        it("la ruta GET /api/products?limit={limit} opera OK, retorna contenido, y la cantidad de productos devuelta coincide con los indicados en el query param", async function(){
            let limit = 3
            const {body,status}=await requester.get(`/api/products?limit=${limit}`)
            expect(status).to.exist.and.to.equal(200)
            expect(body.payload.length).to.equal(limit)
        }) 
    })
    describe("GET api/products/:pid",function(){
        it("La ruta GET /api/products/:pid opera OK, y retorna 1 objeto con mínimo 9 propiedades",async function(){
            let pid= "663d200860f80adeaa82bb5a"
            const {body,status}=await requester.get(`/api/products/${pid}`)
            expect(status).to.equal(200)
            expect(body.payload).to.exist
            expect(body.payload).to.be.an("object")
            expect(Object.keys(body.payload).length).to.be.greaterThan(8)
        })
        it("La ruta GET /api/products/:pid retorna ERROR cuando :pid no es un formato válido",async function(){
            let pid= "663d200860f80adeaa82bb"
            const {body,status}=await requester.get(`/api/products/${pid}`)
            expect(status).to.equal(400)
            expect(isValidObjectId(pid)).to.equal(false)
        })
        it("La ruta GET /api/products/:pid retorna ERROR 404 cuando :pid es válido pero no existe en la BD",async function(){
            let pid= "663d200860f80adeaa82bb5b"
            const {body,status}=await requester.get(`/api/products/${pid}`)
            expect(status).to.equal(404)
        })
    })   
    
})


