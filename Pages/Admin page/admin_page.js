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
    window.location.href = 'map_view/map_view.html';
});


document.getElementById('rescueAccBtn').addEventListener('click', function() {
    if (username) {
        window.location.href = `cr_res_acc/cr_res_acc.html?username=${encodeURIComponent(username)}`;
    } else {
        window.location.href = 'cr_res_acc/cr_res_acc.html';
    }
});