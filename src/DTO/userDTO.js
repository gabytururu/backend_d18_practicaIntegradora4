export class userDTO{
    constructor(user){
        this.fullName = user.rol==="admin"?user.nombre:`${user.first_name.toUpperCase()} ${user.last_name.toUpperCase()}`
        this.email = user.email
        this.cart= user.cart
        // this.age=user.age
        this.rol=user.rol
        this.productsOwned=user.rol==="premium"?user.productsOwned:'N/A for regular and admin users'
        this.tickets=user.tickets?user.tickets:'N/A'
        this.last_connection=user.last_connection
       
    }
}