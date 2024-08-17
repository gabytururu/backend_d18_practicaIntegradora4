import mongoose from "mongoose";

const ticketsCollection = 'tickets'

const ticketsSchema = new mongoose.Schema(
    {
        code:String, 
        amount: Number, 
        carts: 
            {
            type: mongoose.Types.ObjectId,
            ref: "carts"
        },
        purchaser: String,
        productsPurchased: Array,
        productsLeftInCart:Array
    },
    {timestamps:true,strict: true}
)

export const ticketsModel = mongoose.model(
    ticketsCollection,
    ticketsSchema
)