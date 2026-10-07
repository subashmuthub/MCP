# EquipSense AI

Intelligent Failure Prediction and Maintenance Scheduling Engine

## Project Overview

EquipSense AI is a predictive maintenance platform for laboratory equipment and other managed assets. It combines equipment records, maintenance history, and a machine-learning risk service to forecast failure likelihood and trigger maintenance action before breakdown occurs.

## Project Structure

- `frontend` - React dashboard for equipment monitoring
- `backend` - Node.js and Express API server
- `ml-service` - Python Flask service for failure-risk prediction
- `database` - MongoDB collection notes and setup guidance
- `docs` - project brief and presentation outline

## Main Features

- User registration and login with JWT auth
- Equipment registry and maintenance logs
- Risk scoring with health status labels
- Alerts for high-risk equipment
- Maintenance ticket creation
- Dashboard charts for history and trends

## Suggested Run Order

1. Start MongoDB locally or use MongoDB Atlas
2. Start the ML service in `ml-service`
3. Start the backend API in `backend`
4. Start the frontend dashboard in `frontend`

## Deployment Files

- `backend/Dockerfile`
- `frontend/Dockerfile`
- `ml-service/Dockerfile`
- `docker-compose.yml`

## Quick Docker deploy (local)

Build and run all services with Docker Compose:

```powershell
docker compose up --build -d
```

Services will be available at:

- Frontend: <http://localhost:5174>
- Backend API: <http://localhost:4000>
- ML service: <http://localhost:5001>

To stop and remove:

```powershell
docker compose down -v
```

Notes:

- The `backend` service reads environment variables from `.env` if present. Ensure `JWT_SECRET` is set for production.
- For cloud deployment, adapt the `docker-compose.yml` and consider managed MongoDB (Atlas) and a secure secrets store.

## Technology Stack

- Frontend: React, Vite, CSS
- Backend: Node.js, Express, JWT, Mongoose
- ML Service: Python, Flask, scikit-learn compatible interface
- Database: MongoDB
