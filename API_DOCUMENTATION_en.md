# Fall Detection System API Documentation

## I. Embedded Device APIs

### 1. Device Authentication and Registration [Verified]
```
POST /api/v1/devices/register
Authorization: Bearer {user_access_token}
Content-Type: application/json

Request Body:
{
  "device_id": "DEVICE_001",      // Required
  "device_secret": "abcd1234",    // Required
  "install_location": "Elder's Room"   // Optional
}

Response:
{
  "success": true,
  "data": {
    "device_id": "DEVICE_001",
    "status": "offline",
    "device_token": "eyJhbGci...",  // Token for subsequent device APIs
    "install_location": "Elder's Room"
  }
}

Error Response:
{
  "error": "User already has a bound device",
  "details": "User already bound to device: DEVICE_002"
}
```

### 2. Device Heartbeat [Verified]
```
POST /api/v1/devices/heartbeat
Authorization: Device {device_token}
Content-Type: application/json

Request Body:
{
  "device_id": "DEVICE_001",
  "timestamp": "2024-03-20T10:00:00Z",
  "status": "online",
  "temp": 45.2
}

Response:
{
  "success": true,
  "data": {
    "received": true,
    "last_active": "2024-03-20T10:00:00Z"
  }
}

Error Response:
{
  "error": "Invalid device token",
  "details": "The provided device token is invalid or expired"
}
```

### 3. Event Reporting [Verified]
```
POST /api/v1/devices/event
Authorization: Device {device_token}
Content-Type: application/json

Request Body:
{
  "device_id": "DEVICE_001",    // Required
  "event_type": "fall",         // Required, must be fall, abnormal, or other
  "event_time": "2024-03-20T10:00:00Z",  // Required, ISO format
  "confidence": 0.95,           // Required, between 0-1
  "image_path": "/images/DEVICE_001/1234567890.jpg",  // Optional
  "video_path": "/videos/DEVICE_001/1234567890.mp4",  // Optional
  "alarm_message": "Fall detected"  // Optional
}

Response:
{
  "success": true,
  "data": {
    "alarm_id": "42",
    "device_id": "DEVICE_001",
    "event_type": "fall",
    "event_time": "2024-03-20T10:00:00.000Z",
    "confidence": 0.95,
    "handled": false,
    "video_path": "/videos/DEVICE_001/1234567890.mp4",
    "created_at": "2024-03-20T10:00:00.000Z"
  }
}

Error Response:
{
  "error": "Invalid event data",
  "details": "Event type must be one of: fall, abnormal, other"
}
```

### 4. Device Unbinding [Verified]
```
POST /api/v1/devices/unbind
Authorization: Bearer {access_token}
Content-Type: application/json

Request Body:
{
  // No device_id needed, system will automatically unbind user's device
}

Response:
{
  "success": true,
  "message": "Device unbound successfully"
}

Error Response:
{
  "error": "No device found for user",
  "details": "The user does not have any bound device"
}
```

### 5. Get Device Details [Verified]
```
GET /api/v1/devices/info
Authorization: Bearer {access_token}

Response:
{
  "success": true,
  "data": {
    "device_id": "DEVICE_001",
    "status": "online",
    "install_location": "Elder's Room",
    "last_active": "2024-03-20T10:00:00Z",
    "config_json": {}
  }
}

Error Response:
{
  "error": "No device bound to user",
  "details": "The user does not have any bound device"
}
```

### 6. Device Token Refresh [Verified]
Security Mechanism:
Dual Verification: Requires device ID and device secret
Binding Check: Only devices bound to users can refresh tokens
No Authentication Required: Devices can refresh without current token (solves expiration issues)
```
POST /api/v1/devices/refresh-token
Content-Type: application/json

Request Body:
{
  "device_id": "DEVICE_001",    // Required
  "device_secret": "abcd1234"   // Required
}

Response:
{
  "success": true,
  "data": {
    "device_id": "DEVICE_001",
    "device_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",  // New device token, valid for 90 days
    "expires_in": "90d"
  }
}

Error Response:
{
  "error": "Invalid device credentials",
  "details": "Device not found or secret is incorrect"
}

{
  "error": "Device not bound",
  "details": "Device must be bound to a user before refreshing token"
}

Validation Error Response:
{
  "errors": [
    {
      "field": "body.device_id",
      "message": "Device ID is required"
    }
  ]
}
```

