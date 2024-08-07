document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault(); 

    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

  
    const data = {
        username: username,
        password: password
    };

    
    fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })

    .then(response => response.json())
    .then(data => {
        console.log('Success:', data);
       
        if (data.success) {
           
            if (data.user_type == 1){
                   window.location.href = 'admin_page.html';
            }
         else if (data.user_type == 2) {
            window.location.href = 'rescuer_page.html';
        }   

        else if (data.user_type == 3){
            window.location.href = 'civilian_page.html';
        }
        }
        
        else {
            alert('Invalid login credentials');
        }
    })
    .catch((error) => {
        console.error('Error:', error);
    });
});
