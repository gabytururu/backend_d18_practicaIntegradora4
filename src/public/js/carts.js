
const checkCartDetails=(_id)=>{
        window.location.href = `/carts/${_id}`
}

const finalizarCompra = async(cid)=>{
        console.log('el cid pasado desde handlebar',cid)    
        const response = await fetch(`/api/carts/${cid}/purchase`,{
            method:"POST"
        })

        const parsedResponse = await response.json()
        const tid = parsedResponse.payload._id

        window.location.href = `/purchase/${tid}`
    }