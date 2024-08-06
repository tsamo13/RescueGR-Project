const express = require('express'); // Import express
const mysql = require('mysql'); // Import MySQL driver
const bodyParser = require('body-parser'); // Import body-parser

const app = express(); // Create an Express application
const port = 3000; // Define the port your server will run on


// MySQL connection setup
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root', 
    password: 'Ilov3soad', 
    database: 'web_project' 
  });
  
  db.connect((err) => {
    if (err) {
      throw err;
    }
    console.log('Connected to database');
  });


// Middleware setup  
app.use(bodyParser.json()); // Use body-parser middleware to parse JSON
app.use(bodyParser.urlencoded({ extended: true })); // Use body-parser middleware to parse URL-encoded data


// Define routes
app.get('/', (req, res) => {
    res.send('Welcome to the web project!');
  });
  
  app.get('/users', (req, res) => {
    let sql = 'SELECT * FROM user';
    db.query(sql, (err, results) => {
      if (err) throw err;
      res.json(results);
    });
  });
  
  app.post('/user', (req, res) => {
    let newUser = req.body;
    let sql = 'INSERT INTO user SET ?';
    db.query(sql, newUser, (err, result) => {
      if (err) {
        console.error('Error inserting new user:', err);
        res.status(500).send('Error inserting new user');
        return;
      }
      res.send('User added...');
    });
  });


// Start server
app.listen(port, () => {
    console.log(`Server started on port ${port}`);
  });

