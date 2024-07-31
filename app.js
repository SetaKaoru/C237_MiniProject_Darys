const express = require('express');
const mysql = require('mysql2');
const multer = require('multer');
const app = express();

// Set up view engine
app.set('view engine', 'ejs');

// enable static files
app.use(express.static('public'));

app.use(express.urlencoded({
    extended: false
}));

const storage = multer.diskStorage( {
    destination: (req, file, cb) =>
    {
        cb(null, 'public/images');
    },
    filename: (req, file, cb) =>
    {
        cb(null, file.originalname);
    }
});

const upload = multer({ storage: storage });

// Create MySQL connection
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'collectorapp'
});
connection.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL database');
});

app.get('/', (req, res) => {
    const sql = 'SELECT * FROM itemlist';
    connection.query(sql, (error, results) => {
        if (error) {
            console.error('Databse query error:', error.message);
            return res.status(500).send('Error Retrieving items');
        }
        res.render('index', {itemlist: results})
    });
});

app.get('/item/:id', (req, res) => {
    const itemId = req.params.id;
    const sql = 'SELECT * FROM itemlist WHERE id = ?';
    connection.query(sql, [itemId], (error, results) => {
        if (error) {
            console.error('Database query error:', error.message);
            return res.status(500).send('Error Retrieving item by ID');
        }
        if (results.length > 0) {
            res.render('item', { item: results[0] });
        } else {
            res.render('item', { item: null });
            // ^ REMEMBER THIS !!!!!
        }
    });
});

app.get('/additem', (req, res) => {
    res.render('addItem');
});

app.post('/addItem', (req, res) => {
    const { name, variant, history, image } = req.body;
    const sql = 'INSERT INTO itemlist (name, variant, history, image) VALUES (?, ?, ?, ?)';
    connection.query( sql, [name, variant, history, image], (error, results) => {
        if (error) {
            console.error("Error adding item:", error);
            res.status(500).send('Error adding item');
        } else {
            res.redirect('/');
        }
    });
});

app.post('/addItem', upload.single('image'), (req, res) => {
    const { name, variant, history } = req.body;
    let image;
    if (req.file) {
        image = req.file.filename;
    } else {

    }
    const sql = 'INSERT INTO itemlist (name, variant, history, image) VALUES (?, ?, ?, ?)';
    connection.query( sql, [name, variant, history, image], (error, results) => {
        if (error) {
            console.error("Error adding item:", error);
            res.status(500).send('Error adding item');
        } else {
            res.redirect('/');
        }
    });
});

app.get('/editItem/:id', (req,res) => {
    const id = req.params.id;
    const sql = 'SELECT * FROM itemlist WHERE id = ?';
    connection.query(sql, [id], (error, results) => {
        if (error) {
            console.error('Database query error:', error.message);
            return res.status(500).send('Error retrieving item by ID');
        }
        if (results.length > 0) {
            res.render('editItem', { item: results[0] });
        } else {
            res.status(404).send('Item not found')
        }
    });
});

app.post('/editItem/:id', upload.single('image'), (req, res) => {
    const id = req.params.id;
    const {name, variant, history} = req.body;
    let image = req.body.currentImage;
    if (req.file) {
        image = req.file.filename;
    }

    const sql = 'UPDATE itemlist SET name = ?, variant = ?, history = ?, image =? WHERE id = ?';

    connection.query( sql , [name, variant, history, image, id], (error, results) => {
        if (error) {
            console.error("Error updating item:", error);
            res.status(500).send('Error updating item');
        } else {
            res.redirect('/');
        }
    });
});

app.get('/deleteItem/:id', (req, res) => {
    const idItem = req.params.id;
    const sql = 'DELETE FROM itemlist WHERE id = ?';
    connection.query( sql, [idItem], (error, results) => {
        if (error) {
            console.error("Error deleting item:", error);
            res.status(500).send('Error deleting item');
        } else {
            res.redirect('/');
        }
    });
});

const PORT = process.env.PORT || 2000;
app.listen( PORT, () => console.log(`Server started at http://localhost:${PORT}`) );

// Define routes
app.get('/', (req, res) => {
    connection.query('SELECT * FROM TABLE', (error, results) => {
        if (error) throw error;
        res.render('index', { results });
    });
});