-- =========================================
-- Card Clash Database Schema
-- =========================================

-- Drop tables (reverse dependency order)
DROP TABLE IF EXISTS ai_summaries CASCADE;
DROP TABLE IF EXISTS answers CASCADE;
DROP TABLE IF EXISTS game_questions CASCADE;
DROP TABLE IF EXISTS game_players CASCADE;
DROP TABLE IF EXISTS questions CASCADE;
DROP TABLE IF EXISTS games CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop ENUM types if they exist
DROP TYPE IF EXISTS game_status CASCADE;
DROP TYPE IF EXISTS answer_option CASCADE;

-- =========================================
-- ENUM TYPES
-- =========================================

CREATE TYPE game_status AS ENUM (
    'lobby',
    'in_progress',
    'finished'
);

CREATE TYPE answer_option AS ENUM (
    'A',
    'B',
    'C',
    'D'
);

-- =========================================
-- USERS
-- =========================================

CREATE TABLE users (
    id SERIAL PRIMARY KEY,

    name VARCHAR(100) NOT NULL,

    email VARCHAR(255) UNIQUE NOT NULL,

    password_hash TEXT NOT NULL,

    role VARCHAR(10) NOT NULL CHECK (role IN ('student', 'teacher')),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================================
-- GAMES
-- =========================================

CREATE TABLE games (
    id SERIAL PRIMARY KEY,

    host_id INTEGER NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

    join_code VARCHAR(12) UNIQUE NOT NULL,

    status game_status NOT NULL DEFAULT 'lobby',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    ended_at TIMESTAMP,

    CONSTRAINT ended_time_check
        CHECK (
            status <> 'finished'
            OR ended_at IS NOT NULL
        )
);

CREATE INDEX idx_games_join_code
ON games(join_code);

-- =========================================
-- QUESTIONS
-- =========================================

CREATE TABLE questions (
    id SERIAL PRIMARY KEY,

    teacher_id INTEGER NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

    question_text TEXT NOT NULL,

    option_a TEXT NOT NULL,
    option_b TEXT NOT NULL,
    option_c TEXT NOT NULL,
    option_d TEXT NOT NULL,

    correct_option answer_option NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_questions_teacher
ON questions(teacher_id);

-- =========================================
-- GAME_PLAYERS (Many-to-Many Users ↔ Games)
-- =========================================

CREATE TABLE game_players (
    id SERIAL PRIMARY KEY,

    game_id INTEGER NOT NULL
        REFERENCES games(id)
        ON DELETE CASCADE,

    user_id INTEGER NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

    score INTEGER NOT NULL DEFAULT 0,

    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT unique_game_user
        UNIQUE (game_id, user_id),

    CONSTRAINT score_non_negative
        CHECK (score >= 0)
);

CREATE INDEX idx_game_players_lookup
ON game_players(game_id);

-- =========================================
-- GAME_QUESTIONS (Ordered Question Assignment)
-- =========================================

CREATE TABLE game_questions (
    id SERIAL PRIMARY KEY,

    game_id INTEGER NOT NULL
        REFERENCES games(id)
        ON DELETE CASCADE,

    question_id INTEGER NOT NULL
        REFERENCES questions(id)
        ON DELETE CASCADE,

    order_index INTEGER NOT NULL,

    CONSTRAINT unique_game_question
        UNIQUE (game_id, question_id),

    CONSTRAINT unique_game_order
        UNIQUE (game_id, order_index),

    CONSTRAINT order_non_negative
        CHECK (order_index >= 0)
);

CREATE INDEX idx_game_questions_lookup
ON game_questions(game_id, order_index);

-- =========================================
-- ANSWERS
-- =========================================

CREATE TABLE answers (
    id SERIAL PRIMARY KEY,

    game_id INTEGER NOT NULL
        REFERENCES games(id)
        ON DELETE CASCADE,

    question_id INTEGER NOT NULL
        REFERENCES questions(id)
        ON DELETE CASCADE,

    user_id INTEGER NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

    selected_option answer_option NOT NULL,

    is_correct BOOLEAN NOT NULL,

    response_time_ms INTEGER NOT NULL,

    answered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT unique_player_answer
        UNIQUE (game_id, question_id, user_id),

    CONSTRAINT response_time_valid
        CHECK (response_time_ms >= 0),

    CONSTRAINT fk_player_in_game
        FOREIGN KEY (game_id, user_id)
        REFERENCES game_players(game_id, user_id)
        ON DELETE CASCADE
);

CREATE INDEX idx_answers_game_user
ON answers(game_id, user_id);

CREATE INDEX idx_answers_question
ON answers(question_id);

-- =========================================
-- AI_SUMMARIES
-- =========================================

CREATE TABLE ai_summaries (
    id SERIAL PRIMARY KEY,

    game_id INTEGER NOT NULL
        REFERENCES games(id)
        ON DELETE CASCADE,

    summary_text TEXT NOT NULL,

    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT unique_summary_per_game
        UNIQUE (game_id)
);

CREATE INDEX idx_ai_summary_game
ON ai_summaries(game_id);

-- =========================================
-- END OF SCHEMA
-- =========================================