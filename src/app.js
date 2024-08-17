import express from 'express';
import mongoose from 'mongoose';
import path from 'path';
import sessions from 'express-session';
import {router as productsRouter} from './routes/productsRouter.js'
import {router as cartsRouter} from './routes/cartsRouter.js'
import {router as vistasRouter} from './routes/vistasRouter.js'
import {router as sessionsRouter} from './routes/sessionsRouter.js'
import { router as usersRouter } from './routes/usersRouter.js';
import { messagesModel } from './dao/models/messagesModel.js';
import { engine } from 'express-handlebars';
import { Server } from 'socket.io';
import __dirname, {specs} from './utils.js';
import MongoStore from 'connect-mongo';
import passport from 'passport'
import { initPassport } from './config/passport.config.js'; 
import { config } from './config/config.js';
import { errorHandler } from './middleware/errorHandler.js';
import { loggerMiddleware, appLogger } from './utils/logger.js';
import { appLoggerDTO } from './DTO/appLoggerDTO.js';
import swaggerUi from 'swagger-ui-express'
import { customAuth } from './middleware/auth.js';

const PORT = config.PORT;
const app = express();

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(loggerMiddleware);
app.use(sessions({
    secret: config.SESSION_SECRET,
    resave:true,
    saveUninitialized: true,
    store:MongoStore.create({
        ttl:3600,
        mongoUrl: config.MONGO_URL,
        dbName: config.DB_NAME,
        collectionName: config.COLLECTION_NAME
    })
})) 


initPassport()
app.use(passport.initialize())
app.use(passport.session())

app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname,'/views'));

app.use(express.static(path.join(__dirname,'/public')));

app.use('/api-docs',customAuth(["public"]),swaggerUi.serve, swaggerUi.setup(specs));

app.use("/", vistasRouter)
app.use("/api/products", productsRouter)
app.use("/api/carts", cartsRouter)
app.use("/api/sessions", sessionsRouter)
app.use("/api/users", usersRouter)


app.use(errorHandler)

process.on('uncaughtException',(error)=>{
    appLogger.fatal('uncaught exception. Error: %s', error)
})

process.on('unhandledRejection',(reason,promise)=>{
    appLogger.fatal('unhandled rejection \n promise:%s \n reason: %s',promise, reason)
})

const server= app.listen(PORT, ()=>{
    appLogger.info(`System Ready. Listening on port ${config.PORT}`)
})

const dbConnection = async()=>{
    try{
        await mongoose.connect(
            config.MONGO_URL,
            {
                dbName: config.DB_NAME
            }
        )
        appLogger.info(`EcommerceApp: DB Conectada en puerto %s - Entorno '%s'`,config.PORT, config.ENVIRONMENT)
    }catch(err){
        appLogger.error(`Error al connectarse con la DB via puerto ${config.PORT}`, new appLoggerDTO(err))
    }
}
dbConnection()

const io= new Server(server)
io.on("connection", socket=>{
    appLogger.info(`El cliente con id %s se ha conectado al chat`,socket.id)

    socket.on("email", async email=>{
        let messages = await messagesModel.find()
        socket.emit("chatHistory", messages)
        socket.broadcast.emit("newUserConnection", email)
    })

    socket.on("createNewMessage", async (email, message)=>{
        await messagesModel.create({email, message})
        io.emit("displayNewMessage", email, message)
    })
})