const fs= require('fs');
const path= require('path')

class CartManager{
    constructor(cartFilePath){
        this.path=cartFilePath
    }

    async getCarts(){
        if(fs.existsSync(this.path)){        
            let allCarts;
            const cartsFileContent = await fs.promises.readFile(this.path,'utf-8')
            cartsFileContent ? allCarts = JSON.parse(cartsFileContent) : allCarts = []
            return allCarts
        }else{
            return []
        }       
    }

    async getCartById(cid){
        const existingCarts = await this.getCarts()
        const matchingCart = existingCarts.find(cart=>cart.cid===cid)
        if(matchingCart){
            return matchingCart            
        }else{
            return {
                status: `ERROR`,
                error: `ERROR: Cart was not found`,
                message: `Failed to find cart with Id#${cid}. This id# is not associated to any listed carts. Please verify and try again.`
            }
        }
    }

    async createCart(){
        const allCarts = await this.getCarts()
        const newCart={
            cid:'tbd',
            products:[]
        }
        if (allCarts.length===0){
            newCart.cid=1
        }else{
            newCart.cid = allCarts[allCarts.length-1].cid+1
        }
        allCarts.push(newCart)
        await fs.promises.writeFile(this.path, JSON.stringify(allCarts,null,2))
        return {
            status: `SUCCESS`,
            response: `SUCCESS: New cart successfully created`,
            message: `A new cart with id#${newCart.cid} was successfully created. You now have a total of ${allCarts.length} carts listed`,
            data: newCart
        }
    }

    async getProductsInCartById(cid){
        const existingCarts = await this.getCarts()
        const matchingCart = existingCarts.find(cart=>cart.cid===cid)
        if(!matchingCart){
            return {
                status: `ERROR`,
                error: `ERROR: Requested cart was not found`,
                message: `No matching cart was found with the id#${cid}. Please try again with a different id#.`
            }
        }
        if(matchingCart.products.length === 0){
            return {
                status: `ERROR`,
                error: `ERROR: Cart is empty`,
                message: `The cart you are trying to access does exist but has no products. Please try again. Make sure you request a cart that contains at least 1 product`
            }
        }
        if(matchingCart.products.length > 0){
            return matchingCart.products                   
        }
    }

    async updateCart(cartId,prodId){
        cartId = Number(cartId)
        prodId = Number(prodId)

        let allProducts;
        let allProductsLocationPath = path.join(__dirname,'..','data','products.json')
        if(fs.existsSync(allProductsLocationPath)){
            const prodsFileContent = await fs.promises.readFile(allProductsLocationPath,'utf-8')
            prodsFileContent ? allProducts = JSON.parse(prodsFileContent) : allProducts=[]
        }else{
            allProducts = []
        }

        let productIsValid = allProducts.find(prod=>prod.id === prodId)
        if(!productIsValid || isNaN(prodId)){
            return  {
                status: `ERROR`,
                error: `ERROR: Product id provided is invalid`,
                message: `Failed to update cart with Id#${cartId} due to invalid argument: The product id provided (id#${prodId}) does not exist. Please verify and try again`
            }        
        }    
       
        let allCarts = await this.getCarts()
        let cartIsValid = allCarts.find(cart=>cart.cid===cartId)
        if(!cartIsValid){
            return {
                status: `ERROR`,
                error: `ERROR: Cart id provided is invalid`,
                message: `Failed to update cart with Id#${cartId} due to invalid argument: The cart id provided (id#${cartId}) does not exist. Please verify and try again`
            }        
        }

        let cartToUpdate = await this.getCartById(cartId)       
        let cartToUpdateIndex = allCarts.findIndex(cart=>cart.cid === cartId)      
        let updatedProdObject ={
            pid: prodId.toString(),
            qty: 1
        }

        let prodToUpdateIndex = cartToUpdate.products.findIndex(prod=>prod.pid === prodId.toString())
        if(prodToUpdateIndex === -1){
            cartToUpdate.products.push(updatedProdObject)
        }else{
            cartToUpdate.products[prodToUpdateIndex].qty++
        }

        allCarts[cartToUpdateIndex] = cartToUpdate        
        await fs.promises.writeFile(this.path, JSON.stringify(allCarts,null,2))
        return {
            status: `SUCCESS`,
            response: `SUCCESS: Cart successfully updated`,
            message: `The products with id#${prodId} contained in cart with id#${cartId} were successfully updated`,
            data: cartToUpdate
        }
    }

    async deleteCart(cid){
        let allCarts = await this.getCarts()
        if(allCarts.length === 0){
            return {
                status: `ERROR`,
                error: `ERROR: Failed to delete cart`,
                message: `There are no carts created. Hence cart id#${cid} does not exist and could not be deleted.`
            }        
        }
        const cartToDeleteIndex = allCarts.findIndex(cart=>cart.cid===cid)    
        const cartToDelete = allCarts[cartToDeleteIndex]    
        if(cartToDeleteIndex === -1){
            console.log('el cart to delete index es-->',cartToDeleteIndex)
            return {
                status: `ERROR`,
                error: `ERROR: Failed to delete cart`,
                message: `The cart with id#${cid} does not exist, hence, cannot be deleted. Please verify and try again.`
            }        
        }
        allCarts.splice(cartToDeleteIndex,1)       
        await fs.promises.writeFile(this.path, JSON.stringify(allCarts,null,2))
        return {
            status: `SUCCESS`,
            response: `SUCCESS: Product successfully deleted`,
            message: `The cart with id#${cid} was successfully deleted and will no longer exist.`,
            data: cartToDelete
        }
    }
}
   
module.exports=CartManager
