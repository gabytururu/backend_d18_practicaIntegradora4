import { CartsMongoDAO as CartsDAO } from "../dao/cartsMongoDAO.js";

class CartsService{
    constructor(dao){
        this.dao=dao
    }

    getCarts=async()=>{
        return await this.dao.getAll()
    }

    createNewCart=async()=>{
        return await this.dao.create()
    }

    getCartById=async(id)=>{
        return await this.dao.getById(id)
    }

    replaceProductsInCart=async(cid,newCartDetails)=>{
        return await this.dao.replace(cid,newCartDetails)
    }

    //update prods in cart
    findProductInCart=async(cid,pid)=>{
        return await this.dao.findOne(cid,pid)
    }

    updateProductQtyInCart=async(cid,pid,qty)=>{
        return await this.dao.findOneAndUpdate(cid,pid,qty)
    }

    addProductToCart=async(cid,pid)=>{
        return await this.dao.update(cid,pid)
    }

    deleteProductsInCart=async(cid,pid)=>{
        return await this.dao.delete(cid,pid)
    }
}

export const cartsService=new CartsService(new CartsDAO())