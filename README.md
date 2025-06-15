# Smart Ticket System

A full-stack application with NestJS backend and Next.js frontend.

## Project Structure

```
smart_ticket_system/
├── backend/          # NestJS API server
├── frontend/         # Next.js web application
└── README.md         # This file
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm

### Backend (NestJS)

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies (already done during setup):
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run start:dev
   ```

The backend API will be available at `http://localhost:3000`

### Frontend (Next.js)

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies (already done during setup):
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

The frontend application will be available at `http://localhost:3000`

**Note:** You'll need to configure different ports for backend and frontend if running simultaneously. The backend typically runs on port 3000, so you may want to configure the frontend to run on port 3001.

## Development

### Backend Development
- Main application files are in `backend/src/`
- API endpoints can be added by creating controllers and services
- Database configuration and models can be added as needed

### Frontend Development
- Application files are in `frontend/src/`
- Uses TypeScript and Tailwind CSS for styling
- App Router is configured for modern Next.js development

## Available Scripts

### Backend
- `npm run start` - Start production server
- `npm run start:dev` - Start development server with hot reload
- `npm run start:debug` - Start server in debug mode
- `npm run build` - Build the application
- `npm run test` - Run unit tests
- `npm run test:e2e` - Run end-to-end tests

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Next Steps

1. Configure CORS in the backend to allow frontend connections
2. Set up environment variables for both projects
3. Configure database connections in the backend
4. Implement API endpoints and corresponding frontend pages
5. Add authentication and authorization as needed