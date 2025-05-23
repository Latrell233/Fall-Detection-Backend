# Fall Detection System - Backend

## Overview
Backend service for Fall Detection System with:
- RESTful API endpoints
- JWT authentication
- PostgreSQL database
- MQTT real-time communication
- Docker containerization

## System Architecture
![Architecture Diagram](docs/architecture.png)

## Prerequisites
- Docker 20.10+
- Docker Compose 1.29+
- Node.js 16+ (for local development)

## Installation

### With Docker (Recommended)
```bash
# 1. Clone repository
git clone <repository-url>

# 2. Navigate to backend
cd backend

# 3. Configure environment
cp .env.example .env
# Edit .env with your values

# 4. Build and start services
docker-compose up -d --build

# 5. Initialize database
docker-compose exec backend node src/db/init.js
```

### Local Development
```bash
# 1. Install PostgreSQL
sudo apt install postgresql

# 2. Create database
createdb -U postgres fall_detection_dev

# 3. Install dependencies
npm install

# 4. Configure environment
cp .env.example .env
# Set DB_TYPE=postgres and other local values

# 5. Start server
npm run dev
```

## Testing Setup

### PostgreSQL Testing
```bash
# 1. Start database service
docker-compose up -d db

# 2. Create test database
createdb -U postgres fall_detection_test

# 3. Configure test environment
echo "DB_TYPE=postgres
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=fall_detection_test
JWT_SECRET=test_secret
MQTT_BROKER=mqtt://localhost:1883" > .env.test

# 4. Run tests
npm test
```

### Using SQLite for Testing (Alternative)
```bash
# 1. Configure SQLite test env
echo "DB_TYPE=sqlite
DB_NAME=test.db" > .env.test

# 2. Create test database file
touch test.db

# 3. Run tests
npm test
```

## Docker Configuration
```yaml
# docker-compose.yml
version: '3.8'

services:
  db:
    image: postgres:13
    container_name: fall_detection_db
    environment:
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: ${DB_NAME}
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER} -d ${DB_NAME}"]
      interval: 5s
      timeout: 5s
      retries: 5

  backend:
    build: .
    container_name: fall_detection_backend
    depends_on:
      db:
        condition: service_healthy
    environment:
      - NODE_ENV=production
      - DB_HOST=db
      - DB_PORT=5432
      - DB_USER=${DB_USER}
      - DB_PASSWORD=${DB_PASSWORD}
      - DB_NAME=${DB_NAME}
      - JWT_SECRET=${JWT_SECRET}
      - MQTT_BROKER=mqtt://emqx:1883
    ports:
      - "3000:3000"
    volumes:
      - ./src:/usr/src/app/src
      - ./config:/usr/src/app/config

  emqx:
    image: emqx:5
    container_name: fall_detection_emqx
    ports:
      - "1883:1883"  # MQTT
      - "8083:8083"  # MQTT over WS
      - "18083:18083" # Dashboard

volumes:
  postgres_data:
```

## API Documentation
Access Swagger UI after starting services:
```
http://localhost:3000/api-docs
```

## License
MIT