const express = require('express'); 
const mysql = require('mysql'); 
const bodyParser = require('body-parser'); 
const path = require('path');
const session = require('express-session'); 
const app = express(); 
const port = 3000; 
require('dotenv').config();

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


// Set up session middleware
app.use(session({
  secret:process.env.SESSION_SECRET, 
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 1800000,  // Session expires after 30 minutes
    secure: false 
    } 
}));


app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true })); 


app.use(express.static(path.join(__dirname, '..', 'pages', 'Login and Reg Page')));
app.use(express.static(path.join(__dirname, '..', 'pages', 'Admin page')));


// Redirect root path to the login page
app.get('/', (req, res) => {
  res.redirect('/login');
});

// Serve the login page when /login is requested
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'pages', 'Login and Reg Page', 'login_reg_page.html'));
});

// Serve the admin page when /admin_page is requested
app.get('/admin_page', ensureAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'pages', 'Admin page', 'admin_page.html'));
});

app.get('/admin_page/wareh_man', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'pages', 'Admin page', 'wareh_man', 'wareh_man.html'));
});


app.use((req, res, next) => {
  req.db = db;
  next();
});


// Import and use manage_data route
const manageDataRoute = require('./routes/manage_data');
app.use('/manage_data', manageDataRoute);


// Import and use login route
const loginRoute = require('./routes/login');
app.use('/login', loginRoute);

const createRescuerRoute = require('./routes/create_rescuer');
app.use('/create_rescuer', createRescuerRoute);

const logoutRoute = require('./routes/logout');
app.use('/logout', logoutRoute);


const announcementsRoutes = require('./routes/announcements');
app.use('/announcements', announcementsRoutes);

function ensureAuthenticated(req, res, next) {
  if (req.session) {
      return next(); // User is authenticated, proceed to the next middleware
  } else {
      res.redirect('/login'); // Redirect to the login page if not authenticated
  }
}

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
