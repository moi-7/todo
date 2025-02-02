// User Management
let currentUser = null;

function showRegister() {
    document.getElementById('login-container').classList.add('hidden');
    document.getElementById('register-container').classList.remove('hidden');
}

function showLogin() {
    document.getElementById('register-container').classList.add('hidden');
    document.getElementById('login-container').classList.remove('hidden');
}

function register() {
    const username = document.getElementById('register-username').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    const errorElement = document.getElementById('register-error');

    if (!username || !password) {
        errorElement.textContent = 'Please fill in all fields';
        return;
    }

    if (password !== confirmPassword) {
        errorElement.textContent = 'Passwords do not match';
        return;
    }

    const users = JSON.parse(localStorage.getItem('users') || '{}');
    if (users[username]) {
        errorElement.textContent = 'Username already exists';
        return;
    }

    users[username] = { password, todos: [] };
    localStorage.setItem('users', JSON.stringify(users));
    loginUser(username);
}

function login() {
    const identifier = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;
    const errorElement = document.getElementById('login-error');

    const users = JSON.parse(localStorage.getItem('users') || '{}');
    
    let username = null;
    // Check if identifier is an email
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);
    
    if (isEmail) {
        // Find username by email
        const userEntry = Object.entries(users).find(([_, userData]) => userData.email.toLowerCase() === identifier.toLowerCase());
        if (userEntry) {
            username = userEntry[0];
        } else {
            // Check if username exists
            if (users[identifier.toLowerCase()]) {
                username = identifier.toLowerCase();
            }
        }
    } else {
        // Check if username exists
        if (users[identifier.toLowerCase()]) {
            username = identifier.toLowerCase();
        }
    }

    if (!username) {
        errorElement.textContent = 'Account does not exist';
        return;
    }

    if (users[username].password !== password) {
        errorElement.textContent = 'Invalid username/email or password';
        return;
    }

    loginUser(username);
}

function loginUser(username) {
    currentUser = username;
    localStorage.setItem('currentUser', username);
    document.getElementById('login-container').classList.add('hidden');
    document.getElementById('register-container').classList.add('hidden');
    document.getElementById('dashboard').classList.remove('hidden');
    document.getElementById('username-display').textContent = username;
    loadTodos();
}

function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    document.getElementById('dashboard').classList.add('hidden');
    document.getElementById('login-container').classList.remove('hidden');
    resetForms();
}

function resetForms() {
    document.getElementById('login-username').value = '';
    document.getElementById('login-password').value = '';
    document.getElementById('register-username').value = '';
    document.getElementById('register-password').value = '';
    document.getElementById('confirm-password').value = '';
    document.querySelectorAll('.error-message').forEach(el => el.textContent = '');
}

// Todo Management
function loadTodos() {
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    const todos = users[currentUser]?.todos || [];
    displayTodos(todos);
}

function addTodo() {
    const input = document.getElementById('new-todo');
    const text = input.value.trim();
    if (!text) return;

    const users = JSON.parse(localStorage.getItem('users') || '{}');
    const newTodo = {
        id: Date.now(),
        text,
        completed: false
    };

    users[currentUser].todos.push(newTodo);
    localStorage.setItem('users', JSON.stringify(users));
    input.value = '';
    loadTodos();
}

function toggleTodo(id) {
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    const todo = users[currentUser].todos.find(t => t.id === id);
    if (todo) {
        todo.completed = !todo.completed;
        localStorage.setItem('users', JSON.stringify(users));
        loadTodos();
    }
}

function deleteTodo(id) {
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    users[currentUser].todos = users[currentUser].todos.filter(t => t.id !== id);
    localStorage.setItem('users', JSON.stringify(users));
    loadTodos();
}

function displayTodos(todos) {
    const todosList = document.getElementById('todos-list');
    todosList.innerHTML = todos.map(todo => `
        <div class="todo-item ${todo.completed ? 'completed' : ''}">
            <input type="checkbox" 
                   ${todo.completed ? 'checked' : ''} 
                   onchange="toggleTodo(${todo.id})">
            <span style="flex-grow:1">${todo.text}</span>
            <button onclick="deleteTodo(${todo.id})">×</button>
        </div>
    `).join('');
}

// Check if user is already logged in
window.onload = function() {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
        loginUser(storedUser);
    }
};

function register() {
    const username = document.getElementById('register-username').value.trim();
    const email = document.getElementById('register-email').value.trim();
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    const errorElement = document.getElementById('register-error');

    // Reset error message
    errorElement.textContent = '';

    // Validation checks
    if (!username || !email || !password || !confirmPassword) {
        errorElement.textContent = 'All fields are required';
        return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errorElement.textContent = 'Invalid email format';
        return;
    }

    if (password.length < 8) {
        errorElement.textContent = 'Password must be at least 8 characters';
        return;
    }

    if (password !== confirmPassword) {
        errorElement.textContent = 'Passwords do not match';
        return;
    }

    const users = JSON.parse(localStorage.getItem('users') || '{}');
    if (users[username]) {
        errorElement.textContent = 'Username already exists';
        return;
    }

    // Check if email already exists
    const emailExists = Object.values(users).some(user => user.email === email);
    if (emailExists) {
        errorElement.textContent = 'Email already registered';
        return;
    }

    // Create new user
    registerUser(username, email, password);
}

function registerUser(username, email, password) {
    username = username.toLowerCase();
    email = email.toLowerCase();

    const users = JSON.parse(localStorage.getItem('users') || '{}');
    const errorElement = document.getElementById('register-error');

    if (users[username]) {
        errorElement.textContent = 'Username already exists';
        return;
    }

    users[username] = { email: email, password: password, todos: [] };
    localStorage.setItem('users', JSON.stringify(users));
    loginUser(username);
}
