# Fall Detection System Backend Service

## Project Introduction
This is a Node.js and Express-based fall detection system backend service that provides comprehensive IoT device management, intelligent alarm processing, user authentication and authorization, media file management, and other functionalities. The system adopts RESTful API design, supports data interaction between embedded devices and mobile applications, and features real-time MQTT communication capabilities.

### Core Features
- 🏠 **One-to-One Device Binding**: Each user can only bind to one device, simplifying management
- 🔐 **Multi-Layer Authentication**: User Token, Device Token, Refresh Token, Reset Token
- 📱 **Real-time Communication**: MQTT message push, real-time device status monitoring
- 📊 **Intelligent Alarms**: Confidence assessment, support for multiple event types
- 📁 **Media Management**: Image and video upload storage, classified management
- ⭐ **Feedback System**: User rating feedback, continuous improvement
- 🛡️ **Security Protection**: Data validation, security headers, CORS control

## Feature Overview
- **User Authentication**: User registration, login, password reset, JWT authentication, token refresh
- **Device Management**: Device registration, heartbeat detection, status monitoring, one-to-one user binding
- **Alarm Processing**: Fall detection, abnormal behavior recognition, alarm confirmation, confidence assessment
- **Media Management**: Image and video upload, storage, access, file classification management
- **Feedback System**: User ratings, feedback content collection
- **Real-time Communication**: MQTT message push, device status monitoring
- **Health Check**: Service status monitoring

## Technology Stack
- **Runtime Environment**: Node.js >= 18.0.0
- **Web Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Sequelize
- **Authentication**: JWT (jsonwebtoken)
- **Password Encryption**: bcrypt
- **File Upload**: multer
- **Data Validation**: Joi
- **Message Communication**: MQTT (mqtt.js)
- **Containerization**: Docker & Docker Compose
- **Security**: helmet, cors
- **Logging**: morgan
- **Utility Libraries**: moment, uuid, validator

## Project Structure
```
backend/
├── src/                    # Source code directory
│   ├── controllers/        # Controller layer
│   │   ├── authController.js      # User authentication controller
│   │   ├── deviceController.js    # Device management controller
│   │   ├── alarmController.js     # Alarm processing controller
│   │   ├── userController.js      # User management controller
│   │   └── feedbackController.js  # Feedback management controller
│   ├── routes/            # Route layer
│   │   ├── v1/           # API v1 version
│   │   │   ├── auth.js           # Authentication routes
│   │   │   ├── devices.js        # Device routes
│   │   │   ├── alarms.js         # Alarm routes
│   │   │   ├── users.js          # User routes
│   │   │   ├── media.js          # Media routes
│   │   │   └── feedback.js       # Feedback routes
│   │   └── index.js      # Route entry
│   ├── db/                # Database layer
│   │   ├── models/       # Data models
│   │   │   ├── User.js           # User model
│   │   │   ├── Device.js         # Device model
│   │   │   ├── AlarmRecord.js    # Alarm record model
│   │   │   ├── Video.js          # Video model
│   │   │   └── Feedback.js       # Feedback model
│   │   ├── migrations/   # Database migrations
│   │   ├── index.js      # Database connection
│   │   └── init.js       # Database initialization
│   ├── middleware/        # Middleware layer
│   │   ├── auth.js       # User authentication middleware
│   │   ├── deviceAuth.js # Device authentication middleware
│   │   └── validation.js # Data validation middleware
│   ├── services/          # Service layer
│   │   └── mqttService.js # MQTT communication service
│   ├── validation/        # Data validation layer
│   │   ├── authSchemas.js     # Authentication validation schemas
│   │   ├── deviceSchemas.js   # Device validation schemas
│   │   ├── alarmSchemas.js    # Alarm validation schemas
│   │   ├── feedbackSchemas.js # Feedback validation schemas
│   │   └── mediaSchemas.js    # Media validation schemas
│   ├── app.js            # Application entry
│   └── db.js             # Database configuration
├── config/                # Configuration directory
│   └── config.js         # Application configuration
├── uploads/              # File upload directory
│   ├── temp/            # Temporary file directory
│   ├── images/          # Image storage
│   └── videos/          # Video storage
├── public/              # Public access directory
├── test_downloads/     # Test download directory
├── nginx/              # Nginx configuration directory
├── livekit/            # LiveKit configuration directory
├── API_DOCUMENTATION.md   # API documentation
├── 数据库表结构.md         # Database design documentation
├── 架构文档.md             # System architecture documentation
├── Dockerfile            # Docker build file
├── docker-compose.yml    # Docker orchestration configuration
├── package.json         # Project dependency configuration
├── jest.config.js       # Jest test configuration
├── api_test.sh         # API test script
├── event_test.sh       # Event test script
└── README.md            # Project documentation
```

