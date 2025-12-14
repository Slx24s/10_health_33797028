# FitTrack - Fitness Tracking Application

## Project Overview

FitTrack is a fitness tracking web application that allows users to log their fitness activities, track progress, and generate reports on their workouts.

## Technology Stack

- **Backend**: Node.js with Express.js
- **Templating**: EJS (Embedded JavaScript)
- **Database**: MySQL
- **Authentication**: bcrypt, express-session
- **Security**: express-validator, express-sanitizer

## Features

- User registration and login with secure authentication
- Add, view, and delete workouts
- Search and filter workouts by name, type, and date
- Personal dashboard with statistics
- Analytics page with interactive charts
- REST API endpoints
- CSV data export

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MySQL Server

### Steps

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up the database**:
   ```sql
   SOURCE create_db.sql;
   SOURCE insert_test_data.sql;
   ```

3. **Start the application**:
   ```bash
   node index.js
   ```

4. **Access** at `http://localhost:8000`

## Test Credentials

- **Username**: gold
- **Password**: smiths

## Project Structure

```
├── index.js              # Main entry point
├── create_db.sql         # Database schema
├── insert_test_data.sql  # Test data
├── routes/
│   ├── main.js           # Home, about, dashboard
│   ├── users.js          # Authentication
│   ├── workouts.js       # Workout CRUD
│   └── api.js            # JSON API
├── views/                # EJS templates
└── public/               # Static files
```

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /api/workouts` | Get all workouts |
| `GET /api/workouts/:id` | Get single workout |
| `GET /api/workout-types` | Get workout types |
| `GET /api/stats/:username` | Get user statistics |

## Documentation

See `report.docx` for full documentation including architecture diagrams, data model, and advanced techniques.
