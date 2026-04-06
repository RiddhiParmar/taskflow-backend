# Taskflow-backend
TaskFlow Backend is a robust and scalable RESTful API built using NestJS and MongoDB. It powers the TaskFlow application by providing secure authentication, role-based access control, and efficient task management operations.

## Tech Stack
NestJS (Node.js framework)
MongoDB Atlas (Database)
Mongoose ODM
JWT Authentication
bcrypt (Password hashing)
class-validator (DTO validation)

## Project setup
```bash
# clone repository
$ git clone git@github.com:RiddhiParmar/taskflow-backend.git

$ cd taskflow-backend

#install dependencies
$ npm install
```

## Setup enviorenment
```bash
# create a .env file using the example:
$ cp example.env .env
```

## Update required variables:
```
PORT=3000
HOST=0.0.0.0
MONGO_URI=your_mongodb_connection
JWT_SECRET=your_secret_key
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```