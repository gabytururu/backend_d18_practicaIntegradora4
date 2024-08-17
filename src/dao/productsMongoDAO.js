import { productsModel } from "./models/productsModel.js";

export class ProductsMongoDAO {

    async getAll(query,{limit, pagina, sort}){ 
        return await productsModel.paginate(query,{
            page:pagina,
            limit,
            sort,
            lean:true
        })
    }

    async getOneBy(propFilter){
        return await productsModel.findOne(propFilter).lean()
    }
  
    async create(productObj){              
        return await productsModel.create(productObj)
    }

    async update(id, propsToUpdate){
        return await productsModel.findByIdAndUpdate(id, propsToUpdate,{runValidators:true, returnDocument:'after'})
    }

    async delete(id){
        return await productsModel.findByIdAndDelete(id)
    }
}