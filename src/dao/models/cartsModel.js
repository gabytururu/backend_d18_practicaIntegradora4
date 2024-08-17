import mongoose from "mongoose"

const cartsCollection="carts"

const cartsSchema = new mongoose.Schema(
    {
        products: {
            type: [
                {
                    pid:{
                        type:mongoose.Types.ObjectId,
                        ref:"products"
                    },
                    qty: {
                        type:Number,
                        default:1
                    }
                }
            ]
        }            
    },
    {timestamps: true}
)

export const cartsModel = mongoose.model(
    cartsCollection,
    cartsSchema
)

