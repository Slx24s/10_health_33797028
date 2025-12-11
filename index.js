// Import express and ejs
var express = require('express')
var ejs = require('ejs')
const path = require('path')
var mysql = require('mysql2');
var session = require('express-session')
const expressSanitizer = require('express-sanitizer');
require('dotenv').config()

// Define the database connection pool
const db = mysql.createPool({
    host: process.env.HEALTH_HOST || 'localhost',
    user: process.env.HEALTH_USER || 'health_app',
    password: process.env.HEALTH_PASSWORD || 'qwertyuiop',
    database: process.env.HEALTH_DATABASE || 'health',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

global.db = db;

// Test the database connection
db.getConnection((err, connection) => {
    if (err) {
        console.error('Database connection failed:', err);
    } else {
        console.log('Database connected successfully!');
        connection.release();
    }
});

// Create the express application object
const app = express()
const port = 8000

// Tell Express that we want to use EJS as the templating engine
app.set('view engine', 'ejs')

// Set up the body parser
app.use(express.urlencoded({ extended: true }))

// Create an input sanitizer
app.use(expressSanitizer());

// Set up public folder (for css and static js)
app.use(express.static(path.join(__dirname, 'public')))

// Create a session
app.use(session({
   secret: 'fitnesstrackersecret',
   resave: false,
   saveUninitialized: false,
   cookie: {
       expires: 600000
   }
}))

// Define our application-specific data
app.locals.appData = {appName: "FitTrack"}

// Load the route handlers
const mainRoutes = require("./routes/main")
app.use('/', mainRoutes)

// Load the route handlers for /users
const usersRoutes = require('./routes/users')
app.use('/users', usersRoutes)

// Load the route handlers for /workouts
const workoutsRoutes = require('./routes/workouts')
app.use('/workouts', workoutsRoutes)

// Load the route handlers for /api
const apiRoutes = require('./routes/api')
app.use('/api', apiRoutes)

// Start the web app listening
app.listen(port, () => console.log(`FitTrack app listening on port ${port}!`))
