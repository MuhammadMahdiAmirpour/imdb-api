document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const loginData = {
        email: formData.get('email'),
        password: formData.get('password')
    };

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(loginData)
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('token', data.token);
            window.location.reload();
        } else {
            alert(data.message || 'Login failed');
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('Login failed. Please try again.');
    }
});

// Signup form handler with improved error handling
document.getElementById('signupForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const signupData = {
        email: formData.get('email'),
        password: formData.get('password')
    };

    try {
        const response = await fetch('/api/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(signupData)
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('token', data.token);
            window.location.reload();
        } else {
            alert(data.message || 'Signup failed');
        }
    } catch (error) {
        console.error('Signup error:', error);
        alert('Signup failed. Please try again.');
    }
});

document.getElementById('addMovieForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const token = localStorage.getItem('token');

    console.log('Form data:', {
        name: formData.get('name'),
        description: formData.get('description'),
        image: formData.get('image')
    });

    try {
        const response = await fetch('/api/movie', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        const data = await response.json();
        console.log('Response:', data);

        if (response.ok) {
            window.location.reload();
        } else {
            console.log('Error details:', data);
        }
    } catch (error) {
        console.log('Network error:', error);
    }
});

async function loadUserMovies() {
    const token = localStorage.getItem('token');
    if (token) {
        try {
            const response = await fetch('/api/movies/my', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (response.ok && data.movies) {
                console.log('Fetched movies:', data.movies); // Debug log
                renderMovies(data.movies);
            }
        } catch (error) {
            console.error('Error loading movies:', error);
        }
    }
}

function renderMovies(movies) {
    const container = document.getElementById('moviesContainer');
    if (!movies || movies.length === 0) {
        container.innerHTML = '<div class="col-12 text-center"><h3>No movies added yet</h3></div>';
        return;
    }

    const movieCards = movies.map(movie => `
        <div class="col" data-movie-id="${movie._id}">
            <div class="card h-100">
                <img src="${movie.image}" 
                     class="card-img-top"
                     alt="${movie.name}"
                     style="height: 300px; object-fit: cover;">
                <div class="card-body">
                    <h5 class="card-title">${movie.name}</h5>
                    <p class="card-text">${movie.description}</p>
                    <div class="d-flex justify-content-between align-items-center">
                        <a href="/movies/${movie._id}" class="btn btn-primary">View Details</a>
                        <button onclick="deleteMovie('${movie._id}')" class="btn btn-danger">Delete</button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');

    container.innerHTML = movieCards;
}

function deleteMovie(movieId) {
    const token = localStorage.getItem('token');

    fetch(`/api/movies/${movieId}`, {  // Updated endpoint path
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    })
        .then(async response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                const movieElement = document.querySelector(`[data-movie-id="${movieId}"]`);
                if (movieElement) {
                    movieElement.remove();
                    const remainingMovies = document.querySelectorAll('[data-movie-id]');
                    if (remainingMovies.length === 0) {
                        document.getElementById('moviesContainer').innerHTML =
                            '<div class="col-12 text-center"><h3>No movies added yet</h3></div>';
                    }
                }
            }
        })
        .catch(error => {
            console.error('Delete operation failed:', error);
            // Optionally refresh the page or show an error message to the user
        });
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', loadUserMovies);

// document.addEventListener('DOMContentLoaded', () => {
//     updateNavigation();
//     loadUserMovies();
// });
