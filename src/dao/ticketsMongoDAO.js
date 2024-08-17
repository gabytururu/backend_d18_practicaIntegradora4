import { ticketsModel } from "./models/ticketsModel.js";

export class TicketsMongoDAO{
    async create(ticketDetails){
        const ticket= await ticketsModel.create(ticketDetails)
        return ticket.toJSON()
    }

    async getOneBy(filter){
        return await ticketsModel.findOne(filter).populate("carts", "products.pid products.qty").lean()
    }

    async getAll(){
        return await ticketsModel.find({}).lean()
    }
}