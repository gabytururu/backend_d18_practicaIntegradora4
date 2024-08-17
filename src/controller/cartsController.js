import { productsService } from '../services/productsService.js';
import { cartsService } from '../services/cartsService.js';
import { ticketsService } from '../services/ticketsService.js';
import { isValidObjectId } from 'mongoose';
import { ticketDTO } from '../DTO/ticketDTO.js';
import { uniqueTicketCode } from '../utils.js';
import { sendEmail } from '../utils.js';
import { UsersManagerMongo as UsersManager } from '../dao/usersManagerMONGO.js';
import { config } from '../config/config.js';
import { CustomError } from "../utils/CustomError.js";
import { invalidCartBody, notFound, notProcessed } from "../utils/errorCauses.js";
import { ERROR_CODES } from "../utils/EErrors.js";
import { reqLoggerDTO } from '../DTO/reqLoggerDTO.js';
import { usersService } from '../services/usersService.js';
// import { TicketsMongoDAO } from '../dao/ticketsMongoDAO.js';

const usersManager = new UsersManager() //maybe move to a service?

export class CartsController{
    static getCarts=async(req,res)=>{
        res.setHeader('Content-type', 'application/json');    
        try{
            const carts = await cartsService.getCarts() 
            if(!carts){
                return res.status(404).json({
                    error: `ERROR: resource not found`,
                    message: `No carts were found in our database, please try again later`
                })
            }             
            res.status(200).json({payload:carts})
        }catch(error){
            req.logger.error('Server Error 500',new reqLoggerDTO(req,error)) 
            return res.status(500).json({
                error:`Unexpected server error - try again or contact support`,
                message: error.message
            })
        }
    }

    static getCartById=async(req,res)=>{
        const {cid}=req.params
        res.setHeader('Content-type', 'application/json');
    
        if(!isValidObjectId(cid)){
            return res.status(400).json({error:`The Cart ID# provided is not an accepted Id Format in MONGODB database. Please verify your Cart ID# and try again`})
        }
    
        try {
            const matchingCart = await cartsService.getCartById(cid) 
            if(!matchingCart){
                return res.status(404).json({
                    error: `ERROR: Cart id# provided was not found`,
                    message: `Resource not found: The Cart id provided (id#${cid}) does not exist in our database. Please verify and try again`
                })
            }        
            return res.status(200).json({payload: matchingCart})
        } catch (error) {
            req.logger.error('Server Error 500',new reqLoggerDTO(req,error)) 
            return res.status(500).json({
                error:`Unexpected server error - try again or contact support`,
                message: error.message
            })
        }
    
    }

    static postNewCart=async(req,res)=>{
        res.setHeader('Content-type', 'application/json')
        try {
         
            const newCart = await cartsService.createNewCart()
            if(!newCart){
                return res.status(404).json({
                    error: `ERROR: resource not found - new cart not posted`,
                    message: `Resource not found: the new cart could not be created. Please try again`
                })
            }
            return res.status(200).json({
                newCart
            })
        } catch (error) {
            req.logger.error('Server Error 500',new reqLoggerDTO(req,error)) 
            return res.status(500).json({
                error:`Unexpected server error (500) - try again or contact support`,
                message: error.message
            })
        }
    }

