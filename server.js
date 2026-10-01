const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

const dbPath = path.resolve(__dirname, 'hotel.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to the SQLite database (hotel.db).');
    }
});

db.serialize(() => {
    // Rooms Table
    db.run(`CREATE TABLE IF NOT EXISTS rooms (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        number TEXT UNIQUE,
        type TEXT,
        status TEXT DEFAULT 'Available',
        price REAL
    )`);

    // Products Table (StockFlow / Inventory)
    db.run(`CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product TEXT,
        category TEXT,
        quantity REAL,
        buying REAL,
        selling REAL,
        date TEXT
    )`);

    // Bookings Table
    db.run(`CREATE TABLE IF NOT EXISTS bookings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        guest_name TEXT,
        room_number TEXT,
        check_in TEXT,
        check_out TEXT,
        status TEXT DEFAULT 'Confirmed'
    )`);

    // Orders Table
  db.run(`CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    table_number TEXT,
    items TEXT,
    total REAL,
    status TEXT
)`);
});

// API Status
app.get('/api/status', (req, res) => {
    res.json({ message: 'Hotel Portal Backend is running successfully!' });
});

app.post('/api/orders', (req, res) => {
    const { table_number, items, total, status } = req.body;
    db.run(
        `INSERT INTO orders (table_number, items, total, status) VALUES (?, ?, ?, ?)`,
        [table_number, items, total, status],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: this.lastID, success: true });
        }
    );
});

// ==================== ROOMS ENDPOINTS ====================
app.get('/api/rooms', (req, res) => {
    db.all("SELECT * FROM rooms", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/rooms', (req, res) => {
    const { name, number, type, status, price } = req.body;
    const query = `INSERT INTO rooms (name, number, type, status, price) VALUES (?, ?, ?, ?, ?)`;
    db.run(query, [name, number, type || 'Standard', status || 'Available', price || 0], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Room added successfully', id: this.lastID });
    });
});

app.put('/api/rooms/:id', (req, res) => {
    const { status } = req.body;
    db.run("UPDATE rooms SET status = ? WHERE id = ?", [status, req.params.id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Room status updated successfully' });
    });
});

app.delete('/api/rooms/:id', (req, res) => {
    db.run("DELETE FROM rooms WHERE id = ?", [req.params.id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Room deleted successfully' });
    });
});

// ==================== PRODUCTS ENDPOINTS ====================
app.get('/api/products', (req, res) => {
    db.all("SELECT * FROM products", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/products', (req, res) => {
    const { product, category, quantity, buying, selling, date } = req.body;
    const query = `INSERT INTO products (product, category, quantity, buying, selling, date) VALUES (?, ?, ?, ?, ?, ?)`;
    db.run(query, [product, category, quantity, buying, selling, date], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Product added successfully', id: this.lastID });
    });
});

app.put('/api/products/:id', (req, res) => {
    const { product, category, quantity, buying, selling, date } = req.body;
    const query = `UPDATE products SET product = ?, category = ?, quantity = ?, buying = ?, selling = ?, date = ? WHERE id = ?`;
    db.run(query, [product, category, quantity, buying, selling, date, req.params.id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Product updated successfully' });
    });
});

app.delete('/api/products/:id', (req, res) => {
    db.run("DELETE FROM products WHERE id = ?", [req.params.id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Product deleted successfully' });
    });
});

// ==================== ORDERS ENDPOINTS ====================
app.get('/api/orders', (req, res) => {
    db.all("SELECT * FROM orders", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        const parsed = rows.map(o => ({ ...o, items: JSON.parse(o.items || '[]') }));
        res.json(parsed);
    });
});

app.patch('/api/orders/:id', (req, res) => {
    const { status } = req.body;
    db.run("UPDATE orders SET status = ? WHERE id = ?", [status, req.params.id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Order status updated' });
    });
});

app.delete('/api/orders/:id', (req, res) => {
    db.run("DELETE FROM orders WHERE id = ?", [req.params.id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Order deleted' });
    });
});

// Route mapping for overview.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/overview', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start Server (Keep your existing app.listen block)
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});


// Start Server
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});