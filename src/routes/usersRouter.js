import { Router } from 'express';
import fs from "fs";
import path from "path";
import {customAuth} from '../middleware/auth.js'
import { config } from '../config/config.js';
import { upload, cleanPath } from '../utils.js';
import { UsersManagerMongo as UsersManager } from '../dao/usersManagerMONGO.js';
import { usersService } from '../services/usersService.js';

export const router=Router();

router.get('/', customAuth(["admin"]), async(req,res)=>{    
    res.setHeader('Content-type', 'application/json');
    try {
        const allUsers = await usersService.getUsers()
        return res.status(200).json({payload:allUsers})
    } catch (error) {
        return res.status(500).json({
            error:`Error 500 Server failed unexpectedly, please try again later`,
            message: `${error.message}`
        })
    }    
})

router.get('/:uid', customAuth(["admin"]), async(req,res)=>{
    const { uid } = req.params
    res.setHeader('Content-type', 'application/json');

    try {
        const singleUser= await usersService.getUserById({_id:uid})   
        return res.status(200).json({payload:singleUser})
    } catch (error) {
        return res.status(500).json({
            error:`Error 500 Server failed unexpectedly, please try again later`,
            message: `${error.message}`
        })
    }  
})

router.post('/:uid/documents',upload.single("upload"),async(req,res)=>{ 
    res.setHeader('Content-type', 'application/json');
        const {uid} = req.params
        const {name}= req.body
        const file = req.file

        if(!file){
            return res.status(400).json({
                error:`Error 400 Missing documents:no file received`,
                message: `No file was received`
            })
        }

        if(!name){
            return res.status(400).json({
                error:`Error 400 Missing data`,
                message: `Uploaded file received lacks mandatory data: no name`
            })
        }        

    try {       

        let folder ='';
        switch(name){
            case "profilePic":
                folder="./src/public/uploads/profile";
                break;
            case "identificacion":
            case "compDomicilio":
            case "edoCuenta":
                folder="./src/public/uploads/documents";
                break;
            case "producto":
                folder="./src/public/uploads/products"
                break;
            default:
                folder="./src/public/uploads/others"
                break;
        }

        const tempPath=file.path
        const finalPath=path.join(folder,file.filename)
        let document={
            name, 
            reference:cleanPath(finalPath)
        }
    
        await fs.promises.rename(tempPath,finalPath)       
        const updatedUserDocuments= await usersService.addDocumentToUser(uid,document)  
        let docStatusArray =[]
        updatedUserDocuments.documents.forEach(doc=>{
            docStatusArray.push(doc.document.name)
        })
        if(["identificacion", "edoCuenta", "compDomicilio"].every(doc=>docStatusArray.includes(doc))){
            await usersService.changeUserDocStatus({_id:uid},{docStatus:"complete"})
        } 
        const updatedDocsUser=await usersService.getUserById({_id:uid})
        return res.status(200).json({payload:updatedDocsUser})  
    } catch (error) {
        return res.status(500).json({
            error:`Error 500 Server failed unexpectedly, please try again later`,
            message: `${error.message}`
        })
    }   
})

router.put('/premium/:uid', customAuth(["admin"]), async(req,res)=>{
    const {uid} =req.params
    res.setHeader('Content-type', 'application/json');
    
    try{
        const user= await usersService.getUserById({_id:uid})
        if(user.rol==='user'){
            if(user.docStatus !== "complete"){
               return res.status(400).json({
                error:`Error 400: missing information, petition cannot be complted`,
                message: `User with id#${uid} has submitted all required documentation to be a premium user`
               })
            }
            user.rol = 'premium'    
        }else if(user.rol === 'premium'){
            user.rol = 'user'       
        }

        const updatedRolUser= await usersService.changeUserRol({_id:uid},{rol:user.rol})
        res.setHeader('Content-type', 'application/json');
        return res.status(200).json({payload:updatedRolUser})
    }catch{      
        return res.status(500).json({
            error:`Error 500 Server failed unexpectedly, please try again later`,
            message: `${error.message}`
        })
    }
})


// router.put('/:uid/:orderTicket',customAuth(["user","premium","admin"]),async(req,res)=>{
//     const {uid,orderTicket} =req.params   
//     const updatedUser = await usersService.addTicketToUser(uid,orderTicket)

//     res.setHeader('Content-type', 'application/json');
//     return res.status(200).json({payload:updatedUser})    
// })


// router.put('/:uid/:productOwned',customAuth(["user"]),async(req,res)=>{
//     const {uid,productOwned} =req.params   
//     const updatedUser = await usersService.addProductToOwner(uid,productOwned)

//     res.setHeader('Content-type', 'application/json');
//     return res.status(200).json({payload:updatedUser})    
// })