    // falta TESTEAR POST VALIDACION DE    if(pidIsValid.owner===userEmail){
    static replaceCartContent=async(req,res)=>{
        const {cid} = req.params;
        const newCartDetails = req.body
        const {email: userEmail, _id:userId, rol:userRol}= req.session.user
        res.setHeader('Content-type', 'application/json')
    
        if(!isValidObjectId(cid)){
            return res.status(400).json({error:`The Cart ID# provided is not an accepted Id Format in MONGODB database. Please verify your Cart ID# and try again`})
        }
    
        try{           
            const cartIsValid = await cartsService.getCartById(cid)
            if(!cartIsValid){
                return res.status(404).json({
                    error: `ERROR: Cart id# provided was not found`,
                    message: `Failed to replace the content in cart due to invalid argument: The Cart id provided (id#${cid}) does not exist in our database. Please verify and try again`
                })
            }
        }catch(error){
            req.logger.error('Server Error 500',new reqLoggerDTO(req,error)) 
            return res.status(500).json({
                error:`Unexpected server error (500) - try again or contact support`,
                message: error.message
            })
        }
      
        const newCartDetailsString = JSON.stringify(newCartDetails)
        const regexValidFormat = /^\[\{.*\}\]$/;
        if(!regexValidFormat.test(newCartDetailsString)){
            return res.status(400).json({
                error: 'Invalid request : Format does not meet criteria',
                message:  `Failed to replace the content in the cart id#${cid} due to invalid format request. Please make sure the products you submit are in a valid JSON format (Alike array with objects: [{...content}]).`
            });
        }
        
        const keys = Object.keys(newCartDetails)
        if(keys.length>0){
            const bodyFormatIsValid = keys.every(key=> 'pid' in newCartDetails[key] && 'qty' in newCartDetails[key])
            if(!bodyFormatIsValid){
                return res.status(400).json({
                    error: 'Missing properties in body',
                    message: `Failed to replace the content in the cart id#${cid} due to incomplete request (missing properties). All products in cart must have a "pid" and a "qty" property to be accepted. Please verify and try again.`
                });
            }
        }
    
        const pidArray = newCartDetails.map(cart=>cart.pid)
        try{
            for(const pid of pidArray){
                const pidIsValid = await productsService.getProductBy({_id:pid})
                if(!pidIsValid){
                    return res.status(404).json({
                        error: `ERROR: Cart could not be replaced`,
                        message: `Failed to replace the content in cart id#${cid}. Product id#${pid} was not found in our database. Please verify and try again`
                    })
                }
                req.logger.debug(pidIsValid)
                if(pidIsValid.owner===userEmail){
                    return res.status(500).json({
                        error: `ERROR: Cart could not be replaced`,
                        message: `Failed to replace the content in cart id#${cid} due to invalid Product.  Users cannot purchase their own products. Product id#${pid} Is owned by ${userEmail}, hence, it cannot be added to its cart`
                    })
                }
            }  
        }catch(error){
            req.logger.error('Server Error 500',new reqLoggerDTO(req,error)) 
            return res.status(500).json({
                error:`Unexpected server error (500) - try again or contact support`,
                message: error.message
            })
        }
     
        
        try{
            const cartEditDetails = await cartsService.replaceProductsInCart(cid,newCartDetails)
            if(!cartEditDetails){
                return res.status(404).json({
                    error: `ERROR: Cart id# could not be replaced`,
                    message: `Failed to replace the content in cart id#${cid}. Please verify and try again`
                })
            }
            return res.status(200).json({
                cartEditDetails
            })
        }catch(error){  
            req.logger.error('Server Error 500',new reqLoggerDTO(req,error)) 
            return res.status(500).json({
                error:`Unexpected server error (500) - try again or contact support`,
                message: error.message
            })
        }
    }

