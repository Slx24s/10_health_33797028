// Create a new router
const express = require("express")
const bcrypt = require('bcrypt')
const { check, validationResult } = require('express-validator');
const router = express.Router()
const saltRounds = 10

const redirectLogin = (req, res, next) => {
   if(!req.session.userId) {
     res.redirect('./login')
   } else {
       next();
   }
}

// Ensure audit_log table exists
function ensureAuditTable(callback) {
    const createAudit = `CREATE TABLE IF NOT EXISTS audit_log (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50),
        status VARCHAR(20),
        details VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`
    db.query(createAudit, (err) => {
        if (err) {
            console.error('Audit table error:', err)
        }
        if (typeof callback === 'function') callback()
    })
}

// Registration page
router.get('/register', function(req, res, next) {
    res.render('register.ejs')
})

// Handle registration
router.post('/registered',
[check('email').isEmail().withMessage('Invalid email format'),
 check('username').isLength({min:5, max:20}).withMessage('Username must be 5-20 characters'),
 check('password').isLength({min:8}).withMessage('Password must be at least 8 characters'),
 check('first').notEmpty().withMessage('First name is required').trim().escape(),
 check('last').notEmpty().withMessage('Last name is required').trim().escape()],
function(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.render('register.ejs', { errors: errors.array() })
    }

    const plainPassword = req.body.password
    const username = req.sanitize(req.body.username)
    const first = req.sanitize(req.body.first)
    const last = req.sanitize(req.body.last)
    const email = req.body.email

    bcrypt.hash(plainPassword, saltRounds, function(err, hashedPassword) {
        if (err) {
            return next(err)
        }

        const insertSql = "INSERT INTO users (username, first_name, last_name, email, hashedPassword) VALUES (?,?,?,?,?)"
        const newrecord = [username, first, last, email, hashedPassword]

        db.query(insertSql, newrecord, (err, result) => {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.render('register.ejs', { errors: [{msg: 'Username already exists'}] })
                }
                return next(err)
            }
            res.send('Hello ' + first + ' ' + last + ', you are now registered! <a href="/users/login">Login here</a>')
        })
    })
});

// Login page
router.get('/login', function(req, res, next) {
    res.render('login.ejs')
})

// Handle login
router.post('/loggedin',
[check('username').notEmpty().withMessage('Username is required'),
 check('password').notEmpty().withMessage('Password is required')],
function(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.redirect('./login')
    }

    const { username, password } = req.body
    const sql = 'SELECT id, hashedPassword FROM users WHERE username = ? LIMIT 1'

    db.query(sql, [username], (err, rows) => {
        if (err) {
            return next(err)
        }
        if (!rows || rows.length === 0) {
            const insertAudit = "INSERT INTO audit_log (username, status, details) VALUES (?,?,?)"
            ensureAuditTable(() => db.query(insertAudit, [username, 'FAIL', 'user not found'], () => {}))
            return res.send('Login failed: user not found. <a href="/users/login">Try again</a>')
        }

        const hashedPassword = rows[0].hashedPassword
        bcrypt.compare(password, hashedPassword, function(err, result) {
            if (err) {
                return next(err)
            }
            if (result === true) {
                req.session.userId = username;
                const insertAudit = "INSERT INTO audit_log (username, status, details) VALUES (?,?,?)"
                ensureAuditTable(() => db.query(insertAudit, [username, 'SUCCESS', 'password matched'], () => {}))
                res.redirect('../dashboard')
            } else {
                const insertAudit = "INSERT INTO audit_log (username, status, details) VALUES (?,?,?)"
                ensureAuditTable(() => db.query(insertAudit, [username, 'FAIL', 'incorrect password'], () => {}))
                res.send('Login failed: incorrect password. <a href="/users/login">Try again</a>')
            }
        })
    })
})

// User list (protected)
router.get('/list', redirectLogin, function(req, res, next) {
    const sql = 'SELECT username, first_name, last_name, email, created_at FROM users'
    db.query(sql, (err, result) => {
        if (err) {
            return next(err)
        }
        res.render('userslist.ejs', { users: result })
    })
})

// Show audit history
router.get('/audit', function(req, res, next) {
    ensureAuditTable(() => {
        db.query('SELECT username, status, details, created_at FROM audit_log ORDER BY created_at DESC', (err, rows) => {
            if (err) {
                return next(err)
            }
            res.render('audit.ejs', { logs: rows })
        })
    })
})

// Export the router object so index.js can access it
module.exports = router
