# Card Clash

Card Clash is a multiplayer classroom quiz platform inspired by Kahoot. Teachers can create and host live quiz sessions while students join using a session code and answer questions in real time. The system tracks performance, updates leaderboards live, and generates AI-based summaries of class performance after each session.

---

# Local Database Setup

(I suggest installing pgadmin and handling the database from there rather than command line)

1. Install PostgreSQL (Make sure to add to PATH)
2. createdb card_clash
3. psql -U postgres -d card_clash -f backend/config/schema.sql
   ^  
    username

# To run application

1. Open two terminal windows
2. In one terminal, cd /frontend
3. In the second terminal, cd /backend
4. In both terminals, npm run dev
5. enter "http://localhost:3000/" in your browser

---

# MVP Scope

## Core User Flow

1. User registers (student or teacher)
2. User logs in
3. Teacher creates questions
4. Teacher creates a game session
5. Students join using join code
6. Teacher starts the game
7. Questions appear one at a time
8. Questions are timed (ex: 30 seconds)
9. Timer expiration automatically advances to answer screen
10. Teacher may manually advance questions
11. Students submit answers
12. Scores update live
13. Game ends
14. Teacher views dashboard statistics
15. AI summary is generated

---

# Finalized Tech Stack

## Frontend

- Next.js
- TailwindCSS
- Socket.io-client
- Chart.js

## Backend

- Node.js
- Express
- PostgreSQL
- Socket.io
- JWT Authentication

## AI Integration

- OpenAI

## Testing Framework

- Jest

---

# Roles & Permissions

## Teacher Capabilities

- Create questions
- Create game sessions
- Start and end games
- View dashboard statistics
- Generate AI summaries

## Student Capabilities

- Join game sessions
- Submit answers
- View leaderboard

---

# Database Model (Rough Draft)

## Users

- id (PK)
- name
- email (unique)
- password_hash
- role (student | teacher)
- created_at

## Games

- id (PK)
- host_id (FK → Users)
- join_code (unique)
- status (lobby | in_progress | finished)
- created_at
- ended_at

Status definitions:

- Lobby: players are joining
- In_progress: active gameplay
- Finished: game completed

## Questions

- id (PK)
- teacher_id (FK → Users)
- question_text
- option_a
- option_b
- option_c
- option_d
- correct_option
- created_at

## Game_Questions

- id (PK)
- game_id (FK)
- question_id (FK)
- order_index

## Game_Players

- id (PK)
- game_id (FK)
- user_id (FK)
- score
- joined_at

## Answers

- id (PK)
- game_id (FK)
- question_id (FK)
- user_id (FK)
- selected_option
- is_correct
- response_time_ms
- answered_at

## AI_Summaries

- id (PK)
- game_id (FK)
- summary_text
- generated_at

---

# Application Routes

## Public Routes

/login

/register

Note: The root page (/) will present login and register options that redirect to the appropriate forms.

Register form fields:

- Name
- Email
- Password
- Role

## Authenticated Routes

/dashboard

/profile

## Teacher Only

/create-game
Note: This route is now implemented as a button

/lobby/[sessionid] (host view)

/game/[sessionid] (host view)

/questions

/questions/create

## Student Only

/join-game
Note: This route is now implemented as a button

/lobby/[sessionid] (player view)

/game/[sessionid] (player view)

---

# Backend API Routes

## Authentication

POST /api/auth/register

POST /api/auth/login

## Questions

POST /api/questions

GET /api/questions

## Games

POST /api/games/create

POST /api/games/join

GET /api/games/:id/stats

---

# Definition of Done (MVP Complete)

A teacher can:

- Register
- Create questions
- Create a game
- Start a game
- See leaderboard update live
- View dashboard stats
- Generate AI summary

A student can:

- Register
- Join game via code
- Submit answers
- See live leaderboard

---

# Lightweight Testing Checklist

## Testing Strategy Overview

Testing includes:

Backend unit and integration tests using Jest

Frontend component tests using Jest

