// Create a new router
const express = require("express")
const router = express.Router()

// GET all workouts with optional filters
router.get('/workouts', function(req, res, next) {
    let search = req.query.search
    let typeId = req.query.type
    let minDate = req.query.mindate
    let maxDate = req.query.maxdate
    let sort = req.query.sort

    let sqlquery = `
        SELECT w.id, w.name, w.duration_minutes, w.calories_burned, w.distance_km,
               w.notes, w.workout_date, wt.name as workout_type
        FROM workouts w
        JOIN workout_types wt ON w.workout_type_id = wt.id
    `
    let conditions = []
    let params = []

    if (search) {
        conditions.push("w.name LIKE ?")
        params.push('%' + search + '%')
    }

    if (typeId) {
        conditions.push("w.workout_type_id = ?")
        params.push(parseInt(typeId))
    }

    if (minDate) {
        conditions.push("w.workout_date >= ?")
        params.push(minDate)
    }

    if (maxDate) {
        conditions.push("w.workout_date <= ?")
        params.push(maxDate)
    }

    if (conditions.length > 0) {
        sqlquery += " WHERE " + conditions.join(" AND ")
    }

    if (sort === 'name') {
        sqlquery += " ORDER BY w.name ASC"
    } else if (sort === 'date') {
        sqlquery += " ORDER BY w.workout_date DESC"
    } else if (sort === 'calories') {
        sqlquery += " ORDER BY w.calories_burned DESC"
    } else if (sort === 'duration') {
        sqlquery += " ORDER BY w.duration_minutes DESC"
    }

    db.query(sqlquery, params, (err, result) => {
        if (err) {
            res.json(err)
            return next(err)
        }
        res.json(result)
    })
})

// GET workout types
router.get('/workout-types', function(req, res, next) {
    db.query('SELECT * FROM workout_types', (err, result) => {
        if (err) {
            res.json(err)
            return next(err)
        }
        res.json(result)
    })
})

// GET single workout by ID
router.get('/workouts/:id', function(req, res, next) {
    const workoutId = req.params.id
    const sqlquery = `
        SELECT w.id, w.name, w.duration_minutes, w.calories_burned, w.distance_km,
               w.notes, w.workout_date, wt.name as workout_type
        FROM workouts w
        JOIN workout_types wt ON w.workout_type_id = wt.id
        WHERE w.id = ?
    `
    db.query(sqlquery, [workoutId], (err, result) => {
        if (err) {
            res.json(err)
            return next(err)
        }
        if (!result || result.length === 0) {
            return res.json({ error: 'Workout not found' })
        }
        res.json(result[0])
    })
})

// GET user stats
router.get('/stats/:username', function(req, res, next) {
    const username = req.params.username
    const sqlquery = `
        SELECT
            COUNT(*) as total_workouts,
            COALESCE(SUM(w.duration_minutes), 0) as total_minutes,
            COALESCE(SUM(w.calories_burned), 0) as total_calories,
            COALESCE(SUM(w.distance_km), 0) as total_distance
        FROM workouts w
        JOIN users u ON w.user_id = u.id
        WHERE u.username = ?
    `
    db.query(sqlquery, [username], (err, result) => {
        if (err) {
            res.json(err)
            return next(err)
        }
        res.json(result[0])
    })
})

// Export the router object so index.js can access it
module.exports = router
