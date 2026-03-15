# CourseFlow simple backend

Express + MySQL backend that matches the placeholders Julia has in `App.js`.

## What we have

- `POST /api/auth/login`
- `POST /api/users`
- `GET /api/users/:id`
- `GET /api/courses`
- `GET /api/courses/:id`
- `POST /api/enrollments`
- `GET /api/enrollments?userId=...`
- `GET /api/enrollments?status=pending`
- `PATCH /api/enrollments/:id`
- `GET /api/admin/stats`
- `GET /api/logs`
- `POST /api/logs`
- `GET /api/overview?userId=...`
- `GET /api/health`

## First run:
1. You need Node.js and npm install with https://nodejs.org/en/download
2. cd into backend folder
3. write 'npm install' into terminal
4. Once complete, run 'npm run dev'
5. Visit "http://localhost:3001/api/health" and you should see '{ "status": "ok" }'

## How to usually run it

1. Create the database using `schema.mysql.sql`.
2. Copy `.env.example` to `.env`.
3. Install dependencies:

```
npm install
```

4. Start the server:

```bash
npm run dev
```

Server runs on `http://localhost:3001` by default.

## Notes

- Passwords are **PLAIN TEXT** replace with hashed passwords and real auth (I think we plan on using firebase)

### Load courses

```js
const courses = await fetch('http://localhost:3001/api/courses').then(r => r.json());
renderCourseGrid(courses);
```