    static updateProductInCart=async(req,res,next)=>{
        const {cid, pid} = req.params
        const {qty} = req.body
        const {email: userEmail, _id:userId, rol:userRol}= req.session.user
        res.setHeader('Content-type', 'application/json');
        
        try{
            if(!isValidObjectId(cid)){
                return res.status(400).json({error:`The Cart ID# provided is not an accepted Id Format in MONGODB database. Please verify your Cart ID# and try again`})
            }
        
            if(!isValidObjectId(pid)){
                return res.status(400).json({error:`The Product ID# provided is not an accepted Id Format in MONGODB database. Please verify your Product ID# and try again`})
            }
        
            // future improvement: see if can improve/simplify UX logic (eg. allow for null OR [] OR {} to result in +1 instead of error)
            const regexValidBodyFormat = /^\{.*\}$/
            const fullBody = JSON.stringify(req.body)
            if(!regexValidBodyFormat.test(fullBody,pid,cid)){ 
                return next(
                    CustomError.createError(
                        "Invalid Body Format", 
                        invalidCartBody(fullBody),
                        `Qty to increase invalid format`, 
                        ERROR_CODES.INVALID_ARGUMENTS)
                )     
            }

            const productIsValid = await productsService.getProductBy({_id:pid})
            if(!productIsValid){
                return next(CustomError.createError(
                    "Product not found",
                    notFound(pid,"pid"),
                    `pid  #${pid} was not found`, 
                    ERROR_CODES.RESOURCE_NOT_FOUND
                ))
            }
   
            const cartIsValid = await cartsService.getCartById(cid)
            if(!cartIsValid){
                return next(CustomError.createError(
                    "Cart not found",
                    notFound(cid,"cid"),
                    `cid #${cid} was not found`, 
                    ERROR_CODES.RESOURCE_NOT_FOUND
                ))
            }

            const productToAdd = await productsService.getProductBy({_id:pid})
            if(productToAdd.owner === userEmail){
                return next(CustomError.createError(
                    "Product was not added to Cart",
                    notProcessed(),
                    `Premium Users cannot purchase their own products: Pid#${pid} Is owned by ${userEmail}, hence, it cannot be added to its cart `,
                    ERROR_CODES.INTERNAL_SERVER_ERROR
                ))
            }

            //future improvement - seek for better method (change +1 for +N even on first iteration if desired) // needs qty to be updated properly
            const productAlreadyInCart = await cartsService.findProductInCart(cid,pid) 
            if(!productAlreadyInCart){
               const updatedCart =  await cartsService.addProductToCart(cid,pid)
               if(!updatedCart){
                return next(CustomError.createError(
                    "New product was not added to cart",
                    notProcessed(),
                    `Product pid#${pid} could not be added to cart cid#${cid}`,
                    ERROR_CODES.INTERNAL_SERVER_ERROR
                ))
               }
               return res.status(200).json({ updatedCart });
            }

            const updatedCart = await cartsService.updateProductQtyInCart(cid,pid,qty)
            if(!updatedCart){
                return next(CustomError.createError(
                    "Quantity of selected product was not increased in cart",
                    notProcessed(),
                    `Product pid#${pid} could not be increased cart ${cid} by the inteded quantity of ${qty} units. Product remained with original quantity`,
                    ERROR_CODES.INTERNAL_SERVER_ERROR
                ))
            }
            return res.status(200).json({ updatedCart });
        }catch(error){
            req.logger.error('Server Error 500',new reqLoggerDTO(req,error)) 
            return next(error)
        }  
  
    }

    static deleteAllProductsInCart=async(req,res)=>{
        const {cid} = req.params
      
        res.setHeader('Content-type', 'application/json');
    
        if(!isValidObjectId(cid)){       
            return res.status(400).json({error:`The ID# provided is not an accepted Id Format in MONGODB database. Please verify your ID# and try again`})
        }
    
        try {
            const deletedCart = await cartsService.deleteProductsInCart(cid)
            if(!deletedCart){
                return res.status(404).json({
                    error: `ERROR: Cart id# provided was not found`,
                    message: `Failed to delete cart id#${cid} as it was not found in our database, Please verify and try again`
                })
            }       
            return res.status(200).json({
                payload:deletedCart
            })
        } catch (error) {
            req.logger.error('Server Error 500',new reqLoggerDTO(req,error)) 
            return res.status(500).json({
                error:`Error 500 Server failed unexpectedly, please try again later`,
                message: `${error.message}`
            })
        }
    }