Manual end-to-end demo testing before submission

Testing focus areas:

- Authentication
- Game creation
- Score logic
- Stats calculation
- Core UI rendering

Full E2E coverage is not targeted. Testing focuses on protecting core features.

---

# Backend Testing Checklist

## Authentication

- Register returns 201 and token
- Login returns 200 and token
- Login fails with wrong password
- Protected route fails without token
- Teacher-only route blocks student

## Questions

- Teacher can create question
- Student cannot create question
- Fetch questions returns correct data

## Game Creation

- Creating game returns join code
- Join game adds player to database
- Joining invalid code fails

## Score Logic (Unit Tests)

- Correct answer increases score
- Incorrect answer does not increase score
- Score calculation function works independently

## Stats Endpoint

- Returns accuracy percentage
- Returns player scores
- Returns empty array if no answers

## AI Summary

- Endpoint returns summary text
- Summary saved to database

---

# Frontend Testing Checklist

## Auth Pages

- Login form renders
- Register form renders

## Game UI

- QuestionCard renders question text
- AnswerOptions renders 4 options
- Leaderboard renders player list

## Dashboard

- Chart component renders
- AI summary section renders text

---

# Functional Requirements

FR-1. The system shall allow a host to create and manage a multiplayer game session.

FR-2. The system shall allow players to join a game session using a unique session identifier.

FR-3. The system shall present course-related questions to players during gameplay.

FR-4. The system shall collect and validate player responses in real time.

FR-5. The system shall calculate and update player scores based on correctness and response timing.

FR-6. The system shall store player performance data persistently.

FR-7. The system shall generate AI-based summaries of individual and class performance after each session.

FR-8. The system shall provide instructors with access to performance dashboards and analytics.

All functional requirements are testable via gameplay scenarios and data verification.

---

# Non-functional Requirements

NFR-1 Performance: The system shall support at least 8 concurrent players per session with response latency under 200ms.

NFR-2 Usability: The interface shall be intuitive and usable by first-time users without training.

NFR-3 Reliability: The system shall preserve game state and player data during temporary client disconnections.

NFR-4 Scalability: The architecture shall allow additional sessions without major redesign.

NFR-5 Security: Player data shall be securely stored and accessible only to authorized users.

NFR-6 Maintainability: The system shall use modular components and clear interfaces to support future enhancements.

---

# Weekly Development Timeline

Tests will be added along the way.

## Week 1

Backend:

- Setup PostgreSQL database and create tables
- Implement register and login endpoints with JWT

Frontend:

- Create Login and Register pages

## Week 2

Backend:

- Implement question CRUD endpoints
- Implement game creation endpoint (returns join code)

Frontend:

- Build question list page
- Build question creation form
- Build game creation page

## Week 3

Backend:

- Implement join game endpoint
- Setup Socket.IO server and rooms

Frontend:

- Build join game form
- Build lobby page showing joined players

## Week 4

Backend:

- Implement submit answer socket event
- Add basic score tracking logic

Frontend:

- Build answer selection UI
- Build leaderboard component

## Week 5

Backend:

- Save answers to database
- Implement stats endpoint

Frontend:

- Display charts using Chart.js
- Build teacher dashboard

## Week 6

Backend:

- Integrate AI summary endpoint using OpenAI API
- Save summaries to database

Frontend:

- Display AI summary section on dashboard

## Week 7

Team:

- Bug fixes
- Full integration testing
- UI polish
- Error handling

## Week 8

Team:

- Write documentation
- Create architectural diagrams
- Final presentation and demo

---

# Future Improvements

Potential improvements beyond MVP:

- Advanced analytics dashboards
- Question categories and tagging
- Class management tools
- Improved anti-cheating mechanisms
- Real-time feedback insights
- Expanded AI tutoring recommendations

---

# Project Goal

The goal of Card Clash is to create an engaging, real-time learning environment that helps teachers quickly identify student knowledge gaps while keeping students actively engaged through competitive gameplay and immediate feedback.
