# Full-Stack Fitness Website (Postgres + Node.js)

A full-stack fitness web application built with Node.js, Express, PostgreSQL, and a modern front-end. This repository contains the codebase for running a fitness tracking and workout planning web app with user authentication, workout/session tracking, and progress visualization.

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](#)
[![License](https://img.shields.io/badge/license-MIT-blue)](#)

## Table of Contents

- [About](#about)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Screenshots](#screenshots)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Install](#install)
  - [Environment variables](#environment-variables)
  - [Database setup](#database-setup)
  - [Run (development)](#run-development)
  - [Build (production)](#build-production)
- [API](#api)
- [Data model / Migrations](#data-model--migrations)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

---

## About

This project is a fitness web application that helps users track workouts, plan routines, log progress, and visualize improvements over time. The backend uses Node.js and PostgreSQL for reliable data storage; the frontend can be built with React, Vue, or another framework (adjust folder names and scripts to match your repo layout).

---

## Links
The live URL is as follows 
https://goldysfytness.netlify.app/

---

## Features

- User authentication (register / login)
- Create, edit, and delete workouts and exercises
- Log workout sessions and track progress
- Progress charts and stats
- Save custom workout plans
- Admin routes for managing data (optional)

---

## Tech Stack

- Backend: Node.js, Express
- Database: PostgreSQL (pg, knex/TypeORM/Sequelize — adjust to your ORM)
- Frontend: React (or your chosen framework) + Vite / Create React App
- Authentication: JWT (or session-based)
- Styling: Tailwind CSS / CSS Modules

---

## Screenshots
### Landing / Home page

<img width="2560" height="3944" alt="goldysfytness netlify app_(Nest Hub Max)" src="https://github.com/user-attachments/assets/cb43362f-4e36-46e1-91ae-63484f15587d" />

### Dashboard / Progress

<img width="2560" height="1600" alt="goldysfytness netlify app_MealPlanner(Nest Hub Max)" src="https://github.com/user-attachments/assets/07705aae-ce54-4641-a2b4-adcad5712f0e" />


### Workout Editor

<img width="2560" height="1600" alt="goldysfytness netlify app_MealPlanner(Nest Hub Max) (1)" src="https://github.com/user-attachments/assets/3767ac7f-9318-4770-b621-55925b991d63" />


## Getting Started

### Prerequisites

- Node.js >= 16
- npm or yarn
- PostgreSQL instance (local or remote)
- Optional: Docker & Docker Compose for local DB and services

### Install

Clone the repository:

```bash
git clone https://github.com/Abdullah929-design/POSTGRES-SQL-NODEJS-FULL-STACK-FITNESS-WEBSTIE.git
cd POSTGRES-SQL-NODEJS-FULL-STACK-FITNESS-WEBSTIE
```

Install dependencies (adjust if client/server are separate):

```bash
npm install
# or, if repo has client and server directories:
# cd server && npm install
# cd ../client && npm install
```

### Environment variables

Create a `.env` file in the server directory (or repo root if unified). Example `.env.example`:

```
PORT=4000
DATABASE_URL=postgresql://user:password@localhost:5432/fitness_db
JWT_SECRET=your_jwt_secret
NODE_ENV=development
```

Keep secrets out of version control.

### Database setup

If using plain SQL or migrations (knex/TypeORM/Sequelize), run the migration and seed commands. Example using knex:

```bash
# create the database (or via pgAdmin/psql)
createdb fitness_db

# run migrations
npm run migrate

# run seeds (optional)
npm run seed
```

If using Docker, start Postgres with docker-compose:

```bash
docker-compose up -d
# then run migrations/seeds
npm run migrate
```

### Run (development)

```bash
# from project root (or server folder)
npm run dev
```

Open the frontend at the port shown by your front-end dev server (commonly http://localhost:3000 or http://localhost:5173) and API at http://localhost:4000.

### Build (production)

```bash
# build frontend
cd client && npm run build
# start the backend server in production mode
cd ../server && npm start
```

---

## API

Example endpoints (adjust to your implementation):

- POST /api/auth/register — Register a new user
- POST /api/auth/login — Login and receive JWT
- GET /api/users/me — Get current user
- GET /api/workouts — List workouts
- POST /api/workouts — Create a workout
- GET /api/workouts/:id — Get a workout
- PUT /api/workouts/:id — Update a workout
- DELETE /api/workouts/:id — Delete a workout
- POST /api/sessions — Log a workout session
- GET /api/sessions — List workout sessions

Include OpenAPI/Swagger or Postman collection for full API docs if available.

---

## Data model / Migrations

Typical tables you'll find or create:

- users
- workouts
- exercises
- workout_exercises (join table)
- sessions
- session_entries (exercise sets/reps/weights)

Provide your migration files in a migrations/ folder and seeds in seeds/.

---

## Usage

- Register a user
- Create a workout template (list of exercises)
- Start a session and log sets/reps/weights
- View progress on dashboard charts
- Export or share workout plans

---

## Contributing

Contributions are welcome. Please follow these steps:

1. Fork the repository
2. Create a feature branch (git checkout -b feature/your-feature)
3. Commit your changes (git commit -m "feat: ...")
4. Push to your branch (git push origin feature/your-feature)
5. Open a Pull Request describing your changes

Run tests and linters before opening a PR.

---

## License

This project is licensed under the MIT License. See the LICENSE file for details.

---

## Contact

Project maintainer: Abdullah929-design

Open an issue or contact via the GitHub profile for questions or feature requests.

