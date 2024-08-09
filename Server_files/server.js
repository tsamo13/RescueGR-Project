const express = require('express'); // Import express
const mysql = require('mysql'); // Import MySQL driver
const bodyParser = require('body-parser'); // Import body-parser
const path = require('path');

const app = express(); // Create an Express application
const port = 3000; // Define the port your server will run on


// MySQL connection setup
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root', 
    password: 'NodejsProject!', 
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


// Serve static files from the "pages/Login and Reg Page" directory
app.use(express.static(path.join(__dirname, '..', 'pages', 'Login and Reg Page')));

// Serve static files from "pages/Admin page" directory
app.use(express.static(path.join(__dirname, '..', 'pages', 'Admin page')));

// Middleware to attach db connection to request object
app.use((req, res, next) => {
  req.db = db;
  next();
});


// Import and use login route
const loginRoute = require('./routes/login');
app.use('/login', loginRoute);


// Start server
app.listen(port, () => {
    console.log(`Server started on port ${port}`);
  });

