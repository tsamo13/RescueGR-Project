function getUsernameFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('username');
}

const username = getUsernameFromURL();
document.getElementById('usernameDisplay').textContent = `Username: ${username}`;

document.getElementById('warehouseBtn').addEventListener('click', function() {
    // Updates the URL for the button "Base Warehouse Management"
    if (username) {
        window.location.href = `admin_page/wareh_man?username=${encodeURIComponent(username)}`;
    } else {
        window.location.href = 'admin_page/wareh_man';
    }
});


document.getElementById('mapViewBtn').addEventListener('click', function() {
    if (username) {
        window.location.href = `/admin_page/map_view?username=${encodeURIComponent(username)}`;
    } else {
        window.location.href = '/admin_page/map_view';
    }
});


document.getElementById('rescueAccBtn').addEventListener('click', function() {
    if (username) {
        window.location.href = `/admin_page/cr_res_acc?username=${encodeURIComponent(username)}`;
    } else {
        window.location.href = '/admin_page/cr_res_acc';
    }
});

document.getElementById('createAnnBtn').addEventListener('click', function() {
    if (username) {
        window.location.href = `/admin_page/cr_an?username=${encodeURIComponent(username)}`;
    } else {
        window.location.href = '/admin_page/cr_an'; 
    }
});


document.getElementById('WSVBtn').addEventListener('click', function() {
    if (username) {
        window.location.href = `admin_page/wsv?username=${encodeURIComponent(username)}`;
    } else {
        window.location.href = 'admin_page/wsv';
        
    }
});

document.getElementById('ssBtn').addEventListener('click', function() {
    if (username) {
        window.location.href = `admin_page/ss?username=${encodeURIComponent(username)}`;
    } else {
        window.location.href = 'admin_page/ss';
        
    }
});

document.addEventListener('DOMContentLoaded', function() {
    // Handle the logout button click event
    const logoutButton = document.getElementById('logoutButton');
    
    logoutButton.addEventListener('click', function(event) {
        event.preventDefault(); // Prevent any default behavior
        
        fetch('/logout', {
            method: 'GET',
        })
        .then(response => {
            if (response.ok) {
                window.location.href = '/login'; // Redirect to the login page after logout
            } else {
                console.error('Logout failed');
            }
        })
        .catch(error => {
            console.error('Error during logout:', error);
        });
    });
});
