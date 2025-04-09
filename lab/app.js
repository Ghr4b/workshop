const express = require('express');
const mysql = require('mysql');
const path = require('path');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const app = express();
const port = 3000;

// Database connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'db',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'rootpassword',
    database: process.env.DB_NAME || 'vulnerable_store',
    connectionLimit: 10,
    connectTimeout: 20000
});

// Verify connection
pool.getConnection((err, connection) => {
    if (err) {
        console.error('Database connection failed:', err);
        process.exit(1);
    }
    console.log('Connected to database');
    connection.release();
});

// Session configuration
const sessionStore = new MySQLStore({
    schema: {
        tableName: 'sessions',
        columnNames: {
            session_id: 'session_id',
            expires: 'expires',
            data: 'data'
        }
    },
    createDatabaseTable: false
}, pool);

app.use(session({
    key: 'session_cookie',
    secret: 'your_secret_key',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: false,
        maxAge: 86400000
    }
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static('public'));

const requireLogin = (req, res, next) => {
    if (!req.session.user) return res.redirect('/login');
    next();
};
// routes
app.get('/', requireLogin, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'home.html'));
});

app.get('/login', (req, res) => {
    if (req.session.user) return res.redirect('/');
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/signup', (req, res) => {
    if (req.session.user) return res.redirect('/');
    res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});
// Serve HTML pages
app.get('/home', requireLogin, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'home.html'));
});

app.get('/search', requireLogin, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'search.html'));
});

app.get('/stock', requireLogin, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'stock.html'));
});

app.get('/review', requireLogin, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'review.html'));
});

//api
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    pool.query('SELECT * FROM users WHERE username = ? AND password = ?', 
        [username, password], 
        (err, results) => {
            if (err || results.length === 0) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }
            req.session.user = results[0];
            res.json({ message: 'Login successful' });
        });
});

app.post('/api/signup', (req, res) => {
    const { username, password } = req.body;
    pool.query('INSERT INTO users (username, password) VALUES (?, ?)', 
        [username, password], 
        (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Registration successful' });
        });
});


app.get('/api/item/:id', requireLogin, (req, res) => {
    const itemId = req.params.id;
    pool.query(`SELECT * FROM items WHERE id = '${itemId}' AND preRelease = false`, 
        (err, results) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({
                displayed: results[0] || null,
                allResults: results,
                query: `SELECT * FROM items WHERE id = '${itemId}' AND preRelease = false`
            });
        });
});

app.get('/api/stock/:id', requireLogin, (req, res) => {
    const productId = req.params.id;
    pool.query(
        `SELECT IF(EXISTS(SELECT 1 FROM inventory WHERE product_id='${productId}' AND units > 0), 1, 0) AS in_stock`,
        (err, results) => {
            if (err) {
                return res.status(500).json({ error: 'Database error',
                    query:`SELECT IF(EXISTS(SELECT 1 FROM inventory WHERE product_id='${productId}' AND units > 0), 1, 0) AS in_stock`
                 });
            }
            if (!results || results.length === 0) {
                return res.json({ in_stock: false, 
                        query:`SELECT IF(EXISTS(SELECT 1 FROM inventory WHERE product_id='${productId}' AND units > 0), 1, 0) AS in_stock`
                });
            }
            res.json({ in_stock: results[0].in_stock === 1 });
        }
    );
});

app.post('/api/review', requireLogin, (req, res) => {
    const { productId, rating } = req.body;
    
    if (!productId) {
        return res.status(400).json({ 
            success: false,
            message: "Product ID is required" 
        });
    }

    if (!rating) {
        return res.status(400).json({ 
            success: false,
            message: "Rating is required" 
        });
    }

    const ratingNum = parseInt(rating);
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
        return res.status(400).json({ 
            success: false,
            message: "Rating must be between 1 and 5" 
        });
    }
    const query = `INSERT INTO reviews (product_id, rating) 
    VALUES ('${productId}', ${rating})`;
    pool.query(query, (err, results) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ 
                    success: false,
                    message: "database error" 
                });
            }
            
            res.json({ 
                success: true,
                message: "Thanks for your rating!" 
            });
        }
    );
});

app.get('/api/items', requireLogin, (req, res) => {
    pool.query('SELECT * FROM items WHERE preRelease = false', 
        (err, results) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(results);
        });
});

app.listen(port, () => {
    console.log(`Vulnerable app running on http://localhost:${port}`);
});