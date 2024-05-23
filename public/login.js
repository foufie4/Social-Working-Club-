document.addEventListener('DOMContentLoaded', function() {
  async function loginUser(event) {
    event.preventDefault();
    const username = document.getElementById('username-input').value;
    const password = document.getElementById('password').value;
    const csrfToken = document.querySelector('input[name="_csrf"]').value;

    try {
      const response = await fetch('/user/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'CSRF-Token': csrfToken
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.status === 403) {
        console.error('Forbidden: CSRF token is invalid or missing');
        document.getElementById('error-message').innerText = 'Forbidden: CSRF token is invalid or missing';
      } else if (response.status === 401) {
        console.error('Unauthorized: Invalid username or password');
        document.getElementById('error-message').innerText = 'Invalid username or password';
      } else if (response.ok) {
        const data = await response.json();
        console.log('Login successful:', data);
        localStorage.setItem('token', data.token); // Stocker le nouveau token
        window.location.href = '/home.html'; // Rediriger vers la page d'accueil
      } else {
        const errorData = await response.json();
        console.error('Login failed:', response.statusText);
        document.getElementById('error-message').innerText = errorData.message || 'Login failed';
      }
    } catch (error) {
      console.error('Error during login:', error);
      document.getElementById('error-message').innerText = 'Error during login';
    }
  }

  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', loginUser);
  } else {
    console.error('Login form not found!');
  }
});