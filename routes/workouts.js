// Create a new router
const express = require("express")
const { check, validationResult } = require('express-validator');
const router = express.Router()

const redirectLogin = (req, res, next) => {
   if(!req.session.userId) {
     res.redirect('../users/login')
   } else {
       next();
   }
}

// Search page
router.get('/search', function(req, res, next) {
    // Get workout types for dropdown
    db.query('SELECT * FROM workout_types', (err, types) => {
        if (err) {
            return next(err)
        }
        res.render("search.ejs", { workoutTypes: types })
    })
});

// Search results
router.get('/search-result',
[check('keyword').optional().trim().escape()],
function(req, res, next) {
    let keyword = req.query.keyword ? req.sanitize(req.query.keyword) : ''
    let typeId = req.query.type
    let dateFrom = req.query.date_from
    let dateTo = req.query.date_to

    let sqlquery = `
        SELECT w.*, wt.name as workout_type
        FROM workouts w
        JOIN workout_types wt ON w.workout_type_id = wt.id
        WHERE 1=1
    `
    let params = []

    if (keyword) {
        sqlquery += " AND w.name LIKE ?"
        params.push('%' + keyword + '%')
    }

    if (typeId && typeId !== '') {
        sqlquery += " AND w.workout_type_id = ?"
        params.push(typeId)
    }

    if (dateFrom) {
        sqlquery += " AND w.workout_date >= ?"
        params.push(dateFrom)
    }

    if (dateTo) {
        sqlquery += " AND w.workout_date <= ?"
        params.push(dateTo)
    }

    sqlquery += " ORDER BY w.workout_date DESC"

    db.query(sqlquery, params, (err, result) => {
        if (err) {
            return next(err)
        }
        res.render("search-results.ejs", {
            keyword: keyword,
            results: result,
            filters: { typeId, dateFrom, dateTo }
        })
    })
});

// List all workouts (protected)
router.get('/list', redirectLogin, function(req, res, next) {
    const userId = req.session.userId
    let sqlquery = `
        SELECT w.*, wt.name as workout_type
        FROM workouts w
        JOIN workout_types wt ON w.workout_type_id = wt.id
        JOIN users u ON w.user_id = u.id
        WHERE u.username = ?
        ORDER BY w.workout_date DESC
    `
    db.query(sqlquery, [userId], (err, result) => {
        if (err) {
            return next(err)
        }
        res.render("workouts-list.ejs", { workouts: result })
    });
});

// Add workout page (protected)
router.get('/add', redirectLogin, function(req, res, next) {
    db.query('SELECT * FROM workout_types', (err, types) => {
        if (err) {
            return next(err)
        }
        res.render("add-workout.ejs", { workoutTypes: types })
    })
});

// Handle add workout (protected)
router.post('/added', redirectLogin,
[check('name').notEmpty().withMessage('Workout name is required').trim().escape(),
 check('workout_type').notEmpty().withMessage('Workout type is required'),
 check('duration').optional().isInt({min: 0}).withMessage('Duration must be a positive number'),
 check('calories').optional().isInt({min: 0}).withMessage('Calories must be a positive number'),
 check('distance').optional().isFloat({min: 0}).withMessage('Distance must be a positive number'),
 check('workout_date').notEmpty().withMessage('Workout date is required')],
function(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return db.query('SELECT * FROM workout_types', (err, types) => {
            res.render("add-workout.ejs", { workoutTypes: types, errors: errors.array() })
        })
    }

    const username = req.session.userId
    const workoutName = req.sanitize(req.body.name)
    const workoutType = req.body.workout_type
    const duration = req.body.duration || null
    const calories = req.body.calories || null
    const distance = req.body.distance || null
    const notes = req.body.notes ? req.sanitize(req.body.notes) : null
    const workoutDate = req.body.workout_date

    // Get user id first
    db.query('SELECT id FROM users WHERE username = ?', [username], (err, userRows) => {
        if (err) {
            return next(err)
        }
        if (!userRows || userRows.length === 0) {
            return res.send('User not found')
        }

        const userId = userRows[0].id
        const sqlquery = `
            INSERT INTO workouts (user_id, workout_type_id, name, duration_minutes, calories_burned, distance_km, notes, workout_date)
            VALUES (?,?,?,?,?,?,?,?)
        `
        const newrecord = [userId, workoutType, workoutName, duration, calories, distance, notes, workoutDate]

        db.query(sqlquery, newrecord, (err, result) => {
            if (err) {
                return next(err)
            }
            res.redirect('https://doc.gold.ac.uk/usr/134/workouts/list')
        })
    })
})