    static deleteSingleProductInCart=async(req,res)=>{
        const {cid, pid} = req.params;
        res.setHeader('Content-type', 'application/json');
    
        if(!isValidObjectId(cid)){
            return res.status(400).json({error:`The Cart ID# provided is not an accepted Id Format in MONGODB database. Please verify your Cart ID# and try again`})
        }
    
        if(!isValidObjectId(pid)){
            return res.status(400).json({error:`The Product ID# provided is not an accepted Id Format in MONGODB database. Please verify your Product ID# and try again`})
        }
    
        try{
            const isProductIdValid = await productsService.getProductBy({_id:pid})
            if(!isProductIdValid){
                return res.status(404).json({
                    error: `ERROR: Product id# provided was not found`,
                    message: `Failed to delete product id#${pid} in cart. This product id was not found in our database, Please verify and try again`
                })
            }
    
            const isCartIdValid = await cartsService.getCartById(cid)
            if(!isCartIdValid){
                return res.status(404).json({
                    error: `ERROR: Cart id# provided was not found`,
                    message: `Failed to delete intended products in cart id#${cid}. The cart id# provided was not found in our database, Please verify and try again`
                })
            }    
           
            const isProductInCart = await cartsService.findProductInCart(cid,pid)
            if(!isProductInCart){
                return res.status(404).json({
                    error: `ERROR: Product id# was not found in this cartid#`,
                    message: `Failed to delete product id#${pid} in cart id#${cid}. The product id# provided was not found in the selected cart, Please verify and try again`
                })
            }
        }catch(error){
            req.logger.error('Server Error 500',new reqLoggerDTO(req,error)) 
            return res.status(500).json({
                error:`Error 500 Server failed unexpectedly, please try again later`,
                message: `${error.message}`
            })
        }
    
        try {          
            const deletedProductInCart = await cartsService.deleteProductsInCart(cid,pid)
            if(!deletedProductInCart){
                return res.status(404).json({
                    error: `ERROR: Failed to delete product in cart`,
                    message: `Could not delete product id#${pid} in cart id#${cid}, Please verify and try again`
                })
            }
            return res.status(200).json({
                payload:deletedProductInCart
            })
        } catch (error) {
            req.logger.error('Server Error 500',new reqLoggerDTO(req,error)) 
            return res.status(500).json({
                error:`Error 500 Server failed unexpectedly, please try again later`,
                message: `${error.message}`
            })
        }
    }

    static completePurchase=async(req,res)=>{
        res.setHeader('Content-type', 'application/json');
        const {cid} =req.params;
        const { email: userEmail, cart: userCart, _id: userId } = req.session.user
        const uniqueCode = uniqueTicketCode(req.session.user)
        let purchasedProducts=[];
        
        if(!isValidObjectId(cid)){
            return res.status(400).json({error:`The Cart ID# provided is not an accepted Id Format in MONGODB database. Please verify your Cart ID# and try again`})
        }

        if(cid !== userCart._id){
            return res.status(400).json({error:`Purchase Cannot be completed: There is a missmatch between the cart Id referenced in your url (id#${cid}) and the one associated with the user trying to complete the purchase (id#${userCart._id}) Please verify and try again`})
        }

        try{
            const matchingCart = await cartsService.getCartById(cid) 
            const cartId = matchingCart._id.toString()
            //otro  loop de validacion igual pero que determine si el length de productos pedidos === length de productos remanentes .. si es igual significa que no hubo stock de nada y entonces debe rechazar la op. OR... UN LOOP QUE SOLO CHEQUE STOCK y genere tipo array nuevo con [good, goog, nostock, good, good] si no stock length === number of items entonces rechazo
            // matchingCart.products.map(p=>{
            //     //ver si hay stock xxxx quiza deba ir dentro de un mismo loop? repensar.
            // })
    
            for(let p of matchingCart.products){
                const productDetails= p.pid
                const productOrderQty = p.qty
                const productId = p.pid._id.toString()
                const productStock=p.pid.stock
            

                if(productOrderQty<=productStock){
                    const newProductStock = productStock-productOrderQty  
                    const updateProductStock = await productsService.updateProduct(productId,{stock:newProductStock}) 
                    const deleteProductInCart = await cartsService.deleteProductsInCart(cartId,productId)
                    const orderTicket = {...productDetails, qty:productOrderQty}
                    purchasedProducts.push(new ticketDTO(orderTicket))
                }           
            }
    
            const ticketSubtotals = purchasedProducts.map(p=>p.subtotal)
            const ticketTotal = ticketSubtotals.reduce((ticketTotalAcc,subtotal)=>ticketTotalAcc+subtotal,0)
            const remainingCart = await cartsService.getCartById(cartId)       
            const ticketDetails={
                code: uniqueCode,
                purchaser:userId,
                purchaserContact: userEmail?userEmail:`El usuario ${userId} no tiene correo registrado`,
                amount: ticketTotal,
                productsPurchased:purchasedProducts,
                productsLeftInCart:remainingCart.products.map(p=>p.pid._id),
                carts:userCart,
            }

            console.log('los ticketDetails',ticketDetails)
            
            const ticketCreated = await ticketsService.createTicket(ticketDetails)   
            console.log("el ticket created", ticketCreated) 
            //const ticketUserAssigned = await usersService.addTicketToUser(userId,ticketCreated._id)
            const ticketUserAssigned = await usersService.addTicketToUser(userId,ticketCreated)
            const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            console.log("eluserEmail to regex test-->",userEmail)
            //const resultRegexTest=emailRegex.test(userEmail)
            ticketCreated.hasEmail =emailRegex.test(userEmail)
           // console.log('el regex test result-->',resultRegexTest)
            if(emailRegex.test(userEmail)){
                const emailSent = await sendEmail(
                    `BACKEND ECOMM TICKET ${config.GMAIL_EMAIL}`,
                    `${userEmail}`,
                    `Tu Compra - Ticket#${ticketCreated._id}`,
                    `<h2>Muchas Gracias por Tu Compra!</h2>
                     <p>Tu numero de Ticket es #${ticketCreated._id}</p>
                     <p>Tu código único es #${uniqueCode}<p>
                     <p>El total de tu compra fue de $${ticketCreated.amount} USD</p>          
                     <p>Puedes revisar todos los detalles de tu compra la sección de "MI PERFIL" en nuestro sitio web</p>          
                     <br>
                     <h4>Cualquier duda puedes reportarla a nuestro número +52123456789</h4>
                     <br>
                     <h4>Gracias y Sigue comprando con nosotros!!</h4>
                    `              
                )
                req.logger.info("An email was sent to the client",emailSent)
    
                //nota... siempre acepta el envio -- como manejar el retorno posterior de DNS no encontrado?
                if(emailSent.accepted.length>0){
                    req.logger.info("mail sent successfully - accepted by DNS")
                }else{
                    req.logger.error("Email sent did not reach destination. Clients mail DNS rejected the package")
                }
            }           
            return res.status(200).json({payload:ticketCreated})
        }catch(error){
            req.logger.error('Server Error 500',new reqLoggerDTO(req,error)) 
            return res.status(500).json({
                error:`Error 500 Server failed unexpectedly, please try again later`,
                message: `${error.message}`
            })
        }        
    }


