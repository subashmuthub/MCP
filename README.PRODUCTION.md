Production build and deploy notes

1. Build images locally:

   docker compose build --progress=plain

2. Start stack:

   docker compose up -d

3. Services:

- frontend: http://localhost:80 (served by nginx)
- backend: http://localhost:4000
- ml-service: port 5001

4. Environment

Set production env variables in your deployment: `MONGODB_URI`, `JWT_SECRET`, `ML_SERVICE_URL`.