## II. Mobile Application APIs

### 1. User Authentication [Verified]
```
POST /api/v1/auth/register
Content-Type: application/json

Request Body:
{
  "username": "user123",        // Required
  "password": "password123"     // Required
}

Response:
{
  "success": true,
  "user_id": 1
}

Error Response:
{
  "error": "Registration failed",
  "details": "Username already exists"
}

POST /api/v1/auth/login
Content-Type: application/json

Request Body:
{
  "username": "user123",
  "password": "password123"
}

Response:
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "username": "user123"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}

Error Response:
{
  "error": "Invalid credentials"
}

POST /api/v1/auth/reset-password
Content-Type: application/json

Request Body:
{
  "username": "user123"  // Required
}

Response:
{
  "success": true,
  "message": "Password reset token generated",
  "resetToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."  // Password reset token, valid for 1 hour
}

Error Response:
{
  "error": "User not found",
  "details": "The specified user does not exist"
}

POST /api/v1/auth/reset-password/{token}
Content-Type: application/json

Request Body:
{
  "newPassword": "newpassword123"  // Required, minimum 6 characters
}

Response:
{
  "success": true,
  "message": "Password reset successful"
}

Error Response:
{
  "error": "Invalid or expired token",
  "details": "The provided token is invalid or has expired"
}

Validation Error Response:
{
  "errors": [
    {
      "field": "body.newPassword",
      "message": "Password must be at least 6 characters long"
    }
  ]
}
```
Auto-renewal: When accessToken expires, use refreshToken to get new accessToken
User Experience: Users don't need to re-login, maintaining session continuity
Security: accessToken short-term valid, refreshToken long-term valid but single-purpose
Workflow:
User login → Get accessToken (15 minutes) + refreshToken (7 days)
accessToken expires → Use refreshToken to call refresh API
Get new accessToken → Continue using API
refreshToken expires → Need to re-login
```
POST /api/v1/auth/refresh
Content-Type: application/json

Request Body:
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."  // Required, refresh token obtained during login
}

Response:
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."  // New access token, valid for 15 minutes
  }
}

Error Response:
{
  "error": "Invalid refresh token",
  "details": "The provided refresh token is invalid or expired"
}

Validation Error Response:
{
  "errors": [
    {
      "field": "body.refreshToken",
      "message": "Refresh token is required"
    }
  ]
}
```

### 2. Device Management [Verified]
```
POST /api/v1/devices/register
Authorization: Bearer {user_access_token}
Content-Type: application/json

Request Body:
{
  "device_id": "DEVICE_001",
  "device_secret": "abcd1234",  // Required
  "install_location": "Elder's Room"
}

Response:
{
  "success": true,
  "data": {
    "device_id": "DEVICE_001",
    "status": "offline",
    "device_token": "eyJhbGci...",  // Token for subsequent device APIs
    "install_location": "Elder's Room"
  }
}

GET /api/v1/devices
Authorization: Bearer {access_token}

Response:
{
  "code": 1,
  "message": "The list of devices was obtained successfully",
  "data": [
    {
      "device_id": "DEVICE_001",
      "install_location": "Elder's Room",
      "status": "online",
      "last_active": "2024-03-20T10:00:00Z"
    }
  ]
}

No Device Response:
{
  "code": 0,
  "message": "no bound devices",
  "data": null
}

Error Response:
{
  "code": -1,
  "message": "Failed to obtain the device list",
  "error": "Error details"
}

PUT /api/v1/devices/status
Authorization: Bearer {access_token}
Content-Type: application/json

Request Body:
{
  "status": "online"  // Required, must be online or offline
}

Response:
{
  "device_id": "DEVICE_001",
  "status": "online",
  "last_active": "2024-03-20T10:00:00Z"
}

Error Response:
{
  "error": "No device found for user"
}

DELETE /api/v1/devices
Authorization: Bearer {access_token}

Response:
{
  "message": "Device deleted successfully"
}

Error Response:
{
  "error": "No device found for user"
}

POST /api/v1/devices/event
Authorization: Device {device_token}
Content-Type: application/json

Request Body:
{
  "device_id": "DEVICE_001",    // Required
  "event_type": "fall",         // Required, must be fall, abnormal, or other
  "event_time": "2024-03-20T10:00:00Z",  // Required, ISO format
  "confidence": 0.95,           // Required, between 0-1
  "image_path": "/images/DEVICE_001/1234567890.jpg",  // Optional
  "video_path": "/videos/DEVICE_001/1234567890.mp4",  // Optional
  "alarm_message": "Fall detected"  // Optional
}

Response:
{
  "success": true,
  "data": {
    "alarm_id": 2,
    "device_id": "DEVICE_001",
    "event_type": "fall",
    "event_time": "2024-03-20T10:00:00.000Z",
    "confidence": 0.95,
    "handled": false,
    "video_path": "test.mp4",
    "created_at": "2024-03-20T10:00:00.000Z"
  }
}
```

