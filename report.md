# FitTrack - Fitness Tracking Application

## Project Overview

FitTrack is a comprehensive fitness tracking web application built for the Dynamic Web Applications module. It allows users to log their fitness activities, track progress, and generate reports on their workouts.

## Technology Stack

- **Backend**: Node.js with Express.js framework
- **Templating Engine**: EJS (Embedded JavaScript)
- **Database**: MySQL
- **Authentication**: bcrypt for password hashing, express-session for session management
- **Security**: express-validator for input validation, express-sanitizer for XSS protection
- **Environment**: dotenv for configuration management

## Features

### Core Features

1. **Home Page** (`/`)
   - Welcome page with navigation links to all features
   - Easy access to workouts, search, and user account functions

2. **About Page** (`/about`)
   - Application description and feature overview
   - Technology information

3. **User Authentication**
   - Registration with validation (email format, username 5-20 chars, password 8+ chars)
   - Secure login with bcrypt password hashing
   - Session-based authentication with 10-minute expiry
   - Audit logging for all login attempts (success/failure)

4. **Workout Management**
   - Add new workouts with details (name, type, duration, calories, distance, notes, date)
   - View list of personal workouts
   - View detailed information for individual workouts
   - Support for 5 workout types: Cardio, Strength, Flexibility, HIIT, Sports

5. **Search Functionality**
   - Search workouts by name (partial match)
   - Filter by workout type
   - Filter by date range
   - Combined filtering supported

6. **Dashboard**
   - Personalized statistics (total workouts, minutes, calories, distance)
   - Recent workout history
   - Quick action buttons

7. **REST API**
   - JSON endpoint at `/api/workouts`
   - Query parameters: search, type, mindate, maxdate, sort
   - Additional endpoints for workout types and user stats

### Security Features

- **Password Hashing**: All passwords stored using bcrypt with salt rounds
- **Session Management**: Secure sessions with configurable expiry
- **Input Validation**: Server-side validation using express-validator
- **XSS Protection**: Input sanitization using express-sanitizer
- **Parameterized Queries**: SQL injection prevention
- **Audit Logging**: Track all authentication attempts

## Database Schema

### Tables

1. **users**
   - id, username, first_name, last_name, email, hashedPassword, created_at

2. **workout_types**
   - id, name, description

3. **workouts**
   - id, user_id, workout_type_id, name, duration_minutes, calories_burned, distance_km, notes, workout_date, created_at

4. **audit_log**
   - id, username, status, details, created_at

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MySQL Server

### Steps

1. **Clone the repository** and navigate to the project directory

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up the database**:
   - Connect to MySQL and run the database creation script:
   ```sql
   SOURCE create_db.sql;
   ```
   - Insert test data:
   ```sql
   SOURCE insert_test_data.sql;
   ```

4. **Configure environment** (optional):
   - Create a `.env` file with your database credentials:
   ```
   HEALTH_HOST=localhost
   HEALTH_USER=health_app
   HEALTH_PASSWORD=qwertyuiop
   HEALTH_DATABASE=health
   HEALTH_BASE_PATH=http://localhost:8000
   ```

5. **Start the application**:
   ```bash
   node index.js
   ```

6. **Access the application** at `http://localhost:8000`

## Default Test Credentials

- **Username**: gold
- **Password**: smiths

## Routes Summary

### Public Routes
| Route | Method | Description |
|-------|--------|-------------|
| `/` | GET | Home page |
| `/about` | GET | About page |
| `/users/register` | GET | Registration form |
| `/users/registered` | POST | Handle registration |
| `/users/login` | GET | Login form |
| `/users/loggedin` | POST | Handle login |
| `/users/audit` | GET | View audit log |
| `/workouts/search` | GET | Search form |
| `/workouts/search-result` | GET | Search results |
| `/workouts/:id` | GET | View single workout |

### Protected Routes (Require Login)
| Route | Method | Description |
|-------|--------|-------------|
| `/dashboard` | GET | User dashboard |
| `/workouts/list` | GET | List user's workouts |
| `/workouts/add` | GET | Add workout form |
| `/workouts/added` | POST | Handle add workout |
| `/users/list` | GET | List all users |
| `/logout` | GET | Logout |

### API Routes
| Route | Method | Description |
|-------|--------|-------------|
| `/api/workouts` | GET | Get all workouts (JSON) |
| `/api/workouts/:id` | GET | Get single workout (JSON) |
| `/api/workout-types` | GET | Get workout types (JSON) |
| `/api/stats/:username` | GET | Get user stats (JSON) |

## Input Validation

### Registration
- Email: Valid email format
- Username: 5-20 characters
- Password: Minimum 8 characters
- First/Last Name: Required, trimmed and sanitized

### Login
- Username: Required
- Password: Required

### Add Workout
- Name: Required, trimmed and sanitized
- Workout Type: Required
- Date: Required
- Duration/Calories/Distance: Optional, must be positive numbers
- Notes: Optional, sanitized

## API Documentation

### Get All Workouts
```
GET /api/workouts
```

**Query Parameters**:
- `search` - Search by workout name
- `type` - Filter by workout type ID
- `mindate` - Filter by minimum date (YYYY-MM-DD)
- `maxdate` - Filter by maximum date (YYYY-MM-DD)
- `sort` - Sort by: name, date, calories, duration

**Example**:
```
/api/workouts?type=1&sort=date
```

### Get User Stats
```
GET /api/stats/:username
```

**Response**:
```json
{
  "total_workouts": 7,
  "total_minutes": 345,
  "total_calories": 2230,
  "total_distance": 20.00
}
```

## Project Structure

```
10_health_33797028/
├── index.js              # Main entry point
├── package.json          # Dependencies
├── create_db.sql         # Database schema
├── insert_test_data.sql  # Test data
├── .gitignore           # Git ignore file
├── report.md            # This documentation
├── links.txt            # Page URLs
├── routes/
│   ├── main.js          # Home, about, dashboard, logout
│   ├── users.js         # Authentication routes
│   ├── workouts.js      # Workout CRUD routes
│   └── api.js           # JSON API routes
├── views/
│   ├── index.ejs        # Home page
│   ├── about.ejs        # About page
│   ├── login.ejs        # Login form
│   ├── register.ejs     # Registration form
│   ├── dashboard.ejs    # User dashboard
│   ├── workouts-list.ejs # Workout list
│   ├── add-workout.ejs  # Add workout form
│   ├── search.ejs       # Search form
│   ├── search-results.ejs # Search results
│   ├── workout-details.ejs # Single workout view
│   ├── userslist.ejs    # Users list
│   └── audit.ejs        # Audit log
└── public/
    └── main.css         # Stylesheet
```

## Deployment Notes

- The application is designed to run on Linux servers
- Uses environment variables for database configuration
- Listens on port 8000 by default
- No Windows-specific dependencies

## Author

Dynamic Web Applications Module - Final Project
