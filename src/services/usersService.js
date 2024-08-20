import { UsersMongoDAO as UsersDAO } from '../dao/usersMongoDAO.js'

class UsersService{
    constructor(dao){
        this.dao=dao
    }

    getUsers=async()=>{
        return await this.dao.getAll()
    }

    getUserById= async(uid)=>{
        return await this.dao.getOneBy(uid)
    }

    getUserByEmail= async(email)=>{
        return await this.dao.getOneBy(email)
    }

    createUser= async(newUser)=>{
        return await this.dao.create(newUser)
    }

    addTicketToUser=async(uid,orderTicket)=>{
        return await this.dao.push(uid,orderTicket)
    }

    addProductToOwner=async(uid,ownedProduct)=>{
        return await this.dao.push(uid,ownedProduct)
    }

    removeProductFromOwner=async(uid,ownedProduct)=>{
        return await this.dao.remove(uid,ownedProduct) 
    }

    changeUserRol=async(uid,updatedRol)=>{
        return await this.dao.update(uid,updatedRol)
    }
    changeUserPassword=async(uid,updatedPassword)=>{
        return await this.dao.update(uid,updatedPassword)
    }

    udpateUserLastConnection=async(uid, lastConnection)=>{
        return await this.dao.update(uid,lastConnection)
    }  

    addDocumentToUser=async(uid,document)=>{
        return await this.dao.push(uid,document)
    }

    changeUserDocStatus=async(uid,status)=>{
        return await this.dao.update(uid,status)
    }
}

 
export const usersService= new UsersService(new UsersDAO())