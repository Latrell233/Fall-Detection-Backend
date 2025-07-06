# Database Structure

### Users Table (users)
| Field Name | Type | Description | Constraints |
|------------|------|-------------|-------------|
| user_id | INTEGER | User ID | Primary Key, Auto-increment |
| username | VARCHAR(255) | Username | Not Null, Unique |
| password_hash | VARCHAR(255) | Password Hash | Not Null |
| reset_token | VARCHAR(255) | Password Reset Token | Nullable |
| created_at | TIMESTAMP | Creation Time | Default Current Time |
| updated_at | TIMESTAMP | Update Time | Default Current Time |

### Devices Table (devices)
| Field Name | Type | Description | Constraints |
|------------|------|-------------|-------------|
| device_id | VARCHAR(255) | Device ID | Primary Key |
| user_id | INTEGER | User ID | Foreign Key to users table, Unique constraint (one-to-one relationship) |
| install_location | VARCHAR(255) | Installation Location | Not Null |
| device_secret | VARCHAR(255) | Device Secret | Not Null |
| status | VARCHAR(255) | Device Status | Not Null, Default 'offline' |
| last_active | TIMESTAMP | Last Active Time | Default Current Time |
| config_json | JSONB | Device Configuration Information | Default Empty Object |
| created_at | TIMESTAMP | Creation Time | Default Current Time |
| updated_at | TIMESTAMP | Update Time | Default Current Time |

### Alarm Records Table (alarm_records)
| Field Name | Type | Description | Constraints |
|------------|------|-------------|-------------|
| alarm_id | BIGINT | Alarm ID | Primary Key, Auto-increment |
| device_id | VARCHAR(50) | Device ID | Foreign Key to devices table |
| user_id | INTEGER | User ID | Foreign Key to users table |
| event_type | VARCHAR(20) | Event Type | Not Null (fall, abnormal, other) |
| event_time | TIMESTAMP | Event Time | Not Null |
| image_path | VARCHAR(255) | Image Path | Nullable |
| video_path | VARCHAR(255) | Video Path | Nullable |
| confidence | FLOAT | Confidence Level | Nullable, between 0-1 |
| handled | BOOLEAN | Processing Status | Default false |
| alarm_message | TEXT | Alarm Message | Nullable |
| created_at | TIMESTAMP | Creation Time | Default Current Time |
| updated_at | TIMESTAMP | Update Time | Default Current Time |

### Videos Table (videos)
| Field Name | Type | Description | Constraints |
|------------|------|-------------|-------------|
| video_id | BIGINT | Video ID | Primary Key, Auto-increment |
| alarm_id | BIGINT | Alarm ID | Foreign Key to alarm_records table |
| device_id | VARCHAR(50) | Device ID | Foreign Key to devices table |
| start_time | TIMESTAMP | Start Time | Not Null |
| duration | INTEGER | Duration (seconds) | Not Null |
| video_path | VARCHAR(255) | File Path | Not Null |
| file_size | INTEGER | File Size (bytes) | Nullable |
| format | VARCHAR(50) | Video Format | Nullable |
| created_at | TIMESTAMP | Creation Time | Default Current Time |
| updated_at | TIMESTAMP | Update Time | Default Current Time |

### Feedback Table (feedbacks)
| Field Name | Type | Description | Constraints |
|------------|------|-------------|-------------|
| feedback_id | INTEGER | Feedback ID | Primary Key, Auto-increment |
| user_id | INTEGER | User ID | Foreign Key to users table |
| rating | INTEGER | Rating | Not Null, between 0-5 |
| content | TEXT | Feedback Content | Nullable |
| created_at | TIMESTAMP | Creation Time | Default Current Time |
| updated_at | TIMESTAMP | Update Time | Default Current Time |

### Table Name Notes
Due to Sequelize configuration with `underscored: true`, all table names are automatically converted to plural form:
- User → users
- Device → devices  
- AlarmRecord → alarm_records
- Video → videos
- Feedback → feedbacks

### Table Relationships
1. **users** (1) ←→ (1) **devices** - One-to-One Relationship
   - Each user can only bind to one device
   - Each device can only bind to one user
   - Connected through `devices.user_id`

2. **devices** (1) ←→ (N) **alarm_records** - One-to-Many Relationship
   - One device can generate multiple alarm records
   - Connected through `alarm_records.device_id`

3. **users** (1) ←→ (N) **alarm_records** - One-to-Many Relationship
   - One user can have multiple alarm records
   - Connected through `alarm_records.user_id`

4. **alarm_records** (1) ←→ (1) **videos** - One-to-One Relationship
   - One alarm record corresponds to one video file
   - Connected through `videos.alarm_id`

5. **users** (1) ←→ (N) **feedbacks** - One-to-Many Relationship
   - One user can submit multiple feedbacks
   - Connected through `feedbacks.user_id`

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

4. File Processing Flow:
   - Device uploads file to temporary directory
   - Backend validates file and moves to target directory
   - Database stores relative path
   - File access service provided through API

### Important Change Notes
1. **Removed device_name field** - Device model in actual code doesn't have this field
2. **Added feedbacks table** - Feedback model exists in actual code
3. **Corrected field constraints** - Updated based on actual Sequelize model definitions
4. **Updated relationships** - Reflects actual one-to-one user-device relationship
5. **Corrected file storage information** - Updated based on actual media file API implementation 