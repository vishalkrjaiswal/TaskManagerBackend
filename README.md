# Task Manager

A clean, modular REST API for a Team Task Manager built with **Node.js**, **Express**, and **MongoDB**.  
---

## Folder Structure

```
collabzz-task-manager/
├── src/
│   ├── config/
│   │   └── db.js                  # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js     # Register, Login, GetMe logic
│   │   └── taskController.js     # Full CRUD task logic
│   ├── middlewares/
│   │   ├── authMiddleware.js     # JWT protect + role-based restrictTo
│   │   └── validateMiddleware.js # express-validator rules
│   ├── models/
│   │   ├── userModel.js          # User schema (bcrypt hashing)
│   │   └── taskModel.js          # Task schema (status enum + indexes)
│   ├── routes/
│   │   ├── authRoutesjs         # /auth/* routes
│   │   └── taskRoutes.js         # /tasks/* routes
│   ├── utils/
│   │   ├── jwt.js           # Token generation helper
│   │   └── response.js      # Standardised JSON responses
│   ├── app.js                     # Express app setup + middleware
│   └── server.js                  # Entry point — DB connect + listen
├── postman/
│   └── postman_collection.json
├── .env.example
├── .gitignore
├── package.json
```

---

## Prerequisites

- [Node.js](https://nodejs.org/) v18 or above
- [MongoDB](https://www.mongodb.com/) running locally **or** a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster
- [Postman](https://www.postman.com/) (for testing)

---

## 🛠️ Setup & Run Locally

### 1. Clone the repository

```bash
git clone https://github.com/<your-username>/task-manager.git
cd task-manager
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

```bash
cp .env.example .env
```

Open `.env` and fill in your values:

```env
PORT=
MONGO_URI=
JWT_SECRET=
JWT_EXPIRES_IN=
```

> **MongoDB Atlas?** Replace `MONGO_URI` with your Atlas connection string:  
> `mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/collabzz_tasks`

### 4. Start the server

```bash
# Development (auto-restarts on file changes)
npm run dev


You should see:
```
MongoDB Connected: localhost
Server running on port 5000
```

---

## 🔑 Authentication

All task routes require a valid **JWT Bearer token**.

After registering or logging in, copy the `token` from the response and include it in the `Authorization` header of every request:

```
Authorization: Bearer <your_token_here>
```

---

## 📡 API Reference

### Base URL
```
http://localhost:5000
```

---

### Auth Routes

#### `POST /auth/register` — Register a new user

**Request Body:**
```json
{
  "name": "Vishal Jaiswal",
  "email": "vishal@example.com",
  "password": "password123",
  "role": "user"         // optional — "user" (default) or "admin"
}
```

**Response `201`:**
```json
{
  "success": true,
  "message": "Account created successfully.",
  "data": {
    "token": "eyJhbGci...",
    "user": { "id": "...", "name": "Vishal Jaiswal", "email": "vishal@example.com", "role": "user" }
  }
}
```

---

#### `POST /auth/login` — Login and get a token

**Request Body:**
```json
{
  "email": "vishal@example.com",
  "password": "password123"
}
```

**Response `200`:**
```json
{
  "success": true,
  "message": "Logged in successfully.",
  "data": {
    "token": "eyJhbGci...",
    "user": { "id": "...", "name": "John Doe", "email": "john@example.com", "role": "user" }
  }
}
```

---

#### `GET /auth/me` — Get logged-in user's profile 🔒

**Headers:** `Authorization: Bearer <token>`

**Response `200`:**
```json
{
  "success": true,
  "message": "User profile fetched.",
  "data": {
    "user": { "id": "...", "name": "Vishal Jaiswal", "email": "vishal@example.com", "role": "user", "createdAt": "..." }
  }
}
```

---

### ✅ Task Routes (All Protected 🔒)

#### `POST /tasks` — Create a new task

**Request Body:**
```json
{
  "title": "Backend",
  "description": "solve error.",
  "status": "todo",
  "assignedTo": "<userId or null>"
}
```

**Response `201`:**
```json
{
  "success": true,
  "message": "Task created successfully.",
  "data": {
    "task": {
      "_id": "...",
      "title": "Backend",
      "description": "solve error.",
      "status": "todo",
      "assignedTo": null,
      "createdBy": { "_id": "...", "name": "Vishal Jaiswal", "email": "vishal@example.com" },
      "createdAt": "...",
      "updatedAt": "..."
    }
  }
}
```

---

#### `GET /tasks` — Get all tasks

Supports optional query parameters:

| Param    | Type   | Description                              |
|----------|--------|------------------------------------------|
| `status` | string | Filter: `todo`, `in-progress`, `done`    |
| `search` | string | Search tasks by title (case-insensitive) |
| `page`   | number | Page number (default: `1`)               |
| `limit`  | number | Results per page (default: `10`, max: `50`) |

**Example:**
```
GET /tasks?status=in-progress&search=login&page=1&limit=5
```

**Response `200`:**
```json
{
  "success": true,
  "message": "Tasks fetched successfully.",
  "data": {
    "tasks": [ { "...": "..." } ],
    "pagination": {
      "total": 25,
      "page": 1,
      "limit": 5,
      "totalPages": 5,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

> **Admin note:** Admins see all tasks across all users. Regular users only see their own.

---

#### `GET /tasks/:id` — Get a single task by ID

**Response `200`:**
```json
{
  "success": true,
  "message": "Task fetched successfully.",
  "data": { "task": { "...": "..." } }
}
```

---

#### `PUT /tasks/:id` — Update a task *(creator or admin only)*

**Request Body** (all fields optional):
```json
{
  "title": "Updated title",
  "description": "Updated description",
  "status": "done"
}
```

**Response `200`:**
```json
{
  "success": true,
  "message": "Task updated successfully.",
  "data": { "task": { "...": "..." } }
}
```

---

#### `DELETE /tasks/:id` — Delete a task *(creator or admin only)*

**Response `200`:**
```json
{
  "success": true,
  "message": "Task deleted successfully."
}
```

---

## Error Responses

All errors follow this format:
```json
{
  "success": false,
  "message": "Human-readable error message here."
}
```

| Status | Meaning                            |
|--------|------------------------------------|
| `400`  | Bad request / Validation error     |
| `401`  | Unauthorised (missing/invalid JWT) |
| `403`  | Forbidden (not your resource)      |
| `404`  | Resource not found                 |
| `409`  | Conflict (e.g., email already used)|
| `500`  | Internal server error              |

---

## Testing with Postman

1. Import the collection: `postman/postman_collection.json`
2. Set the `BASE_URL` variable to `http://localhost:5000`
3. Run **Register** or **Login** first — the Login request auto-saves the token to `{{TOKEN}}`
4. All other requests use `{{TOKEN}}` automatically

---

## ✨ Features Implemented

- [x] User registration & login with **bcrypt** password hashing
- [x] **JWT authentication** — all task routes are protected
- [x] Full **CRUD** for tasks
- [x] Task ownership — only creator can update/delete
- [x] **Role-based access** — `admin` can manage all tasks
- [x] Status validation (`todo`, `in-progress`, `done`)
- [x] **Pagination** on `GET /tasks`
- [x] **Search** tasks by title (`?search=keyword`)
- [x] **Filter** by status (`?status=todo`)
- [x] Centralised error handling & standardised JSON responses
- [x] Input validation via `express-validator`
- [x] Clean modular folder structure

---

## Deployment (Optional)

### Deploy to Render

1. Push your code to GitHub
2. Go to [render.com](https://render.com) → New → Web Service
3. Connect your GitHub repo
4. Set Build Command: `npm install`
5. Set Start Command: `npm start`
6. Add environment variables (`MONGO_URI`, `JWT_SECRET`, etc.) in the dashboard