### 3. Alarm Management [Verified]
```
GET /api/v1/alarms
Authorization: Bearer {access_token}
Query Parameters:
- from: Start time (ISO format)
- to: End time (ISO format, must be greater than from)
- status: Alarm status (must be handled or unhandled)
- device_id: Device ID
- minConfidence: Minimum confidence (between 0-1)

Response:
{
  "success": true,
  "data": {
    "alarms": [
      {
        "alarm_id": "42",
        "device_id": "DEVICE_001",
        "event_type": "fall",
        "event_time": "2024-03-20T10:00:00Z",
        "confidence": 0.95,
        "image_path": "/images/DEVICE_001/1234567890.jpg",
        "video_path": "/videos/DEVICE_001/1234567890.mp4",
        "alarm_message": "Fall detected",
        "handled": false,
        "created_at": "2024-03-20T10:00:00Z",
        "device": {
          "device_name": "Living Room Camera",
          "install_location": "Elder's Room"
        }
      }
    ],
    "total": 1
  }
}

GET /api/v1/alarms/{alarmId}
Authorization: Bearer {access_token}

Response:
{
  "success": true,
  "data": {
    "alarm_id": "42",
    "device_id": "DEVICE_001",
    "event_type": "fall",
    "event_time": "2024-03-20T10:00:00Z",
    "confidence": 0.95,
    "image_path": "/images/DEVICE_001/1234567890.jpg",
    "video_path": "/videos/DEVICE_001/1234567890.mp4",
    "alarm_message": "Fall detected",
    "handled": false,
    "created_at": "2024-03-20T10:00:00Z",
    "device": {
      "device_name": "Living Room Camera",
      "install_location": "Elder's Room"
    },
    "video": {
      "video_id": 1,
      "video_path": "/videos/DEVICE_001/1234567890.mp4",
      "duration": 30,
      "format": "mp4"
    }
  }
}

POST /api/v1/alarms/{alarmId}/ack
Authorization: Bearer {access_token}
Content-Type: application/json

Request Body:
{
  "action": "confirm",  // Required, must be confirm or dismiss
  "message": "Family notified"  // Optional, maximum 255 characters
}

Response:
{
  "success": true,
  "message": "Alarm acknowledged successfully"
}
```

### 4. User Management [Verified]
```
GET /api/v1/users/me
Authorization: Bearer {access_token}

Response:
{
  "success": true,
  "data": {
    "id": 1,
    "username": "user123"
  }
}

Error Response:
{
  "error": "User not found",
  "details": "The specified user does not exist"
}

PUT /api/v1/users/me/username
Authorization: Bearer {access_token}
Content-Type: application/json

Request Body:
{
  "newUsername": "newuser123"  // Required, 3-30 characters
}

Response:
{
  "success": true,
  "message": "Username updated successfully",
  "data": {
    "id": 1,
    "username": "newuser123"
  }
}

Error Response:
{
  "error": "Username already exists",
  "details": "The new username is already taken"
}

Validation Error Response:
{
  "errors": [
    {
      "field": "body.newUsername",
      "message": "Username must be at least 3 characters long"
    }
  ]
}

PUT /api/v1/users/me/password
Authorization: Bearer {access_token}
Content-Type: application/json

Request Body:
{
  "newPassword": "newpassword123"  // Required, minimum 6 characters
}

Response:
{
  "success": true,
  "message": "Password updated successfully"
}

Validation Error Response:
{
  "errors": [
    {
      "field": "body.newPassword",
      "message": "Password must be at least 6 characters long"
    }
  ]
}

DELETE /api/v1/users/me
Authorization: Bearer {access_token}

Response:
{
  "success": true,
  "message": "User deleted successfully"
}

Error Response:
{
  "error": "Failed to delete user",
  "details": "Error details"
}
```

