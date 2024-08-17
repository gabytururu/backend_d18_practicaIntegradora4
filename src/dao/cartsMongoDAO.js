import { cartsModel } from "./models/cartsModel.js";

export class CartsMongoDAO {
  
    async getAll(){
        return await cartsModel.find().populate("products.pid").lean()
    }

    async create(){
        let cart = (await cartsModel.create({}))  
        return cart.toJSON() 
    }   

    async getById(id){
        return await cartsModel.findById(id).populate("products.pid").lean()
    }

    async replace(cid,newCartDetails){
        return await cartsModel.findByIdAndUpdate(
            cid,
            {$set:{products:newCartDetails}},
            {runValidators:true, returnDocument:'after'}
        )
    }

    async findOne(cid,pid){
        return await cartsModel.findOne({ _id: cid, "products.pid": pid }).lean()
    }

    async findOneAndUpdate(cid,pid,qty=1){
        return await cartsModel.findOneAndUpdate(
            {_id:cid, "products.pid":pid},
            {$inc:{"products.$.qty":qty}},
            {runValidators:true,returnDocument:'after'}
        )
        
    }

    async update(cid,pid){
        return await cartsModel.findByIdAndUpdate(
            cid,
            {$push:{products:{pid}}},
            {runValidators:true, returnDocument:'after'}
        )
       
    }

    async delete(cid,pid=null){
        const query = pid !== null? {$pull:{products:{pid}}}:{$pull:{products:{}}}
        return await cartsModel.findByIdAndUpdate(
            cid,
            query, 
            {runValidators:true, returnDocument:'after'}
        )
    }
}
 