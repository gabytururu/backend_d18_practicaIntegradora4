import os from "os";

export function postMissingProperty(product){
    let{title, description, code,price,stock,category,thumbnails}=product

    return `
        Invalid arguments when attempting to post new product.
        Mandatory Arguments:
            - title: type string. Received ${title}, type: ${typeof title}
            - description: type string. Received ${description}, type: ${typeof name}
            - code: type string. Received ${code}, type: ${typeof code}
            - price: type string. Received ${price}, type: ${typeof price}
            - stock: type string. Received ${stock}, type: ${typeof stock}
        Optional Arguments:
            - category: type string. Received ${category}, type: ${typeof category}
            - thumbnails: type string. Received ${thumbnails}, type: ${typeof stock}
    `
}

export function duplicatedCode(code){
    return `
        Product code already exists and cannot be duplicated
        The code ${code} already exists in our database and cannot be inserted again.
    `
}

export function notFound(filter,filterName){
    return `
        Element requested through identification ${filterName}# ${filter} was not found in our database.
    `
}

export function invalidCartBody(fullBody,pid,cid){
    return `
        Action Failed. Failed to increase requested qty of product id# ${pid} in cart id#${cid} due to invalid format request.
        Argument Received:
            - The qty argument received was: ${fullBody}
        Argument Required:       
            -A valid JSON format is required to increase product qty in a cart (sturcture similar to a simple object).
            -Format example: {"qty":x}. 
            -If the body is left empty, or an empty object is sent, the default quantity increased will be +1
            -Any other body structure (eg. arrays, simple numbers, simple values, etc) will results in request failure    
    `
}

export function notProcessed(){
    return `
        Action Failed. Arguments were valid but server could not complete the request.
        Please contact support or try again later.
    `
}

export function authentication(){
    return `
        Invalid credentials - no authenticated users were found.
        A valid user must be registered and logged in to access this resource
    `
}

export function authorization(){
    return `
        Invalid credentials - user logged has insufficient privileges to access this resource.
        The access to this resource is limited to authorized users with correspondent privileges. 
        If you believe this is a mistake and you should be able to access this content please contact support. 
    `
}
    
