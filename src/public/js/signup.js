
//not working - debug in future iterations
const signup = document.querySelector('#signup')
signup.addEventListener('submit',(e)=>{
    e.preventDefault()

    Swal.fire({
        title: '¡Gracias Por tu Registro!',
        text: 'Registro Exitoso. Por favor Inicia tu Sesión',
        icon: 'success',
        showConfirmButton: false,
        timer: 3500 
      });

      setTimeout(()=>{
        window.location.href = '/login'
      },3500)
})

