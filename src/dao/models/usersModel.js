import mongoose from "mongoose";

const usersCollection = 'users'

const usersSchema = new mongoose.Schema(
    {
        first_name:String,
        last_name:String,
        email:{
            type: String,
            unique: true,
        },
        age: Number,
        password:String,
        cart:{
            type:mongoose.Types.ObjectId,
            ref:"carts"
        },
        rol:{
            type:String,
            default:"user"
        },
        tickets: {
            type:[
                {
                    orderTicket:{
                        type:mongoose.Types.ObjectId,
                        ref:"tickets"
                    }
                }
            ]
        },
        productsOwned: {
            type:[
                {
                    ownedProduct:{
                        type:mongoose.Types.ObjectId,
                        ref:"products"
                    }
                }
            ]
        },
        last_connection:{
            type: Date,
            default: new Date()
        },
        documents:{
            type:[
                {
                    name:String,
                    reference:String
                }
            ]
        }          
    },
    {timestamps:true, strict:false}
)

export const usersModel = mongoose.model(
    usersCollection,
    usersSchema,
)