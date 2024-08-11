 function getUsernameFromURL() {
            const params = new URLSearchParams(window.location.search);
            return params.get('username');
        }

        const username = getUsernameFromURL();
        document.getElementById('usernameDisplay').textContent = `Username: ${username}`;