import {fileURLToPath} from 'url';
import {dirname} from 'path';
import bcrypt from 'bcrypt';
import passport from 'passport';
import nodemailer from 'nodemailer';
import { config } from './config/config.js';
import {fakerES_MX as faker} from '@faker-js/faker';
import swaggerJsdoc from 'swagger-jsdoc';
import multer from "multer"


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename)

export default __dirname

export const hashPassword = (password) => bcrypt.hashSync(password,bcrypt.genSaltSync(10))
export const validatePassword = (password, hashPassword) =>bcrypt.compareSync(password, hashPassword)

export const validatePasswordAsync = async (password, hashPassword) => {
    try {
        const isMatch = await bcrypt.compare(password, hashPassword);
        return isMatch;
    } catch (error) {
        console.error('Error comparing passwords:', error);
        res.setHeader('Content-type', 'application/json');
        return res.status(500).json({
            error:`Error 500 Server failed unexpectedly at validatePasswordAsync, please try again later`,
            message: `${error.message}`
        })
    }
};


export const passportCallError = (estrategia) =>{
    return function (req,res,next){
        passport.authenticate(estrategia,function(err,user,info,status){
            if(err) {return next(err)} 
            if(!user) { 
                res.setHeader('Content-type', 'application/json');
                return res.status(401).json({
                    error: info.message?info.message:info.toString()
                })
            } 
            req.user=user; 
            return next()
        })(req,res,next);
    }
}

export const uniqueTicketCode = (user)=>{
    const nameCode = user.first_name.slice(0,2).toUpperCase()
    const lastnameCode = user.last_name.slice(0,2).toUpperCase()
    const dateTimeCode = new Date().toISOString().replace(/[-:.TZ]/g, '')
    const uniqueCode = `${nameCode}${lastnameCode}${dateTimeCode}`
    return uniqueCode
}

const transporter=nodemailer.createTransport(
    {
        service:"gmail",
        port:"587", 
        auth:{
            user: config.GMAIL_EMAIL, 
            pass: config.GMAIL_PASS
        }
    }
)

export const sendEmail=async(de,para,asunto,mensaje)=>{
    return await transporter.sendMail(
        {
            from:de,
            to:para,
            subject:asunto,
            html:mensaje,
        }
    )
}

export const generateMockProduct=()=>{
    const categories=['senderismo', 'escalada', 'buceo', 'ciclismo']
    const mockProduct={
        _id: faker.database.mongodbObjectId(),
        title: faker.commerce.product(),
        description:faker.commerce.productDescription(),
        price:faker.commerce.price({min:30, max:120}),
        code:faker.number.int({min:10000,max:99999}),
        status: true,
        category: categories[Math.floor(Math.random()*categories.length)],
        thumbnails:faker.image.urlPicsumPhotos({}),
        createdAt:faker.date.anytime({}),
        updatedAt:faker.date.anytime({}),
        __v:0,        
    }
    mockProduct.id=mockProduct._id
    return mockProduct
}

const options = {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'Ecommerce Documentation',
        version: '1.0.0',
        description: `
            Documentación de la API del Proyecto de Backend E-Commerce Coderhouse
            
            Este documento contiene el detalle de los endpoints principales de la App. 

            Authenticación:
            - **Importante:** Para probar(try) la mayoría de los endpoints, el usuario debe estar registrado y loggeado.
            - Utilza la pagina de login principal (home) para establecer una sesión. Una vez realizado lo anterior, puedes volver a esta documentación y testear los endpoints.
            - Endpoints de modificación como PUT, POST, DELETE, y otros tantos como \`/api/carts\` retornarán 401 o 403 si no te has autenticado con las credenciales correctas.
            
            Uso:
            - Puedes empezar testeando los endpoints públicos (ej. GET /products, GET /products/{pid}) y posteriormente, una vez que ya estés loggeado, probar los endpoints seguros.
            - Sigue la estrucdtura sugerida en los ejemplos para interactuar correctamente con la API.
        `,          
      },
      servers: [
        {
            url: 'http://localhost:8080',
            description:"production"
        },
      ],
    },
    apis: ['./src/docs/*.yaml'], 
  };
  export const specs = swaggerJsdoc(options);
 
const storage=multer.diskStorage({
    destination: function(req,file,cb){
        console.log('el file a como viene en multer', file)
        let folder ='';
        console.log('la req.body.name desde MULTER',req.body.name)
       
        
        switch(file.fieldname){
            case "profilePic":
                folder="./src/public/uploads/profile";
                break;
            case "identificacion":
            case "compDomicilio":
            case "edoCuenta":
                folder="./src/public/uploads/documents";
                break;
            case "products":
                folder="./src/public/uploads/products"
                break;
            default:
                folder="./src/public/uploads/others"
                break;
        }
       
       // cb(null,"./src/uploads") // cambiar a path absoluto
        cb(null,folder) // cambiar a path absoluto
    },
    filename:function(req,file,cb){
        cb(null,file.originalname)
    }
})

export const upload=multer({storage:storage})

export const cleanPath=(path)=>{
    return `./${path.split('\\').join('/')}`
}

//future development
// export const ROLES = Object.freeze({
//     admin: 'admin',
//     user: 'user',
//     premium: 'premium_user',
//     public: 'public'
// });