## Quick Start

### Local Development
```bash
# Clone project
git clone https://github.com/Latrell233/Fall-Detection-Backend.git
cd backend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env file, configure necessary environment variables

# Start development server
npm run dev
```

### Environment Requirements
- Node.js >= 18.0.0
- PostgreSQL >= 12
- Docker >= 20.0
- Docker Compose >= 2.0
- At least 2GB available memory
- At least 10GB available disk space

### Installation Steps
1. Clone project
```bash
git clone https://github.com/Latrell233/Fall-Detection-Backend.git
cd backend
```

2. Install dependencies
```bash
npm install
```

3. Configure environment variables
```bash
cp .env.example .env
# Edit .env file, configure necessary environment variables
```

4. Start service
```bash
# Development environment
npm run dev

# Production environment
docker-compose up -d
```

5. Initialize database
```bash
# Initialize database (includes table structure and test data)
node src/db/init.js

# If force rebuild tables needed (will delete all existing data)
node src/db/init.js --force
```

### Database Initialization
```bash
# Initialize database (includes table structure and test data)
node src/db/init.js

# If force rebuild tables needed (will delete all existing data)
node src/db/init.js --force
```

## Quick Deployment Guide

### 1. Clone Repository
```bash
git clone https://github.com/Latrell233/Fall-Detection-Backend.git
cd backend
```

### 2. Environment Preparation
```bash
# Create necessary directories
mkdir -p uploads/temp uploads/images uploads/videos public test_downloads

# Configure environment variables
cp .env.example .env
# Edit .env file, set necessary environment variables
```

### 3. Deploy Using Docker Compose
```bash
# Start all services
docker-compose up -d

# Wait for services to start (about 30 seconds)
# Check service status
docker-compose ps

# View service logs
docker-compose logs -f
```

### 4. Initialize Database
```bash
# Enter backend container
docker-compose exec backend sh

# Run database initialization script
node src/db/init.js
```

### 5. Verify Deployment
- Access health check interface: http://localhost:3000/health
- Run test scripts:
  ```bash
  # API test
  ./api_test.sh
  
  # Event test
  ./event_test.sh
  
  # Performance test
  ./performance_test.sh
  ```

### 6. Common Issue Resolution
1. If encountering permission issues:
```bash
# Check directory permissions
ls -la uploads public test_downloads

# If needed, modify permissions
chmod -R 755 uploads public test_downloads
```

2. If redeployment needed:
```bash
# Stop and delete all containers and data
docker-compose down -v

# Rebuild and start
docker-compose up -d --build
```

3. If need to view logs:
```bash
# View all service logs
docker-compose logs -f

# Only view backend service logs
docker-compose logs -f backend
```

## Deployment Instructions

### Docker Deployment
1. Prepare environment
```bash
# Create necessary directories
mkdir -p uploads/temp uploads/images uploads/videos public test_downloads

# Copy environment variable file
cp .env.example .env
# Edit .env file, configure necessary environment variables
```

2. Start services
```bash
# Build and start all services
docker-compose up -d

# Check service status
docker-compose ps

# View service logs
docker-compose logs -f
```

3. Initialize database
```bash
# Enter backend container
docker-compose exec backend sh

# Run database initialization script
node src/db/init.js
```

4. Access services
- Backend API: http://localhost:3000
- Health check: http://localhost:3000/health

5. Stop services
```bash
# Stop all services
docker-compose down

# Stop and delete all data (including database data)
docker-compose down -v
```

### Deployment Considerations
1. System Requirements
   - Docker version >= 20.0
   - Docker Compose version >= 2.0
   - Node.js >= 18.0.0
   - PostgreSQL >= 12
   - At least 2GB available memory
   - At least 10GB available disk space

2. Performance Optimization
   - Adjust Docker daemon configuration
   - Configure appropriate log rotation
   - Set reasonable resource limits
   - Database connection pool optimization
   - File upload size limit (50MB)

