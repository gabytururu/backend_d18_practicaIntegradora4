import { Router } from 'express';
//import { usersController } from '../controller/usersController.js';
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
    const {name, ...rest}=req.body
    console.log('el req.file de ENDPOINT',req.file)
    console.log('el name desde ENDPOINT',name)
    console.log('el REST desde ENDPOINT',rest)
    //const document={name, reference:cleanPath(req.file.path)}
    
    try {
       // let updatedUserDocuments= await usersService.addDocumentToUser(uid,document)       
        return res.status(200).json({payload:'updatedUserDocuments'})
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
            user.rol = 'premium'
        }else if(user.rol === 'premium'){
            user.rol = 'user'       
        }

        const updateRolUser= await usersService.changeUserRol({_id:uid},{rol:user.rol})
        res.setHeader('Content-type', 'application/json');
        return res.status(200).json({payload:updateRolUser})
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