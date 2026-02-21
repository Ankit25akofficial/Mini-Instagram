# 📸 Mini Instagram — Project README

A fully functional Instagram-like web app built with **Node.js**, **Express**, **MongoDB**, and **EJS**.
Users can register, log in, upload image posts with captions, view a paginated feed, and edit or delete their own posts.

---

## 📁 Project Structure

```
test4/
├── app.js                  ← Main entry point (server setup)
├── .env                    ← Environment variables (secret keys, DB URI)
├── package.json            ← Project metadata & dependencies
│
├── models/                 ← MongoDB schemas (Mongoose)
│   ├── User.js             ← User model (username, email, password, postCount)
│   └── Post.js             ← Post model (caption, imagePath, user ref)
│
├── routes/                 ← Express route handlers
│   ├── authRoutes.js       ← Register / Login / Logout routes
│   └── postRoutes.js       ← Feed, Upload, View, Edit, Delete routes
│
├── middleware/             ← Custom middleware
│   ├── auth.js             ← JWT authentication guards
│   └── upload.js           ← Multer image upload config
│
├── views/                  ← EJS templates (frontend pages)
│   ├── layout.ejs          ← Shared base layout (navbar, flash messages)
│   ├── index.ejs           ← Paginated post feed (home page)
│   ├── register.ejs        ← Registration form
│   ├── login.ejs           ← Login form
│   ├── upload.ejs          ← New post upload form
│   ├── post.ejs            ← Single post detail view
│   ├── edit.ejs            ← Edit post caption form
│   └── 404.ejs             ← Custom 404 error page
│
└── public/                 ← Static assets served to browser
    ├── css/
    │   └── style.css       ← Global stylesheet
    └── uploads/            ← Uploaded images stored here (auto-created)
```

---

## 🚀 Phase-by-Phase Breakdown

---

### ✅ Phase 1 — Project Setup

**What we did:**
- Initialized the Node.js project with `npm init`
- Installed all required packages:
  - `express` — web server framework
  - `mongoose` — MongoDB ODM
  - `ejs` — templating engine
  - `bcryptjs` — password hashing
  - `jsonwebtoken` — JWT-based auth tokens
  - `multer` — file upload handling
  - `dotenv` — environment variable loader
  - `cookie-parser` — read cookies from requests
  - `express-session` — session management
  - `connect-flash` — flash messages (success/error)
- Created `app.js` as the main server entry point
- Set up the `.env` file for secrets:
  ```
  MONGO_URI=your_mongodb_connection_string
  JWT_SECRET=your_jwt_secret
  SESSION_SECRET=your_session_secret
  PORT=3000
  ```

**Folder created:** `/` (root)

---

### ✅ Phase 2 — Database Models

**What we did:**
- Created the `models/` folder with two Mongoose schemas

**📄 `models/User.js`**
- Fields: `username` (unique, 3–20 chars), `email` (unique, validated), `password` (min 6 chars), `postCount` (max 10)
- Pre-save hook to **hash the password** using `bcryptjs` before storing
- Instance method `comparePassword()` to verify login credentials
- Timestamps (`createdAt`, `updatedAt`) auto-added

**📄 `models/Post.js`**
- Fields: `caption` (max 300 chars), `imagePath` (string), `user` (reference to User)
- Linked to a User via `ObjectId` reference (for `populate()`)
- Timestamps auto-added

---

### ✅ Phase 3 — Middleware

**What we did:**
- Created the `middleware/` folder with two files

**📄 `middleware/auth.js`**
- `isLoggedIn` — protects routes by verifying the JWT token from cookies. Redirects to `/login` if missing/expired
- `setCurrentUser` — soft check that runs on every request to make `currentUser` available in all EJS views

**📄 `middleware/upload.js`**
- Configured **Multer** for disk storage (`public/uploads/`)
- Auto-creates the `uploads/` folder if it doesn't exist
- Generates unique filenames: `post-<timestamp>-<random>.<ext>`
- File type filter: only allows `jpg`, `jpeg`, `png`, `gif`, `webp`
- File size limit: **5 MB max**

---

### ✅ Phase 4 — Authentication Routes

**What we did:**
- Created `routes/authRoutes.js` with the following routes:

| Method | Route       | What it does                                      |
|--------|-------------|---------------------------------------------------|
| GET    | `/register` | Shows the registration form                       |
| POST   | `/register` | Creates a new user, validates fields, redirects   |
| GET    | `/login`    | Shows the login form                              |
| POST   | `/login`    | Verifies credentials, issues a JWT cookie (1 day) |
| GET    | `/logout`   | Clears the JWT cookie and redirects to login      |

**Security features:**
- Passwords are never stored in plain text (bcrypt hashed)
- Duplicate username/email returns a friendly error
- Already logged-in users are redirected away from login/register

---

### ✅ Phase 5 — Post Routes (CRUD)

**What we did:**
- Created `routes/postRoutes.js` with full post management:

| Method | Route               | What it does                                         |
|--------|---------------------|------------------------------------------------------|
| GET    | `/`                 | Shows paginated feed (4 posts/page, newest first)    |
| GET    | `/upload`           | Shows upload form (auth required)                    |
| POST   | `/upload`           | Saves image + caption, enforces 10-post limit        |
| GET    | `/post/:id`         | Shows a single post detail page                      |
| GET    | `/post/:id/edit`    | Shows edit form (owner only)                         |
| POST   | `/post/:id/edit`    | Updates the caption (owner only)                     |
| POST   | `/post/:id/delete`  | Deletes post + image file from disk (owner only)     |

**Business rules enforced:**
- ⚠️ **10-post limit** per user — upload blocked beyond this
- 🔒 **Owner-only** edit and delete — other users get an error
- 🗑️ Deleted posts also remove the image file from `public/uploads/`
- 📈 `postCount` on User is incremented on upload, decremented on delete

---

### ✅ Phase 6 — EJS Views (Frontend)

**What we did:**
- Created the `views/` folder with 8 EJS templates

| File            | Purpose                                                      |
|-----------------|--------------------------------------------------------------|
| `layout.ejs`    | Shared base layout — navbar, flash messages (success/error)  |
| `index.ejs`     | Home feed — shows posts in a grid with pagination buttons    |
| `register.ejs`  | Registration form with username, email, password fields      |
| `login.ejs`     | Login form with email and password                           |
| `upload.ejs`    | Image upload form with caption input and file picker         |
| `post.ejs`      | Full single-post view with edit/delete buttons for owner     |
| `edit.ejs`      | Edit caption form for post owner                             |
| `404.ejs`       | Custom "Page Not Found" error page                           |

- **Flash messages** (success/error) appear at the top of every page
- The navbar shows different links depending on whether the user is logged in

---

### ✅ Phase 7 — Static Assets

**What we did:**
- Created `public/css/style.css` — global styles for the entire app (layout, cards, forms, navbar, flash messages, pagination)
- `public/uploads/` — auto-created folder where all uploaded post images are stored and served

---

### ✅ Phase 8 — Main App Configuration (`app.js`)

**What we did:**
- Wired everything together in `app.js`:
  - EJS set as the view engine, pointing to `views/`
  - Static files served from `public/`
  - Middlewares: body parser, cookie-parser, session, flash
  - `setCurrentUser` runs on every request
  - Auth routes and post routes mounted at `/`
  - Custom 404 handler renders `404.ejs`
  - Global error handler for 500 errors
  - **MongoDB** connected via `mongoose.connect()` before server starts
  - Server listens on `PORT` from `.env` (default 3000)

---

## ⚙️ How to Run Locally

```bash
# 1. Install dependencies
npm install

# 2. Create .env file in root with:
MONGO_URI=mongodb://localhost:27017/miniinstagram
JWT_SECRET=your_jwt_secret_here
SESSION_SECRET=your_session_secret_here
PORT=3000

# 3. Start the server
npm start
# or
node app.js

# 4. Visit in browser
http://localhost:3000
```

---

## 🛠️ Tech Stack

| Technology       | Purpose                        |
|------------------|--------------------------------|
| Node.js          | JavaScript runtime             |
| Express.js v5    | Web server & routing           |
| MongoDB          | NoSQL database                 |
| Mongoose         | MongoDB object modeling        |
| EJS              | Server-side HTML templating    |
| Bcryptjs         | Password hashing               |
| JSON Web Token   | Stateless authentication       |
| Multer           | Image file uploads             |
| Express-Session  | Session management             |
| Connect-Flash    | Flash messages                 |
| Dotenv           | Environment variable loading   |

---

## 🔐 Security Features

- Passwords hashed with **bcrypt** (salt rounds: 10)
- Auth via **HTTP-only JWT cookie** (expires in 1 day)
- Session secret stored in `.env` (never hard-coded)
- Only the **post owner** can edit or delete their posts
- **10-post limit** per user enforced on the server side
- Invalid file types rejected by Multer before saving

---
<br>
<br>
<img width="1919" height="1012" alt="image" src="https://github.com/user-attachments/assets/ba72473b-9e16-4c71-ba99-4ada323bfa69" />

<br>
<br>
<img width="1897" height="984" alt="image" src="https://github.com/user-attachments/assets/9d73b586-289a-4ccb-aed2-c7c7b0eac844" />
<br>
<br>
<img width="1879" height="875" alt="image" src="https://github.com/user-attachments/assets/68583d4b-8b68-46b6-b951-83ff5a63bd8c" />
<br>
<br>
<img width="1872" height="913" alt="image" src="https://github.com/user-attachments/assets/86dcfd6c-d128-4fd3-bc3a-9ea4595e3e72" />
<br>
<br>
<img width="1467" height="912" alt="image" src="https://github.com/user-attachments/assets/fc5ab159-fd10-48eb-b1f2-d89c0d824261" />


