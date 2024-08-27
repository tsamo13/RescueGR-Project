function getUsernameFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('username');
}

const username = getUsernameFromURL();
document.getElementById('usernameDisplay').textContent = `Username: ${username}`;

document.getElementById('RMBtn').addEventListener('click', function() {
    if (username) {
        window.location.href = `civilians_page/req_man?username=${encodeURIComponent(username)}`;
    } else {
        window.location.href = 'civilians_page/req_man';
    }
});

document.getElementById('AOMBtn').addEventListener('click', function() {
    if (username) {
        window.location.href = `civilians_page/aom?username=${encodeURIComponent(username)}`;
    } else {
        window.location.href = 'civilians_page/aom';
    }
});

document.addEventListener('DOMContentLoaded', function() {
    const logoutButton = document.getElementById('logoutButton');
    
    logoutButton.addEventListener('click', function(event) {
        event.preventDefault();
        
        fetch('/logout', {
            method: 'GET',
        })
        .then(response => {
            if (response.ok) {
                window.location.href = '/login';
            } else {
                console.error('Logout failed');
            }
        })
        .catch(error => {
            console.error('Error during logout:', error);
        });
    });
});
