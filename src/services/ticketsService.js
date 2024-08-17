import { TicketsMongoDAO as TicketsDAO } from "../dao/ticketsMongoDAO.js";

class TicketsService{
    constructor(dao){
        this.dao=dao
    }

    createTicket=async(ticketDetails)=>{
        return await this.dao.create(ticketDetails)
    }

    getPurchaseTicket=async(id)=>{
        return await this.dao.getOneBy(id)
    }

    getAllPurchaseTickets = async()=>{
        return await this.dao.getAll()
    }
}

export const ticketsService= new TicketsService(new TicketsDAO())