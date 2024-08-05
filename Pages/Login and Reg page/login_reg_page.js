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
           
            //Ανατακεύθυνση στην κατάλληλη σελίδα ανάλογα τον ρόλο που έχει ο χρήστης που κάνει Login
            window.location.href = 'page.html';
        } else {
            
            alert('Invalid login credentials');
        }
    })
    .catch((error) => {
        console.error('Error:', error);
    });
});
