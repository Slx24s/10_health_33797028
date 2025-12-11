USE health;

# Insert workout types
INSERT INTO workout_types (name, description) VALUES
('Cardio', 'Cardiovascular exercises like running, cycling, swimming'),
('Strength', 'Weight training and resistance exercises'),
('Flexibility', 'Stretching, yoga, and mobility work'),
('HIIT', 'High-Intensity Interval Training'),
('Sports', 'Team sports and recreational activities');

# Insert default 'gold' user with password 'smiths'
# Hash generated with bcrypt saltRounds=10
INSERT INTO users (username, first_name, last_name, email, hashedPassword)
VALUES ('gold', 'Gold', 'User', 'gold@example.com', '$2b$10$mDZBhe29EVDiVspuEQKYcuUqhD16kapigRuDg5gavUjNL9W.81MqW');

# Insert sample workouts for gold user (user_id = 1)
INSERT INTO workouts (user_id, workout_type_id, name, duration_minutes, calories_burned, distance_km, notes, workout_date) VALUES
(1, 1, 'Morning Run', 30, 300, 5.00, 'Felt great, good pace', '2024-01-15'),
(1, 2, 'Upper Body Workout', 45, 250, NULL, 'Bench press, rows, shoulder press', '2024-01-16'),
(1, 3, 'Yoga Session', 60, 150, NULL, 'Vinyasa flow, very relaxing', '2024-01-17'),
(1, 1, 'Evening Cycling', 45, 400, 15.00, 'Hill intervals', '2024-01-18'),
(1, 4, 'HIIT Circuit', 25, 350, NULL, '30 sec on, 10 sec off, 5 rounds', '2024-01-19'),
(1, 2, 'Leg Day', 50, 280, NULL, 'Squats, lunges, deadlifts', '2024-01-20'),
(1, 5, 'Basketball', 90, 500, NULL, 'Pickup game with friends', '2024-01-21');