// Delete workout (protected) - MUST be before /:id route
router.post('/delete/:id', redirectLogin, function(req, res, next) {
    const workoutId = req.params.id
    const username = req.session.userId

    // Verify the workout belongs to the logged-in user
    const verifyQuery = `
        SELECT w.id FROM workouts w
        JOIN users u ON w.user_id = u.id
        WHERE w.id = ? AND u.username = ?
    `
    db.query(verifyQuery, [workoutId, username], (err, result) => {
        if (err) {
            return next(err)
        }
        if (!result || result.length === 0) {
            return res.status(403).send('Unauthorized to delete this workout. <a href="/workouts/list">Back to list</a>')
        }

        // Delete the workout
        db.query('DELETE FROM workouts WHERE id = ?', [workoutId], (err, result) => {
            if (err) {
                return next(err)
            }
            res.redirect('https://doc.gold.ac.uk/usr/134/workouts/list')
        })
    })
})

// Export workouts as CSV (protected) - MUST be before /:id route
router.get('/export/csv', redirectLogin, function(req, res, next) {
    const username = req.session.userId
    const sqlquery = `
        SELECT w.name, wt.name as workout_type, w.duration_minutes, 
               w.calories_burned, w.distance_km, w.notes, w.workout_date
        FROM workouts w
        JOIN workout_types wt ON w.workout_type_id = wt.id
        JOIN users u ON w.user_id = u.id
        WHERE u.username = ?
        ORDER BY w.workout_date DESC
    `
    db.query(sqlquery, [username], (err, workouts) => {
        if (err) {
            return next(err)
        }

        // Build CSV content
        const headers = ['Name', 'Type', 'Duration (mins)', 'Calories', 'Distance (km)', 'Notes', 'Date']
        let csv = headers.join(',') + '\n'

        workouts.forEach(w => {
            const row = [
                '"' + (w.name || '').replace(/"/g, '""') + '"',
                '"' + (w.workout_type || '') + '"',
                w.duration_minutes || '',
                w.calories_burned || '',
                w.distance_km || '',
                '"' + (w.notes || '').replace(/"/g, '""').replace(/\n/g, ' ') + '"',
                w.workout_date ? new Date(w.workout_date).toISOString().split('T')[0] : ''
            ]
            csv += row.join(',') + '\n'
        })

        // Set headers for file download
        res.setHeader('Content-Type', 'text/csv')
        res.setHeader('Content-Disposition', 'attachment; filename="workouts-export.csv"')
        res.send(csv)
    })
})

// View single workout - MUST be last (catches all /:id patterns)
router.get('/:id', function(req, res, next) {
    const workoutId = req.params.id
    const sqlquery = `
        SELECT w.*, wt.name as workout_type, u.username
        FROM workouts w
        JOIN workout_types wt ON w.workout_type_id = wt.id
        JOIN users u ON w.user_id = u.id
        WHERE w.id = ?
    `
    db.query(sqlquery, [workoutId], (err, result) => {
        if (err) {
            return next(err)
        }
        if (!result || result.length === 0) {
            return res.send('Workout not found')
        }
        res.render("workout-details.ejs", { workout: result[0] })
    })
})

// Export the router object so index.js can access it
module.exports = router
