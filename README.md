# Placement & Job Management Platform

A full-stack MERN application for managing campus placements across three roles: Student, Recruiter, and Admin.

## Features
- JWT authentication with bcrypt password hashing and role-based access control
- Student profile management and eligibility details
- Recruiter job creation, editing, applicant review, status updates, and interview scheduling
- Job search, filtering, sorting, and pagination
- Student applications with duplicate-application protection and status tracking
- Interview scheduling and interview listing
- Admin overview and user/job management endpoints
- Responsive React dashboard

## Tech stack
- MongoDB + Mongoose
- Express.js + Node.js
- React + Vite
- React Router, Axios, Lucide React

## Requirements
Node.js 20+ and MongoDB (local or MongoDB Atlas).

## Setup

### 1. Backend
```bash
cd server
cp .env.example .env
npm install
npm run dev
```
Set `MONGO_URI` and a long random `JWT_SECRET` in `server/.env`.

### 2. Frontend
Open a second terminal:
```bash
cd client
cp .env.example .env
npm install
npm run dev
```
Open the Vite URL shown in the terminal (normally http://localhost:5173).

## Create the first admin
Register a normal account through the UI. Then, from the `server` directory, run:
```bash
npm run make-admin -- your-email@example.com
```
This promotes that existing account to Admin. Do not expose this command or admin credentials publicly.

## Demo workflow
1. Register a Student account and complete the profile.
2. Register a second account and promote it to Recruiter using MongoDB Compass or the admin endpoint after an Admin exists (or update the role in the database for local demo).
3. As Recruiter, create a job.
4. As Student, browse jobs and apply.
5. As Recruiter, open applicants and update application status / schedule an interview.
6. As Admin, view the platform overview.

## API overview
All routes are prefixed with `/api`.
- `POST /auth/register`, `POST /auth/login`, `GET /auth/me`
- `GET /jobs`, `GET /jobs/:id`, `POST /jobs`, `PUT /jobs/:id`, `DELETE /jobs/:id`
- `GET /applications/mine`, `POST /applications/:jobId`, `GET /applications/job/:jobId`, `PATCH /applications/:id/status`
- `GET /users/profile`, `PUT /users/profile`, `GET /users` (Admin)
- `POST /interviews`, `GET /interviews/mine`
- `GET /dashboard/summary`

## Security notes
- Never commit `.env` files, database credentials, JWT secrets, or real student data.
- The included `.env.example` files contain placeholders only.
- This is a portfolio-ready starter, not a production-certified placement system. Before production use, add email verification, password reset, rate limiting, audit logs, stronger file-upload controls, tests, backups, and deployment-specific security review.
