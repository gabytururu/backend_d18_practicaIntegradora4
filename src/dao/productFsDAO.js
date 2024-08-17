import { error } from 'console';
import fs from 'fs';
import path from 'path';

export class ProductManagerFS {
    constructor(filePath){
        this.path = filePath
    }

    async getProducts(){
        if(fs.existsSync(this.path)){
            let allProducts;
            const productsFileContent = await fs.promises.readFile(this.path,'utf-8')
            productsFileContent ? allProducts = JSON.parse(productsFileContent) : allProducts = []
            return allProducts
        }else{
            return []
        }
    }

    async getProductById(id){   
        const products = await this.getProducts()
        const matchingProduct = products.find(prod=> prod.id===id)
        if(matchingProduct){
            return {
                status: `SUCCESS`,
                response: `SUCCESS: Product successfully found`,
                message: `Product with id#${matchingProduct.id} was successfully found`,
                data: matchingProduct
            }
        }else{
            return {
                status: `ERROR`,
                error: `ERROR: Product was not found`,
                message: `Failed to find product with Id#${id}. This id# is not associated to any listed products. Please verify and try again.`
            }
        }
    }

    async addProduct(productObj){               
            const product = {
                id: 'tbd',
                status: true,
                title: productObj.title, 
                description: productObj.description,
                price: productObj.price,
                thumbnails: productObj.thumbnails,
                code: productObj.code,
                stock: productObj.stock
            }
    
            for(const property in product){
                if(product[property] === undefined){
                    return {
                        status: `ERROR`,
                        error: `ERROR: Product was not added`,
                        message: `Failed to complete product adding submition due to missing property: ${property.toUpperCase()}. Please verify and try again. Make sure you include all mandatory properties to avoid failures.`
                    }
                }            
            }   

            let existentProducts = await this.getProducts() 
            if(existentProducts.length > 0){
                product.id = existentProducts[existentProducts.length - 1].id + 1
            }else{
                product.id = 1
            }     
           
            if(existentProducts.some(prod=>prod.code === product.code)){
                return {
                    status: `ERROR`,
                    error: `ERROR: Product not added`,
                    message: `The product code you are trying to add has already been used. Please try again with a different code.`
                }  
            }
            
            existentProducts.push(product)
            await fs.promises.writeFile(this.path,JSON.stringify(existentProducts, null, 2))           
    
            return {
                status: `SUCCESS`,
                response: `SUCCESS: Product successfully added`,
                message: `Product with id#${product.id} and code ${product.code} was successfully added. You now have a total of ${existentProducts.length} products`,
                data: product
            }
    }
    
    async updateProductById(id, updatedPropsObj) {
        let allProducts = await this.getProducts()
        const updateProductIndex = allProducts.findIndex(prod => prod.id === id)

        if(updateProductIndex === -1){
            return {
                status: `ERROR`,
                error: `ERROR: Product update was not completed`,
                message: `Failed to update product with Id#${id}. Product does not exist. Please verify and try again.`
            }        
        }

        for(let prop in updatedPropsObj){
            if (prop === 'id'){
                return {
                    status: `ERROR`,
                    error: `ERROR: Invalid Action - Update request was blocked`,
                    message: `Failed to update product due to invalid action. The Id# of a product cannot be changed. Please verify and resubmit.`
                }
            }
            if(prop !== 'id'){
                allProducts[updateProductIndex][prop] = updatedPropsObj[prop]
            }
        }        
        await fs.promises.writeFile(this.path, JSON.stringify(allProducts, null, 2))
        return {
            status: `SUCCESS`,
            response: `SUCCESS: Product successfully updated`,
            message: `Product with id#${id} was successfully updated`,
            data: allProducts[updateProductIndex]
        }
    }

    async deleteProductById(id) {
        let allProducts = await this.getProducts()
        if(allProducts.length === 0){
            return {
                status: `ERROR`,
                error: `ERROR: Failed to delete Products`,
                message: `There are no products created yet. Hence product id#${id} does not exist and could not be deleted.`
            }        
        }
        const productDeleteIndex = allProducts.findIndex(prod => prod.id === id)
        const productToDelete = allProducts[productDeleteIndex]
        if(productDeleteIndex === -1){
            return {
                status: `ERROR`,
                error: `ERROR: Failed to Delete product`,
                message: `Failed to delete the requested product. The product Id#${id} does not exist. Please verify and try again.`
            }
        }
        
        allProducts.splice(productDeleteIndex,1)
        await fs.promises.writeFile(this.path, JSON.stringify(allProducts,null,2))
    
        return {
            status: `SUCCESS`,
            response: `SUCCESS: Product successfully deleted`,
            message: `Product with id#${id} was successfully deleted. This product will no longer appear in your product list`,
            data: productToDelete
        }
    }
}