### Environment Variable Configuration
- `DB_HOST`: Database host (use 'db' in Docker environment)
- `DB_PORT`: Database port (default 5432)
- `DB_USER`: Database username (default postgres)
- `DB_PASSWORD`: Database password
- `DB_NAME`: Database name (default fall_detection)
- `DB_SSL`: Database SSL connection (default false)
- `JWT_SECRET`: JWT secret key
- `PORT`: Server port (default 3000)
- `NODE_ENV`: Runtime environment (development/production)
- `MQTT_BROKER`: MQTT broker address (default mqtt://localhost:1883)
- `UPLOAD_DIR`: File upload directory (default uploads)

## Monitoring and Maintenance

### Health Check
- Endpoint: `GET /health`
- Purpose: Service status monitoring, container health check
- Response: `{ "status": "OK" }`

### Log Management
- **Access Logs**: Morgan middleware records API requests
- **Error Logs**: Unified exception handling records system errors
- **Debug Logs**: Request path recording
- **Business Logs**: Key operation recording
- **MQTT Logs**: Connection status monitoring

## Security Information
- **Authentication Mechanism**: All API requests require authentication (except health check)
- **Password Security**: Uses bcrypt encrypted storage (10 rounds of salt)
- **Token Management**: JWT authentication, Refresh Token, Device Token
- **File Security**: File upload size limit (50MB) and type restrictions
- **Data Validation**: Joi data validation middleware
- **Security Headers**: Helmet security protection
- **CORS Configuration**: Cross-origin request control

## Testing
```bash
# Run API tests
./api_test.sh

# Run event tests
./event_test.sh

# Run performance tests
./performance_test.sh

# Run unit tests
npm test

# Run test coverage
npm run test:coverage
```

## API Usage Examples

### User Authentication
```bash
# User registration
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "password": "password123"}'

# User login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "password": "password123"}'
```

### Device Management
```bash
# Device registration (requires user token)
curl -X POST http://localhost:3000/api/v1/devices/register \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"device_id": "DEVICE_001", "device_secret": "secret123", "install_location": "Living Room"}'

# Device heartbeat
curl -X POST http://localhost:3000/api/v1/devices/heartbeat \
  -H "Authorization: Device DEVICE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"device_id": "DEVICE_001", "status": "online"}'
```

### Alarm Processing
```bash
# Event reporting
curl -X POST http://localhost:3000/api/v1/devices/event \
  -H "Authorization: Device DEVICE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"device_id": "DEVICE_001", "event_type": "fall", "confidence": 0.95}'

# Get alarm list
curl -X GET http://localhost:3000/api/v1/alarms \
  -H "Authorization: Bearer USER_TOKEN"
```

## Documentation
- **API Documentation**: `API_DOCUMENTATION.md` - Complete API interface documentation
- **Database Structure**: `数据库表结构.md` - Database table structure design
- **System Architecture**: `架构文档.md` - System architecture design documentation

## Development Guide

### Code Standards
- Use ESLint for code checking
- Use Prettier for code formatting
- Follow RESTful API design standards
- Use Joi for data validation

### Testing Strategy
- Unit Testing: Test individual functions and modules
- Integration Testing: Test API interfaces
- API Testing: End-to-end functional testing
- Performance Testing: Load and stress testing

### Contribution Guide
1. Fork project
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Create Pull Request

### Commit Standards
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation update
- `style`: Code format adjustment
- `refactor`: Code refactoring
- `test`: Testing related
- `chore`: Build process or auxiliary tool changes

## Deployment Architecture

### Containerized Deployment
System adopts Docker containerized deployment, including the following services:
- **Nginx**: Reverse proxy and load balancing
- **Backend**: Node.js application service
- **PostgreSQL**: Main database
- **EMQX**: MQTT message broker (optional)

### Extension Services
- **LiveKit**: Real-time audio/video communication (reserved)
- **AI Agent**: Smart voice assistant (reserved)

## Troubleshooting

### Common Issues
1. **Database Connection Failure**
   - Check if database service is started
   - Verify environment variable configuration
   - Confirm network connection

2. **File Upload Failure**
   - Check directory permissions
   - Verify file size limits
   - Confirm file type

3. **MQTT Connection Failure**
   - Check MQTT broker service
   - Verify network connection
   - Confirm topic configuration

### Log Viewing
```bash
# View application logs
docker-compose logs -f backend

# View database logs
docker-compose logs -f db

# View Nginx logs
docker-compose logs -f nginx
```

## License
MIT 