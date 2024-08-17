const addProdToCart= async(_id, title)=>{
    console.log(`El código a comprar es ${_id} en el carrito`)
    const cid = document.querySelector('#userCart').dataset.userCid
    console.log('el carrito de este user es: ',cid)

    const response = await fetch(`/api/carts/${cid}/products/${_id}`,{
        method:"PUT"
    })

    if(response.status===200){
        let payloadData = await response.json()
        console.log('la payload data:',payloadData)        
        Swal.fire({
            text: `El producto id#${_id} fue agregado a tu carrito ${cid}`,
            toast: true,
            position: "center"
        })
    }   
}


const checkProductDetails=(_id)=>{
    console.log(`ver detalles del producto con id#${_id} `)
    window.location.href = `/products/${_id}`
}

const finalizePurchase = async(_id) =>{
    const cid = document.querySelector(".buyButton").dataset.userCid

    const response = await fetch(`/api/carts/${cid}/products/${_id}`,{
        method:"PUT"
    })

    if(response.status===200){
        let payloadData = await response.json()
        console.log('la payloadData: ',payloadData)
        Swal.fire({
            text: `El producto id#${_id} fue agregado al carrito ${cid}`,
            toast: true,
            position: "center"
        })
    }  
}
