const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path'); // Import the path module

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../frontend'))); // Serve static files from the frontend directory

// Serve index.html on the root URL
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend', 'index.html')); // Adjust the path to point to index.html
});

// Dummy user data
const users = [
    { username: 'testuser', password: 'password123' } // Example user
];

// Login endpoint
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Find the user
    const user = users.find(user => user.username === username);
    if (!user) {
        return res.status(400).json({ message: 'Invalid username or password' });
    }

    // Check password
    if (user.password !== password) {
        return res.status(400).json({ message: 'Invalid username or password' });
    }

    // Simulate a session
    req.session = { username: user.username }; // This is just for demonstration
    res.json({ message: 'Login successful', username: user.username });
});

// Example protected route
app.get('/protected', (req, res) => {
    if (!req.session || !req.session.username) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    res.json({ message: 'This is protected data', user: req.session.username });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});