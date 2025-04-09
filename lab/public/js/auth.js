function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    fetch('/api/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            document.getElementById('loginMessage').innerHTML = data.error;
        } else {
            window.location.href = '/';
        }
    })
    .catch(error => {
        console.error('Error:', error);
        document.getElementById('loginMessage').innerHTML = 'Login failed';
    });
}

function signup() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    fetch('/api/signup', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            document.getElementById('signupMessage').innerHTML = data.error;
        } else {
            document.getElementById('signupMessage').innerHTML = 'Registration successful! Please login.';
        }
    })
    .catch(error => {
        console.error('Error:', error);
        document.getElementById('signupMessage').innerHTML = 'Registration failed';
    });
}