### 5. Feedback Management [Verified]
```
POST /api/v1/feedback
Authorization: Bearer {access_token}
Content-Type: application/json

Request Body:
{
  "rating": 4,                    // Required, integer between 0-5
  "content": "App is great, interface is clean"  // Optional, maximum 1000 characters
}

Response:
{
  "success": true,
  "message": "Feedback submitted successfully",
  "data": {
    "feedback_id": 1,
    "rating": 4,
    "content": "App is great, interface is clean",
    "created_at": "2024-03-20T10:00:00.000Z"
  }
}

Validation Error Response:
{
  "errors": [
    {
      "field": "body.rating",
      "message": "Rating must be at least 0"
    }
  ]
}

GET /api/v1/feedback
Authorization: Bearer {access_token}

Response:
{
  "success": true,
  "data": {
    "feedback_id": 1,
    "rating": 4,
    "content": "App is great, interface is clean",
    "created_at": "2024-03-20T10:00:00.000Z"
  }
}

No Feedback Response:
{
  "error": "No feedback found",
  "details": "User has not submitted any feedback yet"
}
```

### 6. Media File Management [Verified]
```
POST /api/v1/media/upload
Authorization: Bearer {access_token}
Content-Type: multipart/form-data

Request Body:
- file: File (required, maximum 50MB)
- type: File type (optional, default is images)
- device_id: Device ID (required)

Response:
{
  "success": true,
  "data": {
    "path": "/images/DEVICE_001/1234567890.jpg",
    "size": 1024000,
    "type": "images"
  }
}

Error Response:
{
  "error": "No file uploaded"
}

{
  "error": "Device ID is required"
}

GET /api/v1/media/:type/:deviceId/:filename
Authorization: Bearer {access_token}

Response:
- Directly returns file content, Content-Type automatically set based on file extension

Error Response:
{
  "error": "File not found"
}
```

## III. General Information

### Health Check [Verified]
```
GET /health

Response:
{
  "status": "OK"
}

Error Response:
{
  "error": "Internal Server Error",
  "details": "Error details"
}
```

### Authentication Methods
- User Authentication: Bearer Token
  - Format: `Authorization: Bearer {token}`
  - Validity: 15 minutes
  - Purpose: Access protected API resources
- User Refresh: Refresh Token
  - Format: Request body parameter `{"refreshToken": "token"}`
  - Validity: 7 days
  - Purpose: Refresh expired access token without re-login
- Device Authentication: Device Token
  - Format: `Authorization: Device {token}`
  - Validity: 90 days
  - Purpose: Device authentication for backend service interaction
  - Refresh: Through `/api/v1/devices/refresh-token` using device ID and secret
- Password Reset: Reset Token
  - Format: URL parameter `/api/v1/auth/reset-password/{token}`
  - Validity: 1 hour
  - Purpose: Secure password reset when forgotten

### Important Change Notes
**User-Device Relationship Updated to One-to-One:**
- Each user can only bind to one device
- Device registration checks if user already has a bound device
- Device unbinding and deletion operations no longer require device ID specification
- API routes simplified, device ID parameters removed

### File Storage Information
1. Basic Directory Structure:
   - Upload Directory: `/uploads/`
     - Image Upload: `/uploads/images/{device_id}/{timestamp}.jpg`
     - Video Upload: `/uploads/videos/{device_id}/{timestamp}.mp4`
   - Public Directory: `/public/`
     - Static File Service

2. File Naming Rules:
   - Images: `{timestamp}.jpg`
   - Videos: `{timestamp}.mp4`

3. Access URLs:
   - Images: `http://{domain}/api/v1/media/images/{device_id}/{filename}`
   - Videos: `http://{domain}/api/v1/media/videos/{device_id}/{filename}` 