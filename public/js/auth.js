document.addEventListener('DOMContentLoaded', updateNavigation);

function updateNavigation() {
    const token = localStorage.getItem('token');
    const navButtons = document.getElementById('navButtons');

    if (token) {
        navButtons.innerHTML = `
            <button class="btn btn-primary me-2" data-bs-toggle="modal" data-bs-target="#addMovieModal">Add Movie</button>
            <button class="btn btn-outline-light" onclick="logout()">Logout</button>
        `;
    } else {
        navButtons.innerHTML = `
            <button class="btn btn-outline-light me-2" data-bs-toggle="modal" data-bs-target="#loginModal">Login</button>
            <button class="btn btn-outline-light me-2" data-bs-toggle="modal" data-bs-target="#signupModal">Sign Up</button>
        `;
    }
}

function logout() {
    localStorage.removeItem('token');
    window.location.reload();
}
