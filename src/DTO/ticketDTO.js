export class ticketDTO{
    constructor(productOnTicket){
        this.title= productOnTicket.title
        this.price= productOnTicket.price
        this.code = productOnTicket.code
        this.qty = productOnTicket.qty
        this.subtotal = this.price * this.qty
    }
}