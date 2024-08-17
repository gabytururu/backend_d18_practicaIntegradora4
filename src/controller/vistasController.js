import jwt from "jsonwebtoken"
import { productsService } from "../services/productsService.js";
import { cartsService } from "../services/cartsService.js";
import { ticketsService } from "../services/ticketsService.js";
import { generateMockProduct } from "../utils.js";
import { reqLoggerDTO } from "../DTO/reqLoggerDTO.js";
import { config } from "../config/config.js";


export class VistasController{

    //loggerTest function
    static getLoggerTest=async(req,res)=>{
        req.logger.debug('testing debug logger',new reqLoggerDTO(req))
        req.logger.http('testing info logger',new reqLoggerDTO(req))
        req.logger.info('testing debug logger',new reqLoggerDTO(req))
        req.logger.warning('testing warging logger',new reqLoggerDTO(req))
        
        try{
            let test= await testFunction()
            res.setHeader('Content-type', 'application/json');
            return res.status(200).json({payload:test})
        }catch(error){
            req.logger.error('testing error logger',new reqLoggerDTO(req,error))
            req.logger.fatal('testing fatal logger',new reqLoggerDTO(req,error))
        }       
    }

    //mocking products function
    static getMockingProducts=async(req,res)=>{
        let mockingProducts = []
        for(let i=0; i<=100; i++){
            mockingProducts.push(generateMockProduct())
        }
        res.setHeader('Content-type', 'application/json');
        return res.status(200).json({payload:mockingProducts})
    }

    //Ecommerce real API functions
    static renderHome=async(req,res)=>{
        res.status(301).redirect('/login');
    }

    static renderProducts=async(req,res)=>{
        let {pagina, limit, sort, ...query}=req.query
        
        let userProfile = req.session.user   
        if(!userProfile) {userProfile = {rol:"public"}}
        userProfile.isUser = userProfile.rol === 'user';
        userProfile.isAdmin = userProfile.rol === 'admin';    
        userProfile.isPublic= userProfile.rol === 'public';
       
        if (!pagina) pagina=1;  
        if (!limit) limit=10;
        if (sort) sort= {price:sort};
        if (query.category) query.category = query.category;
        if (query.stock === "disponible") query.stock = { $gt: 0 };
    
    
        try{            
            const {docs:products,page,totalPages, hasPrevPage, hasNextPage, prevPage,nextPage} = await productsService.getProducts(query,{pagina,limit,sort})
            res.setHeader('Content-type', 'text/html');
            res.status(200).render('products',{
                products,
                page,
                totalPages, 
                hasPrevPage, 
                hasNextPage, 
                prevPage,
                nextPage,
                userProfile
            })
        }catch(error){
            res.setHeader('Content-type', 'application/json');     
            req.logger.error('Server Error 500',new reqLoggerDTO(req,error))       
            return res.status(500).json({
                error:`Unexpected server error (500) - try again or contact support`,
                message: error.message
            })
        }
    }

    static renderProductById=async(req,res)=>{ 
        const {pid} = req.params

        let userProfile = req.session.user
        if(!userProfile) {userProfile = {rol:"public"}}
        userProfile.isUser = userProfile.rol === 'user';
        userProfile.isAdmin = userProfile.rol === 'admin';    
        userProfile.isPublic= userProfile.rol === 'public';      
       
        try{
            const matchingProduct = await productsService.getProductBy({_id:pid})
            if(!matchingProduct){
                res.setHeader('Content-type', 'application/json'); 
                req.logger.info('Client Bounced: Product with ID# %s was not found in our database. Please verify your ID# and try again',pid,new reqLoggerDTO(req))     

                return res.status(404).json({
                    error: `Product with ID#${pid} was not found in our database. Please verify your ID# and try again`
                })
            }
            res.setHeader('Content-type', 'text/html');
            return res.status(200).render('singleProduct',{matchingProduct,userProfile})
        }catch(error){
            res.setHeader('Content-type', 'application/json');
            req.logger.error('Server Error 500',new reqLoggerDTO(req,error))    
            return res.status(500).json({
                error:`Unexpected server error (500) - try again or contact support`,
                message: `${error.message}`
            })
        }
    }

