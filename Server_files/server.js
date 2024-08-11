const express = require('express'); 
const mysql = require('mysql'); 
const bodyParser = require('body-parser'); 
const path = require('path');

const app = express(); 
const port = 3000; 



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



app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true })); 



app.use(express.static(path.join(__dirname, '..', 'pages', 'Login and Reg Page')));


app.use(express.static(path.join(__dirname, '..', 'pages', 'Admin page')));


app.use((req, res, next) => {
  req.db = db;
  next();
});


<<<<<<< HEAD

=======
// Import and use manage_data route
const manageDataRoute = require('./routes/manage_data');
app.use('/manage_data', manageDataRoute);


// Import and use login route
>>>>>>> chris-server
const loginRoute = require('./routes/login');
app.use('/login', loginRoute);


<<<<<<< HEAD

=======
>>>>>>> chris-server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
