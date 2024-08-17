import { config } from '../config/config.js'
import winston from "winston"

const errorLevels={
    levels:{
        fatal:0,
        error:1,
        warning:2,
        info:3,
        http:4,
        debug:5
    },
    colors:{
        fatal: "bold white redBG",
        error: "bold white magentaBG",
        warning: "bold white yellowBG",
        info: "bold black whiteBG",
        http: "bold black cyanBG",
        debug:"bold white blueBG"
    }
   
}

const customFormatErrSource = winston.format.printf(({source,...otherData})=>{
    let errorSource = `Error Originated from:${source}`
    if(otherData){
        errorSource += `\nMeta: \n${JSON.stringify(otherData,null,2)}`
    }
    return errorSource
})


const devLogger = winston.createLogger(
    {
        levels:errorLevels.levels,
        transports:[
            new winston.transports.Console(
                {
                    level:"debug",
                    format: winston.format.combine(
                        winston.format.colorize({colors:errorLevels.colors}),
                        winston.format.splat(), 
                        customFormatErrSource,
                        winston.format.simple(),
                    )
                }
            )
        ]
    }
)

const prodLogger = winston.createLogger(
    {
        levels:errorLevels.levels,
        transports:[
            new winston.transports.Console(
                {
                    level:"info",
                    format: winston.format.combine(
                        winston.format.colorize({colors:errorLevels.colors}),
                        winston.format.splat(), 
                        customFormatErrSource,
                        winston.format.simple()
                    )
                }
            ),
            new winston.transports.File(
                {
                    level:"error",
                    filename:"./src/errors/errors.log",
                    format:winston.format.combine(
                        winston.format.timestamp(),
                        winston.format.label({label:`Environment: ${config.ENVIRONMENT}`}),
                        winston.format.splat(),
                        customFormatErrSource,                      
                        winston.format.prettyPrint(),
                    )
                }
            )
        ]
    }
)

let logger= prodLogger
if(config.ENVIRONMENT === 'dev'){
    logger= devLogger
}

export const appLogger= logger
export const loggerMiddleware=(req,res,next)=>{
    req.logger=logger
    next()
}

