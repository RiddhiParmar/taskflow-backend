# Taskflow Backend

Taskflow Backend is a NestJS + MongoDB REST API for user authentication, role-based access, and task management.

## Features
- User registration and login with JWT (RS256)
- Role-based access control (`user`, `admin`)
- Task CRUD operations with pagination, filtering, and sorting
- Aggregation-based task listing with assignee/creator display names
- Password reset and forgot-password flows
- Swagger docs for local/development environments
- Centralized validation, exception handling, and structured logging

## Tech Stack
- NestJS
- MongoDB + Mongoose
- JWT (`@nestjs/jwt`)
- class-validator + class-transformer
- nestjs-pino
- Resend (email service)
- Swagger (`@nestjs/swagger`)

## Project Setup
```bash
# clone repository
git clone git@github.com:RiddhiParmar/taskflow-backend.git
cd taskflow-backend

# install dependencies
npm install
```

## Environment Variables
Create `.env` from the example file:

```bash
cp example.env .env
```

Required variables:

```env
PORT=8080
HOST=0.0.0.0
NODE_ENV=development

DATABASE_URL=mongodb://localhost:27017/taskflow

# RSA keys must be base64-encoded strings
PRIVATE_KEY=<base64-encoded-private-key>
PUBLIC_KEY=<base64-encoded-public-key>

RESEND_KEY=<resend-api-key>
MAIL_SENDER_NO_REPLY=onboarding@resend.dev

# optional
FRONTEND_BASEURL=http://localhost:4500
```

## Run the Project
```bash
# dev
npm run start:dev

# production build
npm run build
npm run start:prod
```

## Scripts
- `npm run build` - build Nest app
- `npm run start` - start app
- `npm run start:dev` - start in watch mode
- `npm run start:prod` - run built app
- `npm run lint` - lint and auto-fix
- `npm run test` - run unit tests

## API Docs
Swagger is enabled only when `NODE_ENV` is `local` or `development`.

- Swagger URL: `/api/docs`

## Authentication Model
This project uses authentication middleware (Bearer token in `Authorization` header), not route-level JWT guards.

Public endpoints:
- `POST /user/auth`
- `POST /user/auth/login`
- `POST /user/auth/forget-password-token`
- `POST /user/forget-reset-password`

All `Task` routes require authentication.
Most `User` routes require authentication except the public ones listed above.

## Base Routes
- Auth: `/user/auth`
- User: `/user`
- Task: `/task`

## API Endpoints

### Auth (`/user/auth`)
- `POST /user/auth` - register user
- `POST /user/auth/login` - login user
- `POST /user/auth/forget-password-token` - request forgot-password token

### User (`/user`)
- `PATCH /user` - update user profile (auth)
- `POST /user/logout` - logout (auth)
- `POST /user/reset-password` - reset password using old password (auth)
- `GET /user` - get current user profile (auth)
- `GET /user/all` - get all users (admin only)
- `POST /user/forget-reset-password` - reset password using token in `PasswordResetToken` header

### Task (`/task`)
- `POST /task` - create task (auth)
- `PATCH /task/:taskId` - update task status (auth)
- `GET /task` - paginated task list (auth)
- `DELETE /task/:taskId` - soft delete/archive task (auth)
- `PATCH /task/:id/reassign` - reassign task (admin only)

## Task Pagination API
`GET /task`

Query params:
- `page` (number, default: `1`)
- `limit` (number, default: `10`)
- `status` (`todo | in-progress | completed`)
- `priority` (`low | medium | high`)
- `assignedTo` (Mongo ObjectId, admin filter)
- `sortBy` (`priority | dueDate`)
- `sortOrder` (`asc | desc`)

Response shape:
```json
{
  "data": [
    {
      "_id": "67f36fb4ff2f2cbf9dca0001",
      "title": "Prepare weekly report",
      "description": "Collect progress from all teams",
      "status": "todo",
      "priority": "high",
      "assignedTo": "67f36f18ff2f2cbf9dca0002",
      "dueDate": "2026-04-15T00:00:00.000Z",
      "createdBy": "67f36f18ff2f2cbf9dca0003",
      "isArchived": false,
      "createdAt": "2026-04-07T08:13:40.251Z",
      "updatedAt": "2026-04-07T08:13:40.251Z",
      "assignedToUser": {
        "name": "Riddhi Parmar"
      },
      "createdByUser": {
        "name": "Admin User"
      }
    }
  ],
  "total": 24,
  "page": 1,
  "limit": 10,
  "totalPages": 3
}
```

## Notes
- Tasks are soft-deleted by setting `isArchived: true`.
- JWT tokens are stored in user `tokens` array for session tracking.
- Request ID is generated per request and returned via `x-request-id` header.
