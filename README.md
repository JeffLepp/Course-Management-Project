# Online Course Management

#### This system aims to tackle the problem of class enrollment, providing valuable data on course details and statistics on user activities. The main target are students who would be utilizing the system to sign up for courses, instructors who would approve students who enrolled into courses, and system administrators who will help manage student enrollment and gain access to valuable insight on participation and course management stats. This system will manage a variety of data including:  
 * usernames and passwords, user roles, course information, enrollment status, and user logs.

# Running
1) In your proj repository write in terminal:
```
docker compose -f database/docker-compose.yml up -d
```
Note: Ensure you have docker desktop open and running
Note: Your terminal may be stuck in log file (you cant type), just open new terminal keep that one running

2) cd into backend folder:
```
npm install
npm run dev
```
Note: npm install only necessary for first time launch

Visit
```
http://localhost:3001/api/health
http://localhost:3001/api/courses
```

Important info for debugging:
Full reset
```
docker compose -f database/docker-compose.yml down -v
docker compose -f database/docker-compose.yml up -d --build
```

Changes track:
Slight changes to app to support contextview shifts, index.html to incorporate backend implementation path and basic connectivity currently, created backend and routing, improved seed data for sql, documentation changes
