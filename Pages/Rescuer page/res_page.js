function getUsernameFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('username');
}

const username = getUsernameFromURL();
document.getElementById('usernameDisplay').textContent = `Username: ${username}`;

document.getElementById('loadHandlingBtn').addEventListener('click', function() {
    if (username) {
        window.location.href = `rescuer_page/load_handling?username=${encodeURIComponent(username)}`;
    } else {
        window.location.href = 'rescuer_page/load_handling';
    }
});

document.getElementById('mapViewBtn').addEventListener('click', function() {
    if (username) {
        window.location.href = `/rescuer_page/map_view?username=${encodeURIComponent(username)}`;
    } else {
        window.location.href = '/rescuer_page/map_view';
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
