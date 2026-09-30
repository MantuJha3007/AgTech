# AgTech 🌾

AgTech is a full-stack agricultural management platform that helps landowners, tenants, and farmers manage land, lease agreements, crop cycles, financial transactions, and AI-driven farm recommendations from one dashboard.

## Overview

This repository contains the complete AgTech application:

- Backend: Node.js + Express + MongoDB
- Frontend: Next.js + React + TypeScript + Tailwind CSS
- Authentication: JWT-based auth with user/session handling
- AI support: Gemini-powered advisory endpoints for crop and farm guidance
- Dashboards: land, lease, crop, and transaction management modules

## Tech Stack

### Backend
- Node.js
- Express
- MongoDB with Mongoose
- JWT authentication
- CORS + dotenv configuration
- Gemini API integration

### Frontend
- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Axios for API calls
- Recharts for analytics UI
- Framer Motion and Lucide icons

## Project Structure

```text
AgTech/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   └── services/
│   ├── .env
│   ├── package.json
│   ├── server.js
│   └── ...
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── services/
│   │   ├── store/
│   │   └── types/
│   ├── package.json
│   ├── next.config.ts
│   ├── tailwind.config.ts
│   └── ...
├── README.md
└── .gitignore
```

## Features

- User registration and login
- JWT-based protected routes
- Land management for agricultural properties
- Lease tracking and status management
- Crop lifecycle tracking
- Transaction and financial ledger support
- Farm insights and AI advisory recommendations
- Role-aware dashboard experience for landowners and farmers

## API Modules

The backend exposes the following main routes:

- `/api/auth` — login, signup, email verification, session handling
- `/api/lands` — land CRUD operations
- `/api/leases` — lease management
- `/api/crops` — crop records and tracking
- `/api/transactions` — income/expense ledger handling
- `/api/ai` — AI-based farm and crop recommendations
- `/api/health` — server health endpoint

## Environment Setup

Create or update a `.env` file inside the `backend` folder with the required variables:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
GEMINI_API_KEY=your_gemini_api_key
FRONTEND_URL=http://localhost:3000
```

The frontend uses a default API base of `http://localhost:5000/api`, but this can be overridden with a `NEXT_PUBLIC_API_URL` environment variable if needed.

## Getting Started

### 1. Install backend dependencies

```bash
cd backend
npm install
```

### 2. Start the backend

```bash
npm run dev
```

The backend runs on:

```text
http://localhost:5000
```

### 3. Install frontend dependencies

Open a new terminal:

```bash
cd frontend
npm install
```

### 4. Start the frontend

```bash
npm run dev
```

The frontend runs on:

```text
http://localhost:3000
```

## Common Development Commands

### Backend
```bash
cd backend
npm run dev
npm start
```

### Frontend
```bash
cd frontend
npm run dev
npm run build
npm run lint
```

## Notes

- The project is structured as a decoupled frontend-backend app.
- Authentication is required for dashboard routes and protected API access.
- AI recommendations rely on the configured Gemini API key in the backend environment.
- MongoDB connectivity must be available for the app to run properly.

## License

This project is currently intended for internal or local project development. Add your preferred license before production deployment if needed.

## Future Scope

Planned direction for the product includes:

- satellite and IoT farm monitoring
- predictive weather insight integration
- smart contract-based lease enforcement
- farmer marketplace and equipment rental features
- carbon credit and sustainability tracking

