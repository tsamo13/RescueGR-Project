function getUsernameFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('username');
}

const username = getUsernameFromURL();
document.getElementById('usernameDisplay').textContent = `Username: ${username}`;

document.getElementById('warehouseBtn').addEventListener('click', function() {
    // Ενημερώνει το URL για το κουμπί "Base Warehouse Management"
    if (username) {
        window.location.href = `admin_page/wareh_man?username=${encodeURIComponent(username)}`;
    } else {
        window.location.href = 'wareh_man/wareh_man.html';
    }
});


document.getElementById('mapViewBtn').addEventListener('click', function() {
    if (username) {
        window.location.href = `map_view/map_view.html?username=${encodeURIComponent(username)}`;
    } else {
        window.location.href = 'map_view/map_view.html';
    }
});


document.getElementById('rescueAccBtn').addEventListener('click', function() {
    if (username) {
        window.location.href = `cr_res_acc/cr_res_acc.html?username=${encodeURIComponent(username)}`;
    } else {
        window.location.href = 'cr_res_acc/cr_res_acc.html';
    }
});

document.getElementById('createAnnBtn').addEventListener('click', function() {
    if (username) {
        window.location.href = `cr_an/cr_an.html?username=${encodeURIComponent(username)}`;
    } else {
        window.location.href = 'cr_an/cr_an.html';
        
    }
});


document.getElementById('WSVBtn').addEventListener('click', function() {
    if (username) {
        window.location.href = `wsv/wsv.html?username=${encodeURIComponent(username)}`;
    } else {
        window.location.href = 'wsv/wsv.html';
        
    }
});

document.getElementById('ssBtn').addEventListener('click', function() {
    if (username) {
        window.location.href = `ss/ss.html?username=${encodeURIComponent(username)}`;
    } else {
        window.location.href = 'ss/ss.html';
        
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
