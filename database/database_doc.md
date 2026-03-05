Some quick notes for interacting with this thing:

# How to run
1) Download and run Docker Desktop

2) Run command in project directory
'''
docker compose -f database/docker-compose.yml up -d
'''

3) [Optional] In-terminal MySQL use (no MySQL install needed)
```
docker exec -it courseflow_mysql mysql -u courseflow -pcourseflow -D course_management
```
   [Optional] Test with commands like:
```
SELECT * FROM users;
SELECT * FROM courses;
SELECT * FROM enrollments;
```

4) Stop/Reset the container
```
docker compose -f database/docker-compose.yml down
```

# Notes
Docker gives the project a portable database environment that runs identically on every machine without installing/configuring MySQL manually
Knowing Parteek he will probably penalize us since its kind of standard for reproducability

# Changes
1) Moved schema to database/init, Added Auto Increment to each Primary Key
2) Added docker for app availability without MySQL/version requirements
3) Added seed.sql to automatically populate with base data