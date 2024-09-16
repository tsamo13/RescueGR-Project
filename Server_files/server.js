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
    maxAge: 3600000,  // Session expires after 60 minutes
    secure: false 
    } 
}));


app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true })); 

// Add cache-control headers for static files
const oneDay = 86400000;  // 1 day in milliseconds
app.use(express.static(path.join(__dirname, '..', 'pages', 'Login and Reg Page'), {
  maxAge: oneDay, // Cache static files for 1 day
  setHeaders: function (res, path) {
    if (path.endsWith('.css') || path.endsWith('.js')) {
      res.setHeader('Cache-Control', 'public, max-age=604800');  // 7 days for JS and CSS
    } else if (path.endsWith('.jpg') || path.endsWith('.png')) {
      res.setHeader('Cache-Control', 'public, max-age=2592000'); // 30 days for images
    }
  }
}));


app.use(express.static(path.join(__dirname, '..', 'pages', 'Login and Reg Page'), { maxAge: oneDay }));
app.use(express.static(path.join(__dirname, '..', 'pages', 'Admin page'), { maxAge: oneDay }));
app.use(express.static(path.join(__dirname, '..', 'pages', 'Rescuer page'), { maxAge: oneDay }));
app.use(express.static(path.join(__dirname, '..', 'pages', 'Civilians_page'), { maxAge: oneDay }));
app.use(express.static(path.join(__dirname, '..', 'pages', 'Sign_up page'), { maxAge: oneDay }));

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

// Serve the rescuer page when /res_page is requested
app.get('/res_page', ensureAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'pages', 'Rescuer page', 'res_page.html'));
});

// Serve the civilians page when /civ_page is requested
app.get('/civ_page', ensureAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'pages', 'Civilians_page', 'civ_page.html'));
});

// Serve the Base Warehouse Management page with authentication check
app.get('/admin_page/wareh_man', ensureAuthenticated,(req, res) => {
  res.sendFile(path.join(__dirname, '..', 'pages', 'Admin page', 'wareh_man', 'wareh_man.html'));
});

// Serve the Create Rescuer Account page with authentication check
app.get('/admin_page/cr_res_acc', ensureAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'pages', 'Admin page', 'cr_res_acc', 'cr_res_acc.html'));
});

// Serve the Map View page with authentication check
app.get('/admin_page/map_view', ensureAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'pages', 'Admin page', 'map_view', 'map_view.html'));
});

// Serve the Create Announcement page with authentication check
app.get('/admin_page/cr_an', ensureAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'pages', 'Admin page', 'cr_an', 'cr_an.html'));
});

// Serve the Warehouse Status View page with authentication check
app.get('/admin_page/wsv', ensureAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'pages', 'Admin page', 'wsv', 'wsv.html'));
});

// Serve the Service Statistics page with authentication check
app.get('/admin_page/ss', ensureAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'pages', 'Admin page', 'ss', 'ss.html'));
});

// Serve the Requests Management page with authentication check
app.get('/civilians_page/req_man', ensureAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'pages', 'Civilians_page', 'req_man', 'req_man.html'));
});

// Serve the Announcements and Offers Management page with authentication check
app.get('/civilians_page/aom', ensureAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'pages', 'Civilians_page', 'aom_page', 'aom.html'));
});

// Serve the Rescuer Map View page with authentication check
app.get('/rescuer_page/map_viewR', ensureAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'pages', 'Rescuer Page', 'map_viewR', 'map_viewR.html'));
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

const civiliansRoute = require('./routes/civilians');
app.use('/civilians', civiliansRoute);

const warehouseStatusRoute = require('./routes/warehouse_status');
app.use('/warehouse_status', warehouseStatusRoute);

const requestsRoute = require('./routes/requests');
app.use('/requests', requestsRoute);

const rescuerRoute = require('./routes/take_location_of_signed_rescuer');
app.use('/take_location_of_signed_rescuer', rescuerRoute);

const tasksRoute = require('./routes/tasks');
app.use('/tasks', tasksRoute);

const aofRouter = require('./routes/aof_page');
app.use('/aof_page', aofRouter);

const baseLocationRoute = require('./routes/baseLocation');
app.use('/baseLocation', baseLocationRoute);

const adminMapRoute = require('./routes/admin_map');
app.use('/admin_map', adminMapRoute);

const offerRoute = require('./routes/offers');
app.use('/offers', offerRoute);

const rescuerformRoute = require('./routes/rescuer_form');
app.use('/rescuer_form', rescuerformRoute);

const serviceStatisticsRoute = require('./routes/service_statistics');
app.use('/service_statistics', serviceStatisticsRoute);

function ensureAuthenticated(req, res, next) {
  if (req.session && req.session.user) {
      return next();                  // User is authenticated, proceed to the next middleware
  } else {
      res.redirect('/login');         // Redirect to the login page if not authenticated
  }
}

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});


