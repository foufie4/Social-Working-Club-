document.addEventListener('DOMContentLoaded', function() {
    async function loginUser(credentials) {
      try {
        const response = await fetch('/user/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(credentials)
        });
  
        if (response.ok) {
          const data = await response.json();
          localStorage.setItem('token', data.token); // Stocker le nouveau token
          window.location.href = '/'; // Rediriger vers la page d'accueil
        } else {
          const errorData = await response.json();
          alert(errorData.error || 'Erreur lors de la connexion');
        }
      } catch (error) {
        alert('Erreur réseau lors de la connexion');
      }
    }
  
    document.getElementById('login-form').addEventListener('submit', function(e) {
      e.preventDefault();
      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;
      loginUser({ username, password });
    });
  });