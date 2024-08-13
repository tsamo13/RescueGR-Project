
 const params = new URLSearchParams(window.location.search);
 const username = params.get('username');


 if (username) {
     const mainPageLink = document.getElementById('mainPageLink');
     mainPageLink.href = `../admin_page.html?username=${encodeURIComponent(username)}`;
 }