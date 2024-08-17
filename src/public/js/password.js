

const emailVerifyButton = document.querySelector('#verifyEmail')
const email = document.querySelector('#emailInput')

emailVerifyButton.addEventListener('click',async(e)=>{
    e.preventDefault()

    try{
        const response = await fetch('/api/sessions/password',{
            method: 'POST',
            headers:{
                'Content-Type': 'application/json'
            },
            body:JSON.stringify({email:email.value})
        });
        const data = await response.json()   
        if(response.status !== 200){
            let paragraph = document.createElement('p')
            paragraph.textContent = data.details
            paragraph.style.color = 'red';
            paragraph.style.fontSize = '20px';
        
            let errorContainer = document.querySelector("#error")
            errorContainer.appendChild(paragraph)

            setTimeout(()=>{
                errorContainer.innerHTML = ''
            },3000)
        }

        if(response.status === 200){
            let paragraph = document.createElement('p')
            paragraph.textContent = data.details
            paragraph.style.color = 'green';
            paragraph.style.fontSize = '20px';
        
            let errorContainer = document.querySelector("#error")
            errorContainer.appendChild(paragraph)

            setTimeout(()=>{
                errorContainer.innerHTML = ''
            },7000)
        } 
    }catch(error){
        console.log('fetch error at password email verification screen:',error)
    }
   
})


