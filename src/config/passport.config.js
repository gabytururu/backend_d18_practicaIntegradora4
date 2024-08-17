import passport from "passport";
import local from "passport-local";
import github from "passport-github2";
import { config } from "./config.js";
import { cartsService } from "../services/cartsService.js";
import { UsersManagerMongo as UsersManager } from "../dao/usersManagerMONGO.js";
import { hashPassword, validatePassword } from "../utils.js";
import { reqLoggerDTO } from "../DTO/reqLoggerDTO.js";
import { appLoggerDTO } from "../DTO/appLoggerDTO.js";
import { appLogger } from "../utils/logger.js";

const usersManager = new UsersManager()


export const initPassport=()=>{
    // --------- estrategia de registro -------------------//
    passport.use(
        "registro",
        new local.Strategy(
            {
                usernameField: "email",
                passReqToCallback: true,
            },
            async(req,username,password,done)=>{
                try {
                    //const {nombre} = req.body
                    const {first_name, last_name, age, rol} = req.body
                    if(!first_name){ 
                        appLogger.info('REGISTRO FAILED: Failed to complete signup due to missing name.Please make sure all mandatory fields(*)are completed to proceed with signup') 
                        return done(null,false, {message: `Signup failed: Must complete all signup required data to access`})
                    }

                    if(!last_name){  
                        appLogger.info('REGISTRO FAILED: Failed to complete signup due to missing lastname.Please make sure all mandatory fields(*)are completed to proceed with signup') 
                        return done(null,false, {message: `Signup failed: Must complete all signup required data to access`})
                    }

                    if(!age){  
                        console.log('falta edad')
                        appLogger.info('REGISTRO FAILED: Failed to complete signup due to missing age.Please make sure all mandatory fields(*)are completed to proceed with signup') 
                        return done(null,false, {message: `Signup failed: Must complete all signup required data to access`})
                    }
                
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if(!emailRegex.test(username)){
                        appLogger.info('REGISTRO FAILED: The email %s does not match a valid email format. Other types of data structures are not accepted as an email address. Please verify and try again',username)                         
                        return done(null,false, {message: `Signup failed: missing credentials: invalid email format - please try again`})
                    }
                
                    const emailAlreadyExists = await usersManager.getUserByFilter({email:username})
                    if(emailAlreadyExists){
                        appLogger.info('REGISTRO FAILED: The email you are trying to register (email: %s) already exists in our database and cannot be duplicated. Please try again using a diferent email',username)  
                        return done(null,false, {message: `Signup failed: Email already exists and cannot be duplicated - please try again.`})
                    }

                    //missing validation fo proper postmanClient body format?? eg, {}
                   
                    password = hashPassword(password)                  
                    const newCart = await cartsService.createNewCart()
                    const newUser = await usersManager.createUser({first_name, last_name, age,email:username,password,rol,cart:newCart._id})
                    
                    return done(null, newUser)

                } catch (error) {
                    console.log('el error aca en el passport_',error)
                    req.logger.error('Server Error Caught at REGISTRO strategy',new reqLoggerDTO(req,error)) 
                    return done(error) 
                }
            }
        )
    )

    // --------- estrategia de login ----------------------//
    passport.use(
        "login",
        new local.Strategy(
            {
                usernameField: "email",
            },
            async(username,password,done)=>{
                try {                     
                    if(!username || !password){
                        done(null,false, {message: `Login failed - all fields must be completed - please verify and try again`}) 
                    }

                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if(!emailRegex.test(username)){
                        appLogger.info('LOGIN FAILED: The email %s does not match a valid email format. Other types of data structures are not accepted as an email address. Please verify and try again',username)
                        done(null,false, {message: `Login failed - email format is not valid - please verify and try again`})
                    }

                    if(username=="adminCoder@coder.com" && password=="adminCod3r123"){
                        const userIsManager={
                            _id:'adminId',
                            nombre:'Manager Session',
                            email:username,
                            rol:'admin',
                            cart: 'No Aplica'
                        }
                        return done(null, userIsManager)
                    }
                    
                    const userIsValid = await usersManager.getUserByFilter({email:username})
                    if(!userIsValid){
                        appLogger.info('LOGIN FAILED: Failed to complete login. The email provided (email: %s was not found in our database. Please verify and try again',username)
                        return done(null,false, {message: `Login failed - email was not found -please try again`})
                    }
                        
                    if(!validatePassword(password,userIsValid.password)){
                            appLogger.info('The password provided does not match our records. Please verify and try again.')
                            return done(null,false, {message: `Login failed - invalid password please verify and try again`})
                    }  
                    userIsValid.last_connection = new Date()
                    console.log('USER IS VALID EN LOGIN--->',userIsValid)       
                    return done(null,userIsValid)
                } catch (error) {
                    appLogger.error('Server Error Caught at LOGIN strategy',new appLoggerDTO(error)) 
                    return done(error)
                }
            }
        )
    )

    // --------- estrategia de github ----------------------//
    passport.use(
        "github",
        new github.Strategy(
            {
                clientID: config.GITHUB_CLIENT_ID,
                clientSecret: config.GITHUB_CLIENT_SECRET,
                callbackURL: config.GITHUB_CALLBACK_URL
            },
            async(accessToken,refreshToken,profile,done)=>{
                try {
                    console.log("el profile desde github AUTH", profile)
                    const email=profile._json.email?profile._json.email:'N/A - Github connection'
                    const first_name= profile._json.name?profile._json.name:profile.username
                    const last_name= profile._json.name?profile._json.name:profile.username
                    const last_connection = new Date()
                    let authenticatedUser = await usersManager.getUserByFilter({email})
                    if(!authenticatedUser){
                        const newCart= await cartsService.createNewCart()
                        authenticatedUser=await usersManager.createUser({
                            first_name:first_name,
                            last_name:last_name,
                            email:email, 
                            cart:newCart._id, 
                            last_connection:last_connection, 
                            profile
                        })        
                    }
                    console.log("github AUTH user from psasportConfig hacia router-->", authenticatedUser)
                    return done(null,authenticatedUser)
                } catch (error) {
                    return done(error)
                }
            }
        )
    )

    // ------------- serializer + deserializer for apps w sessions ---------//
    passport.serializeUser((user, done)=>{
        return done(null,user._id)
    })

    passport.deserializeUser(async(id,done)=>{
        let user;
        if(id==='adminId'){
            user={            
                _id:'adminId',
                nombre:'Manager Session',
                email:"adminCoder@coder.com",
                rol:'admin',
                cart: 'No Aplica'                
            }
        }else{
            user=await usersManager.getUserByFilter({_id:id})
        }       
        return done(null,user)
    })

}