import { ProductsMongoDAO as ProductsDAO } from "../dao/productsMongoDAO.js";

class ProductsService{
    constructor(dao){
        this.dao=dao
    }

    getProducts=async(query,{limit,pagina,sort})=>{
        return await this.dao.getAll(query,{limit,pagina,sort})
    }

    getProductBy=async(id)=>{
        return await this.dao.getOneBy(id)
    }

    postNewProduct=async(productObj)=>{
        return await this.dao.create(productObj)
    }

    updateProduct=async(id, propsToUpdate)=>{
        return await this.dao.update(id, propsToUpdate)
    }

    deleteProduct=async(id)=>{
        return await this.dao.delete(id)
    }
}

export const productsService=new ProductsService(new ProductsDAO())