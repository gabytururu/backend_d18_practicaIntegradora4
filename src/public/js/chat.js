async function getSessionData() {
    const response = await fetch('/api/sessions/current');
    // if (!response.ok) {
    //   throw new Error('Network response was not ok');
    // }
    const currentUser = await response.json();
    const currentUserEmail = await currentUser.payload.email;
    return currentUserEmail
}


Swal.fire({
    title:'Bienvenid@',
    input:'text',
    text: 'Por favor danos tu correo electrónico para iniciar',
    inputValidator:(value)=>{
        return !value && 'Lo sentimos no podemos continuar sin tu e-mail...!!'
    },
    preConfirm:async(mailInput)=>{
        const currentUserEmail = await getSessionData()
        if (mailInput !== currentUserEmail){
            Swal.showValidationMessage('El mail brindado no coincide con el del usuario registrado...!!')
            //throw new Error('Email mismatch');
        }
        return mailInput
    },
    allowOutsideClick: false
}).then(mailInput =>{  
    let email = mailInput.value
    document.title =  email
    let inputMensaje = document.querySelector('.mensaje')
    let divMensajes = document.querySelector('.mensajes')
    inputMensaje.focus()

    const socket=io()
    socket.emit("email", email)
    socket.on("chatHistory", messages=>{
        messages.forEach(m=>{
            divMensajes.innerHTML += `<div class="mensajePush"><strong>${m.email} dice:</strong> <i>${m.message}</i></div><br>`
            divMensajes.scrollTop=divMensajes.scrollHeight
        })
    })
    socket.on("newUserConnection", email=>{
        Swal.fire({
            text: `${email} se ha unido al chat !!!`,
            toast: true,
            position: "top-right"
        })
    })

    inputMensaje.addEventListener("keyup",e=>{
        e.preventDefault()

        if(e.code === 'Enter' && e.target.value.trim().length > 0){
            let message = e.target.value.trim()
            socket.emit("createNewMessage", email, message)
            e.target.value=""
            e.target.focus()
        }
    })
    socket.on("displayNewMessage", (email, message)=>{
        divMensajes.innerHTML += `<div class="mensajePush"><strong>${email} dice:</strong> <i>${message}</i></div><br>`
        divMensajes.scrollTop=divMensajes.scrollHeight
    })
})