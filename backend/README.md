# Smart Ticket System - Backend

A backend API service for the Smart Ticket System built with NestJS.

## Description

This is the backend service for the Smart Ticket System, providing RESTful APIs for ticket management, user authentication, and system administration.

## Project Setup

```bash
$ npm install
```

## Running the Application

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Testing

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## API Documentation

Once the application is running, you can access the API documentation at:
- Development: `http://localhost:3000/api`

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Add your environment variables here
PORT=3000
DATABASE_URL=your_database_url
JWT_SECRET=your_jwt_secret
```

## License

This project is licensed under the UNLICENSED license.
