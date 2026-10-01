const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

// ==================== IN-MEMORY STORAGE ====================
let rooms = [];
let products = [];
let bookings = [];
let orders = [];
let users = []; // Added for registration and login

// API Status
app.get('/api/status', (req, res) => {
    res.json({ message: 'Hotel Portal Backend is running successfully!' });
});

// ==================== AUTHENTICATION ENDPOINTS ====================
app.post('/api/register', (req, res) => {
    const { username, email, password } = req.body;
    
    // Check if user already exists
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
        return res.status(400).json({ error: 'User with this email already exists' });
    }

    const newUser = {
        id: Date.now(),
        username,
        email,
        password
    };
    users.push(newUser);
    res.json({ message: 'Registration successful', success: true, userId: newUser.id });
});

app.post('/api/login', (req, res) => {
    const { email, password } = req.body;

    const user = users.find(u => u.email === email && u.password === password);
    if (!user) {
        return res.status(401).json({ error: 'Invalid email or password' });
    }

    res.json({ message: 'Login successful', success: true, username: user.username });
});

// ==================== ROOMS ENDPOINTS ====================
app.get('/api/rooms', (req, res) => {
    res.json(rooms);
});

app.post('/api/rooms', (req, res) => {
    const { name, number, type, status, price } = req.body;
    const newRoom = {
        id: Date.now(),
        name,
        number,
        type: type || 'Standard',
        status: status || 'Available',
        price: price || 0
    };
    rooms.push(newRoom);
    res.json({ message: 'Room added successfully', id: newRoom.id });
});

app.put('/api/rooms/:id', (req, res) => {
    const { status } = req.body;
    const room = rooms.find(r => r.id == req.params.id);
    if (!room) return res.status(404).json({ error: 'Room not found' });
    room.status = status;
    res.json({ message: 'Room status updated successfully' });
});

app.delete('/api/rooms/:id', (req, res) => {
    rooms = rooms.filter(r => r.id != req.params.id);
    res.json({ message: 'Room deleted successfully' });
});

// ==================== PRODUCTS ENDPOINTS ====================
app.get('/api/products', (req, res) => {
    res.json(products);
});

app.post('/api/products', (req, res) => {
    const { product, category, quantity, buying, selling, date } = req.body;
    const newProduct = {
        id: Date.now(),
        product,
        category,
        quantity,
        buying,
        selling,
        date
    };
    products.push(newProduct);
    res.json({ message: 'Product added successfully', id: newProduct.id });
});

app.put('/api/products/:id', (req, res) => {
    const { product, category, quantity, buying, selling, date } = req.body;
    const index = products.findIndex(p => p.id == req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Product not found' });
    
    products[index] = { ...products[index], product, category, quantity, buying, selling, date };
    res.json({ message: 'Product updated successfully' });
});

app.delete('/api/products/:id', (req, res) => {
    products = products.filter(p => p.id != req.params.id);
    res.json({ message: 'Product deleted successfully' });
});

// ==================== ORDERS ENDPOINTS ====================
app.get('/api/orders', (req, res) => {
    res.json(orders);
});

app.post('/api/orders', (req, res) => {
    const { table_number, items, total, status } = req.body;
    const newOrder = {
        id: Date.now(),
        table_number,
        items: typeof items === 'string' ? JSON.parse(items || '[]') : (items || []),
        total,
        status: status || 'Pending'
    };
    orders.push(newOrder);
    res.json({ id: newOrder.id, success: true });
});

app.patch('/api/orders/:id', (req, res) => {
    const { status } = req.body;
    const order = orders.find(o => o.id == req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    order.status = status;
    res.json({ message: 'Order status updated' });
});

app.delete('/api/orders/:id', (req, res) => {
    orders = orders.filter(o => o.id != req.params.id);
    res.json({ message: 'Order deleted' });
});

// Route mapping for pages
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/overview', (req, res) => {
    res.sendFile(path.join(__dirname, 'overview.html'));
});

// Local development server runner
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server is running at http://localhost:${PORT}`);
    });
}

// Export app for Vercel serverless functions
module.exports = app;