import fs from "fs"
import path from "path"
import os from "os"
import util from "util"
import { ERROR_CODES } from "../utils/EErrors.js";
import __dirname from '../utils.js'
import { reqLoggerDTO } from "../DTO/reqLoggerDTO.js";  

export const errorHandler=async(error,req,res,next)=>{
    console.log('error HANDLER EXECUTED')
    if(!req.logger){
        console.log('req.logger is UNDEFINED from error handler')
    }
    const errorDetails = {
        code:error.code,
        type: error.name,
        msg: error.message,
        date: new Date().toUTCString(),
        user: os.userInfo().username,
        terminal: os.hostname(),
        details: error.cause
    }

    
    
    let details={
        ...errorDetails,
    }

    if(req.user){
        details={...details, ...new reqLoggerDTO(req)}
    }

    if(req.logger){
        req.logger.warning(`CLIENT BOUNCED: New Custom Error triggered: \n`, {details})   
    }else{
        console.warn('logger is undefined')
    }

    switch(error.code){
        case ERROR_CODES.INVALID_ARGUMENTS:
            res.setHeader('Content-type', 'application/json');
            return res.status(400).json({
                code: `Error: ${ERROR_CODES.INVALID_ARGUMENTS}`,
                error:`Cause: Invalid or Missing Arguments`,
                type: `${error.name}`,
                message: `${error.message}`,                
            })
        case ERROR_CODES.AUTENTICATION: 
            res.setHeader('Content-type', 'application/json');
            return res.status(401).json({
                code: `Error: ${ERROR_CODES.AUTENTICATION}`,
                error:`Cause: Authentication required`,
                type: `${error.name}`,
                message: `${error.message}`,
            })
        case ERROR_CODES.AUTHORIZATION: 
        res.setHeader('Content-type', 'application/json');
        return res.status(403).json({
            code: `Error: ${ERROR_CODES.AUTHORIZATION}`,
            error:`Cause: Forbidden, user lacks access rights to the requested content`,
            type: `${error.name}`,
            message: `${error.message}`,
        })
        case ERROR_CODES.RESOURCE_NOT_FOUND: 
        res.setHeader('Content-type', 'application/json');
        return res.status(404).json({
            code: `Error: ${ERROR_CODES.RESOURCE_NOT_FOUND}`,
            error:`Cause: Requested resource was not found`,
            type: `${error.name}`,
            message: `${error.message}`,
        })
        case ERROR_CODES.INTERNAL_SERVER_ERROR: 
        res.setHeader('Content-type', 'application/json');
        return res.status(500).json({
            code: `Error: ${ERROR_CODES.INTERNAL_SERVER_ERROR}`,
            error:`Cause: Internal error- server failed`,
            type: `${error.name}`,
            message: `${error.message}`,
        })
        default:
            res.setHeader('Content-type', 'application/json');
            return res.status(500).json({
                code: `Error: ${ERROR_CODES.INTERNAL_SERVER_ERROR}`,
                error:`Cause: Internal error- server failed`,
                type: `${error.name}`,
                message: `${error.message}`,
            })

    }
   
}