# Fall Detection System - Testing Guide

## Local Testing Without Docker

### Prerequisites
- Node.js 16+
- npm 8+
- (Optional) PostgreSQL 13+
- (Optional) EMQX 5+

### Setup Test Environment

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up test database**:
   - PostgreSQL (recommended):
     ```bash
     createdb fall_detection_test
     ```
   - Or use SQLite (fallback):
     ```bash
     touch test.db
     ```

3. **Configure environment variables**:
   Create `.env.test` file:
   ```ini
   NODE_ENV=test
   DB_TYPE=postgres  # or 'sqlite'
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=postgres
   DB_PASSWORD=postgres
   DB_NAME=fall_detection_test
   JWT_SECRET=test_secret
   MQTT_BROKER=mqtt://localhost:1883
   ```

### Running Tests

1. **Run all tests**:
   ```bash
   ./test-local.sh
   ```

2. **Run specific test suites**:
   ```bash
   # Unit tests only
   npm test unit

   # Integration tests only
   npm test integration

   # API tests only
   npm test api
   ```

### Test Strategies

#### 1. Unit Testing
- Test individual components in isolation
- Mock external dependencies
- Location: `tests/unit/`

#### 2. Integration Testing
- Test component interactions
- Use test database
- Location: `tests/integration/`

#### 3. API Testing
- Test HTTP endpoints
- Use supertest library
- Location: `tests/api/`

### Test Data Preparation

```javascript
// Example test data setup
beforeEach(async () => {
  await db.query(`
    INSERT INTO users (email, password, name)
    VALUES ('test@example.com', 'hashed_password', 'Test User')
  `);
  
  await db.query(`
    INSERT INTO devices (id, user_id, name, type)
    VALUES ('DEV-001', 1, 'Test Device', 'wearable')
  `);
});
```

### Verifying Results

1. **Check test coverage**:
   ```bash
   npm run test:coverage
   ```
   Open `coverage/index.html` in browser

2. **Manual verification**:
   ```bash
   # Start test server
   NODE_ENV=test node src/app.js

   # In another terminal:
   curl http://localhost:3000/api/health
   ```

## CI/CD Integration

Tests are automatically run on:
- Push to main branch
- Pull requests
- Scheduled nightly builds

See `.github/workflows/tests.yml` for details.