    static renderCarts=async(req,res)=>{
        try{           
            const carts = await cartsService.getCarts()
            if(!carts){
                req.logger.info('Client Bounced: No carts were found',new reqLoggerDTO(req))     
                return res.status(404).json({
                    error: `ERROR: resource not found`,
                    message: `No carts were found in our database, please try again later`
                })
            }       
            res.setHeader('Content-type', 'text/html')
            return res.status(200).render('carts',{carts})
        }catch(error){
            res.setHeader('Content-type', 'application/json');
            req.logger.error('Server Error 500',new reqLoggerDTO(req,error))       
            return res.status(500).json({
                error:`Unexpected server error (500) - try again or contact support`,
                message: error.message
            })
        }
        
    }

    static renderCartById=async(req,res)=>{
        const {cid} = req.params
       
        try{           
            const matchingCart = await cartsService.getCartById(cid)
            if(!matchingCart){
                req.logger.info('Client Bounced:  Cart id# provided was not found',new reqLoggerDTO(req))  
                return res.status(404).json({
                    error: `ERROR: Cart id# provided was not found`,
                    message: `Resource not found: The Cart id provided (id#${cid}) does not exist in our database. Please verify and try again`
                })
            }     
            res.setHeader('Content-type', 'text/html');
            return res.status(200).render('singleCart',{matchingCart})
        }catch(error){
            res.setHeader('Content-type', 'application/json');
            req.logger.error('Server Error 500',new reqLoggerDTO(req,error)) 
            return res.status(500).json({
                error:`Error inesperado en servidor - intenta mas tarde`,
                message: `${error.message}`
            })
        }
    }

    static renderChat=async(req,res)=>{
        res.setHeader('Content-type', 'text/html');
        res.status(200).render('chat')
    }

    static renderRegistro=async(req,res)=>{
        if(req.session.user){
            return res.status(302).redirect('/perfil')
        }
        res.setHeader('Content-type', 'text/html');
        res.status(200).render('registro')
    }

    static renderLogin=async(req,res)=>{
        if(req.session.user){
            return res.status(302).redirect('/perfil')
        }
        res.setHeader('Content-type', 'text/html');
        res.status(200).render('login')
    }

    static renderPerfil=async(req,res)=>{
        res.setHeader('Content-type', 'text/html');
        res.status(200).render('perfil',{
            user:req.session.user
        })
    }

    static renderPerfilUploads=async(req,res)=>{
        res.setHeader('Content-type', 'text/html');
        res.status(200).render('perfilUploads',{
            user:req.session.user
        })
    }

    static renderLogout=async(req,res)=>{
        res.setHeader('Content-type', 'text/html');
        res.status(200).render('logout')
    }

    static renderTicket=async(req,res)=>{
        const {tid} =req.params

        try{
            const matchingTicket = await ticketsService.getPurchaseTicket({_id:tid})
            if(!matchingTicket){
                res.setHeader('Content-type', 'application/json');
                req.logger.info('Client Bounced:  Ticket id# provided was not found',new reqLoggerDTO(req))
                return res.status(404).json({
                    error:`Error 400 Resource not found, please verify and try again`,
                    message: `${error.message}`
                })
            }
            res.setHeader('Content-type', 'text/html');
            res.status(200).render('ticket',{
                sessionData: req.session,
                ticketDetails:matchingTicket
            })    
        }catch(error){
            res.setHeader('Content-type', 'application/json');
            req.logger.error('Server Error 500',new reqLoggerDTO(req,error)) 
            return res.status(500).json({
                error:`Unexpected server error (500) - try again or contact support`,
                message: error.message
            })
        }
    }

    static renderPassword=async(req,res)=>{    
        res.setHeader('Content-type', 'text/html');
        return res.status(200).render('password')
    }

    static renderResetPassword=async(req,res)=>{
        const {token} = req.query

        if(!token){
            return res.status(301).redirect('/error')
        }   
        
       // let usuario=jwt.verify(token,config.JWT_SECRET,(error,decoded)=>{
        jwt.verify(token,config.JWT_SECRET,(error,jwtDecodedUser)=>{
            if(error){
                res.setHeader('Content-type', 'text/html');
                return res.status(401).render('redirectError',{
                    error:`Error 401 The token has expired or is invalid`,
                    details: `El token brindado ya expiró o es inválido. Necesitamos emitir un nuevo token a tu email para completar el reestablecimiento de tu contraseña`,
                    message: `${error.message}`
                })
            }else{
                req.user = jwtDecodedUser 
                let {first_name:userName, email:email, password:userOldPassword} = req.user
                res.setHeader('Content-type', 'text/html');
                return res.status(200).render('resetPassword',{userName, email, userOldPassword})
            }
        })      
    }

    static renderError=async(req,res)=>{  
        res.setHeader('Content-type', 'text/html');
        return res.status(200).render('error404')
    }
}

