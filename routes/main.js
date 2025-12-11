// Create a new router
const express = require("express")
const router = express.Router()

const redirectLogin = (req, res, next) => {
   if(!req.session.userId) {
     res.redirect('./users/login')
   } else {
       next();
   }
}

// Handle our routes
router.get('/', function(req, res, next) {
    res.render('index.ejs')
});

router.get('/about', function(req, res, next) {
    res.render('about.ejs')
});

router.get('/logout', redirectLogin, (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.redirect('./')
        }
        res.send('You are now logged out. <a href="/">Home</a>');
    })
})

// Analytics Dashboard - requires login
router.get('/analytics', redirectLogin, function(req, res, next) {
    res.render('analytics.ejs', { username: req.session.userId })
})

// Dashboard - requires login
router.get('/dashboard', redirectLogin, function(req, res, next) {
    // Get user's workout stats
    const userId = req.session.userId
    const statsQuery = `
        SELECT
            COUNT(*) as total_workouts,
            COALESCE(SUM(duration_minutes), 0) as total_minutes,
            COALESCE(SUM(calories_burned), 0) as total_calories,
            COALESCE(SUM(distance_km), 0) as total_distance
        FROM workouts w
        JOIN users u ON w.user_id = u.id
        WHERE u.username = ?
    `

    db.query(statsQuery, [userId], (err, stats) => {
        if (err) {
            return next(err)
        }

        // Get recent workouts
        const recentQuery = `
            SELECT w.*, wt.name as workout_type
            FROM workouts w
            JOIN workout_types wt ON w.workout_type_id = wt.id
            JOIN users u ON w.user_id = u.id
            WHERE u.username = ?
            ORDER BY w.workout_date DESC
            LIMIT 5
        `

        db.query(recentQuery, [userId], (err, recentWorkouts) => {
            if (err) {
                return next(err)
            }
            res.render('dashboard.ejs', {
                stats: stats[0],
                recentWorkouts: recentWorkouts,
                username: userId
            })
        })
    })
})

// Export the router object so index.js can access it
module.exports = router
