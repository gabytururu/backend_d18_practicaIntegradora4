import mongoose from "mongoose";
import paginate from "mongoose-paginate-v2"

const productsCollection="products"

const productsSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        price: {
            type: Number,
            required: true,
        },
        code: {
            type: Number,
            required: true,
            unique: true
        },
        stock: {
            type: Number,
            required: true,
        },
        status: {
            type: Boolean,
            required: true,
            default: true           
        },
        owner:{
            type: String,
            default: 'admin'
        },
        category: String,
        thumbnails: String,
    },
    {
        timestamps: true,
    }
)

productsSchema.plugin(paginate)

export const productsModel = mongoose.model(
    productsCollection,
    productsSchema
)