    static getPurchaseTicket=async(req,res)=>{
        res.setHeader('Content-type', 'application/json');
        const {cid,tid} =req.params
        const {cart: userCart, rol: userRol} = req.session.user

        if(!isValidObjectId(cid)){
            return res.status(400).json({error:`The Cart ID# provided is not an accepted Id Format in MONGODB database. Please verify your Cart ID# and try again`})
        }

        

        try {
            const matchingTicket = await ticketsService.getPurchaseTicket({_id:tid})
            if(!matchingTicket){
                return res.status(404).json({
                    error:`Error 404 Resource not found, please verify and try again`,
                    message:`Purchase Ticket #${tid} does not exist or cannot be located`
                })
            }   
            const cartIdInTicket = matchingTicket.carts._id.toString()           
            if(cid !== cartIdInTicket){
                res.setHeader('Content-type', 'application/json');
                return res.status(404).json({
                    error:`Error 404 Resource not found, please verify and try again`,
                    message: `Cart id provided (#${cid}) is not associated to Ticket Id provided (#${tid}).`
                })
            }
            if(cid !== userCart._id && userRol !== "admin"){
                return res.status(403).json({
                    error:`Ticket Cannot be retreived: Insufficient privileges`,
                    message: `Previous Tickets can only be retreived/seen by the ticket owner (purchaser) or an admin.`
                })
            }

            return res.status(200).json({payload: matchingTicket})
        } catch (error) {
            req.logger.error('Server Error 500',new reqLoggerDTO(req,error)) 
            return res.status(500).json({
                error:`Error 500 Server failed unexpectedly, please try again later`,
                message: `${error.message}`
            })
        }
      
    }

    //temporary testing
    static getAllPurchaseTickets=async(req,res)=>{
        res.setHeader('Content-type', 'application/json');
        try{
            const allTickets= await ticketsService.getAllPurchaseTickets()
            return res.status(200).json({payload:allTickets})
        }catch(error){  
           
            return res.status(500).json({
                error:`Error 500 Server failed unexpectedly, please try again later`,
                message: `${error.message}`
            })
            
        }
    }
    
}