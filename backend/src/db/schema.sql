-- =========================================================
-- FitOS Database Schema
-- PostgreSQL
-- =========================================================


-- =========================================================
-- USERS
-- =========================================================

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,

    name VARCHAR(100) NOT NULL,

    email VARCHAR(255) NOT NULL UNIQUE,

    password_hash TEXT NOT NULL,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);


-- =========================================================
-- FITNESS PROFILES
-- =========================================================

CREATE TABLE IF NOT EXISTS fitness_profiles (
    id SERIAL PRIMARY KEY,

    user_id INTEGER NOT NULL UNIQUE,

    height_cm DECIMAL(5,2),

    weight_kg DECIMAL(5,2),

    age INTEGER,

    gender VARCHAR(20),

    activity_level VARCHAR(30),

    daily_calorie_target INTEGER DEFAULT 2400,

    daily_protein_target DECIMAL(6,2) DEFAULT 160,

    daily_step_target INTEGER DEFAULT 10000,

    daily_sleep_target DECIMAL(4,2) DEFAULT 8,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_fitness_profile_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT check_height
        CHECK (height_cm IS NULL OR height_cm > 0),

    CONSTRAINT check_weight
        CHECK (weight_kg IS NULL OR weight_kg > 0),

    CONSTRAINT check_age
        CHECK (age IS NULL OR age >= 13),

    CONSTRAINT check_calorie_target
        CHECK (daily_calorie_target > 0),

    CONSTRAINT check_protein_target
        CHECK (daily_protein_target > 0),

    CONSTRAINT check_step_target
        CHECK (daily_step_target > 0),

    CONSTRAINT check_sleep_target
        CHECK (daily_sleep_target > 0)
);


-- =========================================================
-- DAILY METRICS
-- =========================================================

CREATE TABLE IF NOT EXISTS daily_metrics (
    id SERIAL PRIMARY KEY,

    user_id INTEGER NOT NULL,

    metric_date DATE NOT NULL,

    calories INTEGER DEFAULT 0,

    protein DECIMAL(6,2) DEFAULT 0,

    carbs DECIMAL(6,2) DEFAULT 0,

    fats DECIMAL(6,2) DEFAULT 0,

    steps INTEGER DEFAULT 0,

    sleep_hours DECIMAL(4,2) DEFAULT 0,

    calories_burned INTEGER DEFAULT 0,

    active_minutes INTEGER DEFAULT 0,

    distance_km DECIMAL(6,2) DEFAULT 0,

    fitness_score DECIMAL(5,2) DEFAULT 0,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_daily_metrics_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT unique_user_metric_date
        UNIQUE (user_id, metric_date),

    CONSTRAINT check_calories
        CHECK (calories >= 0),

    CONSTRAINT check_protein
        CHECK (protein >= 0),

    CONSTRAINT check_carbs
        CHECK (carbs >= 0),

    CONSTRAINT check_fats
        CHECK (fats >= 0),

    CONSTRAINT check_steps
        CHECK (steps >= 0),

    CONSTRAINT check_sleep
        CHECK (sleep_hours >= 0),

    CONSTRAINT check_calories_burned
        CHECK (calories_burned >= 0),

    CONSTRAINT check_active_minutes
        CHECK (active_minutes >= 0),

    CONSTRAINT check_distance
        CHECK (distance_km >= 0),

    CONSTRAINT check_fitness_score
        CHECK (fitness_score >= 0 AND fitness_score <= 100)
);


-- =========================================================
-- MEALS
-- =========================================================

CREATE TABLE IF NOT EXISTS meals (
    id SERIAL PRIMARY KEY,

    user_id INTEGER NOT NULL,

    meal_name VARCHAR(150) NOT NULL,

    meal_type VARCHAR(30) NOT NULL,

    calories INTEGER DEFAULT 0,

    protein DECIMAL(6,2) DEFAULT 0,

    carbs DECIMAL(6,2) DEFAULT 0,

    fats DECIMAL(6,2) DEFAULT 0,

    meal_date DATE NOT NULL DEFAULT CURRENT_DATE,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_meal_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT check_meal_calories
        CHECK (calories >= 0),

    CONSTRAINT check_meal_protein
        CHECK (protein >= 0),

    CONSTRAINT check_meal_carbs
        CHECK (carbs >= 0),

    CONSTRAINT check_meal_fats
        CHECK (fats >= 0)
);


-- =========================================================
-- WORKOUTS
-- =========================================================

CREATE TABLE IF NOT EXISTS workouts (
    id SERIAL PRIMARY KEY,

    user_id INTEGER NOT NULL,

    workout_name VARCHAR(150) NOT NULL,

    workout_type VARCHAR(50),

    duration_minutes INTEGER DEFAULT 0,

    calories_burned INTEGER DEFAULT 0,

    workout_date DATE NOT NULL DEFAULT CURRENT_DATE,

    notes TEXT,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_workout_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT check_workout_duration
        CHECK (duration_minutes >= 0),

    CONSTRAINT check_workout_calories
        CHECK (calories_burned >= 0)
);


-- =========================================================
-- WORKOUT EXERCISES
-- =========================================================

CREATE TABLE IF NOT EXISTS workout_exercises (
    id SERIAL PRIMARY KEY,

    workout_id INTEGER NOT NULL,

    exercise_name VARCHAR(150) NOT NULL,

    sets INTEGER DEFAULT 0,

    reps INTEGER DEFAULT 0,

    weight_kg DECIMAL(6,2) DEFAULT 0,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_exercise_workout
        FOREIGN KEY (workout_id)
        REFERENCES workouts(id)
        ON DELETE CASCADE,

    CONSTRAINT check_sets
        CHECK (sets >= 0),

    CONSTRAINT check_reps
        CHECK (reps >= 0),

    CONSTRAINT check_weight
        CHECK (weight_kg >= 0)
);


-- =========================================================
-- PROGRESS
-- =========================================================

CREATE TABLE IF NOT EXISTS progress (
    id SERIAL PRIMARY KEY,

    user_id INTEGER NOT NULL,

    progress_date DATE NOT NULL,

    weight_kg DECIMAL(5,2),

    body_fat_percentage DECIMAL(5,2),

    chest_cm DECIMAL(6,2),

    waist_cm DECIMAL(6,2),

    arms_cm DECIMAL(6,2),

    thighs_cm DECIMAL(6,2),

    notes TEXT,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_progress_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT check_progress_weight
        CHECK (weight_kg IS NULL OR weight_kg > 0),

    CONSTRAINT check_body_fat
        CHECK (
            body_fat_percentage IS NULL
            OR (
                body_fat_percentage >= 0
                AND body_fat_percentage <= 100
            )
        )
);


-- =========================================================
-- INDEXES
-- =========================================================

CREATE INDEX IF NOT EXISTS idx_daily_metrics_user_date
ON daily_metrics(user_id, metric_date);

CREATE INDEX IF NOT EXISTS idx_meals_user_date
ON meals(user_id, meal_date);

CREATE INDEX IF NOT EXISTS idx_workouts_user_date
ON workouts(user_id, workout_date);

CREATE INDEX IF NOT EXISTS idx_progress_user_date
ON progress(user_id, progress_date);

CREATE INDEX IF NOT EXISTS idx_workout_exercises_workout
ON workout_exercises(workout_id);


-- =========================================================
-- COMPLETE
-- =========================================================