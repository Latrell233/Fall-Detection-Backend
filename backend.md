这是一个服务器后端项目，提供api接口，用于处理来自嵌入式设备/手机app客户端的用户注册、设备注册、设备心跳、事件上报、事件查询等请求。
项目使用Node.js和Express框架，数据库使用PostgreSQL。数据库，后端服务，以及用于接受mqtt消息的emqx服务端都分别运行在docker容器中，需要设计好docker-compose.yml文件，将所有服务容器启动起来。
将所有参数配置以及说明写在config.js文件中，方便修改。
项目结构如下：

## 2. 移动APP后端数据库结构设计


针对"一名APP用户绑定一台设备"的场景，设计云平台后台的数据库Schema，以MySQL关系数据库为例。数据库包含以下主要数据表：用户信息表、设备信息表、报警记录表、历史视频数据表（以及可能的关联表）。下面给出各表结构（字段、类型）及其含义与关系：

- **用户信息表（users）**：存储系统中的用户账户信息。每条记录代表一个用户。
    
    - `user_id` (INT AUTO_INCREMENT) – 用户主键ID，唯一标识用户。
        
    - `username` (VARCHAR(50) UNIQUE NOT NULL) – 用户登录名，要求唯一。
        
    - `password_hash` (VARCHAR(100) NOT NULL) – 用户密码的哈希值（存储加密后的密码）。
        
    - `name` (VARCHAR(100)) – 用户的姓名（或昵称）。
        
    - `contact_info` (VARCHAR(100)) – 联系方式，例如手机号或邮箱，用于告警通知等。
        
    - `register_time` (DATETIME NOT NULL) – 用户注册时间。
        
    - （索引：以`username`为唯一索引，用于快速登录查找。）
        
- **设备信息表（devices）**：存储每台嵌入式设备的信息。每条记录代表一台物理设备。
    
    - `device_id` (VARCHAR(50) NOT NULL) – 设备唯一标识符，可以使用设备序列号、MAC地址或自定义ID。长度根据实际需要设定，设为主键。
        
    - `device_name` (VARCHAR(100)) – 设备名称/备注，例如"客厅摄像头"。由用户自定义命名以便区分。
        
    - `user_id` (INT NOT NULL) – 外键，指向绑定此设备的用户的ID（关联到用户信息表的`user_id`）。因为假设一名用户绑定一台设备，所以这是一对一关系。如果未来支持一对多，可改为多对多关联表。
        
    - `install_location` (VARCHAR(100)) – 安装位置描述，例如"老人房间"或"客厅"。
        
    - `device_secret` (VARCHAR(100)) – 设备密钥或初始令牌，用于设备注册认证（存储设备出厂提供的密钥，注册后可废弃或更新为设备Token）。
        
    - `status` (VARCHAR(20)) – 设备状态（如"online"、"offline"、"alerting"等）。可以简单存储在线离线，或存储最近一次心跳状态。
        
    - `last_active` (DATETIME) – 最后在线时间（最后一次心跳或事件上报时间）。可用于判断设备是否离线超时。
        
    - `model_version` (VARCHAR(50)) – 当前设备上运行的模型/固件版本号，便于管理升级。
        
    - `config_json` (TEXT) – 设备配置信息的JSON表示（如检测阈值等）。可选字段，用于存储设备特殊配置，以备查询。
        
    
    **表间关系：**设备表通过`user_id`与用户表建立外键关联。`user_id`列建立索引，用于按用户查找设备。由于本场景一用户仅有一设备，可选择在用户表增加`device_id`字段；但为扩展性，此处采用设备表含`user_id`的设计以支持未来一对多。
    
- **报警记录表（alarm_records）**：存储每次跌倒事件的报警记录。每条记录代表一次由设备检测到的跌倒告警事件。
    
    - `alarm_id` (BIGINT AUTO_INCREMENT) – 报警记录主键ID。使用自增ID唯一标识每条事件记录。
        
    - `device_id` (VARCHAR(50) NOT NULL) – 外键，指向发生此事件的设备ID（关联设备信息表）。便于根据设备筛选事件。
        
    - `user_id` (INT NOT NULL) – 冗余存储用户ID（冗余关联，以方便按用户查询历史报警）。也可通过设备表间接获得用户，但在一对多设备的拓展场景下，此冗余可加速查询。
        
    - `event_type` (VARCHAR(20) NOT NULL) – 事件类型，例如"fall"（跌倒）。如果未来扩展其他告警类型（如火灾、人脸识别等）可用此字段区分。
        
    - `event_time` (DATETIME NOT NULL) – 事件发生时间（由设备上传的时间戳，经云端保存）。
        
    - `image_path` (VARCHAR(255)) – 事件相关图片路径或URL（存储截图在服务器或OSS上的存储地址）。如果有多张图片，可存储主图片路径，更多图片可另建表或用JSON数组。
        
    - `video_path` (VARCHAR(255)) – 事件相关视频路径或URL（如录像片段文件地址）。如果不保存视频可为空。
        
    - `confidence` (FLOAT) – 模型判定置信度（0.0~1.0），可选记录。
        
    - `handled` (TINYINT(1) NOT NULL DEFAULT 0) – 事件处理状态标志（0表示未处理，1表示已处理）。用户查看或确认后，可将其标记为已处理。
        
    - `alarm_message` (VARCHAR(255)) – 报警信息描述，由设备或云端生成对事件的文字描述，例如"检测到老人跌倒"。
        
    - `create_time` (DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP) – 报警记录创建时间（插入数据库时间）。
        
    
    **表间关系：**`device_id`为外键关联设备信息表，从而也与用户关联。通常通过`device_id`即可知道属于哪个用户的设备，但由于一用户一设备，该用户ID基本固定。`alarm_records`表根据需要可对`device_id`、`user_id`、`event_time`等建立索引，用于按设备或用户查询近期事件。`alarm_id`是主键，提供事件的查询和引用依据。
    
- **历史视频数据表（videos）**：存储报警事件对应的视频记录元数据（如果系统保存视频片段）。每条记录对应一段视频文件。之所以单独建表，是为了对视频文件的信息进行管理（例如存储路径、长度、大小），与报警记录解耦，以便有的报警可能没有视频。
    
    - `video_id` (BIGINT AUTO_INCREMENT) – 视频记录主键ID。
        
    - `alarm_id` (BIGINT) – 外键，关联对应的报警记录ID（一个报警事件可能对应0或1段视频）。一对一关系，alarm_records若有视频则videos表有相应记录。
        
    - `device_id` (VARCHAR(50) NOT NULL) – 外键，冗余存储设备ID（也可通过报警表间接获取，但存储以方便查询所有视频）。
        
    - `start_time` (DATETIME NOT NULL) – 视频开始时间，例如录像片段开始录制的时间（通常略早于事件时间，用于提供事件前片段）。
        
    - `duration` (INT NOT NULL) – 视频时长（秒）。
        
    - `file_path` (VARCHAR(255) NOT NULL) – 视频文件存储路径或URL。
        
    - `file_size` (INT) – 视频文件大小（字节），可选记录用于了解文件大小。
        
    - `format` (VARCHAR(50)) – 视频格式/编码信息（例如"MP4(H.264)"）。
        
    
    **表间关系：**`videos`表通过`alarm_id`与`alarm_records`表建立外键关联（可在videos.alarm_id上建立唯一索引，确保一事件至多一视频）。通过`device_id`也关联设备表（可选的冗余）。在一用户一设备场景下，也可通过视频找到唯一的用户。
    

此外，还可以有一些辅助表，根据需求设计：

- **用户-设备绑定关系表（user_device）**：如果未来需要支持一位用户绑定多设备或一设备被多个用户监控的情况，可增加此中间表。当前场景下一对一，可暂不使用。
    
- **Token表**（或会话表）：存储用户登录会话的令牌、过期时间等，用于服务端验证用户Token有效性（如果采用有状态Token机制）。设备的长期访问令牌也可存在此表。若使用JWT等无状态令牌可不需要这张表。
    
- **设备心跳日志表**：记录设备每次心跳上报时间及状态（如果需要保存历史）。简单起见当前不单独存历史心跳，只在设备表维护最后一次心跳时间。
    
- **告警处理记录表**：如果需要记录每次告警由谁在何时处理（确认/清除）的细节，可以建立此表，包含alarm_id、处理用户、处理时间、处理备注等。当前可通过更新alarm_records的handled和在应用日志中记录操作达到目的，独立表视需求决定。
    

**字段命名与含义小结：**上述表遵循MySQL InnoDB引擎设计，使用外键维护参照完整性。其中，各表关键字段如user_id、device_id、alarm_id在整个数据库中能唯一标识用户、设备、事件，实现关联。通过这些表的组合，系统可完成如下映射关系：

- 从用户表查到用户基本信息，结合设备表获知该用户绑定的设备及设备状态；
    
- 从设备表定位设备，再查报警记录表获取该设备产生的所有跌倒报警事件；
    
- 从报警记录表查具体事件详情，并通过其中的媒体路径或关联视频表获取相应的图像、视频内容。
    

数据库中的`user_id`和`device_id`等字段应建立必要的索引，加速查询。例如alarm_records上的(device_id, event_time)索引可按设备快速检索最近事件。由于用户与设备是一对一关系，也可仅使用user_id在alarm_records上索引来查询某用户的所有事件。

下面给出主要表的示例建表SQL定义（MySQL风格）以供参考：

sql

复制编辑

`-- 用户信息表 CREATE TABLE users (     user_id        INT AUTO_INCREMENT PRIMARY KEY,     username       VARCHAR(50) NOT NULL UNIQUE,     password_hash  VARCHAR(100) NOT NULL,     name           VARCHAR(100),     contact_info   VARCHAR(100),     register_time  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP );  -- 设备信息表 CREATE TABLE devices (     device_id      VARCHAR(50) PRIMARY KEY,     device_name    VARCHAR(100),     user_id        INT NOT NULL,     install_location VARCHAR(100),     device_secret  VARCHAR(100),     status         VARCHAR(20),     last_active    DATETIME,     model_version  VARCHAR(50),     config_json    TEXT,     FOREIGN KEY (user_id) REFERENCES users(user_id) );  -- 报警记录表 CREATE TABLE alarm_records (     alarm_id     BIGINT AUTO_INCREMENT PRIMARY KEY,     device_id    VARCHAR(50) NOT NULL,     user_id      INT NOT NULL,     event_type   VARCHAR(20) NOT NULL,     event_time   DATETIME NOT NULL,     image_path   VARCHAR(255),     video_path   VARCHAR(255),     confidence   FLOAT,     handled      TINYINT(1) NOT NULL DEFAULT 0,     alarm_message VARCHAR(255),     create_time  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,     FOREIGN KEY (device_id) REFERENCES devices(device_id),     FOREIGN KEY (user_id) REFERENCES users(user_id)     -- 如需支持事务完整性，可以加上 ON DELETE CASCADE 等约束，根据需求决定 );  -- 视频数据表 CREATE TABLE videos (     video_id    BIGINT AUTO_INCREMENT PRIMARY KEY,     alarm_id    BIGINT,     device_id   VARCHAR(50) NOT NULL,     start_time  DATETIME NOT NULL,     duration    INT NOT NULL,     file_path   VARCHAR(255) NOT NULL,     file_size   INT,     format      VARCHAR(50),     FOREIGN KEY (alarm_id) REFERENCES alarm_records(alarm_id),     FOREIGN KEY (device_id) REFERENCES devices(device_id) );`

以上数据库结构满足基本的功能需求。在应用实现中，可以根据实际需要进行调整和优化（如拆分读写库、增加缓存等），但就**一个用户绑定一个设备**的简单场景而言，这样的结构已经较为清晰地表达了用户、设备、报警、视频之间的关系。

## 3. API 接口清单

结合上述数据流和数据库设计，下面设计各部分之间交互所需的API接口列表，包括接口路径、HTTP方法、请求参数、响应格式、权限控制要求，以及示例请求与响应。为了清晰起见，我们将接口按作用对象分类：

### 3.1 云平台提供给嵌入式设备的接口

这些接口由嵌入式设备调用，云平台提供服务。例如设备获取配置、获取云端命令等。通常需要**设备身份认证**（例如设备ID + 密钥或注册后获取的Token）。

- **GET /api/device/config** – **设备获取配置**
    
    - **功能：**设备启动后或定期调用此接口，从云平台获取当前配置参数和状态信息。包括检测灵敏度阈值、报警间隔、是否启用录像等设置。云端可根据设备ID返回针对该设备/用户的个性化配置。
        
    - **请求参数：**
        
        - **Query:** `device_id`（字符串，设备ID）
            
        - **Headers:** `Authorization: Bearer <device_token>`（设备认证令牌）
            
    - **响应格式：**JSON 对象，包含设备配置各字段。例如：
        
        json
        
        复制编辑
        
        `{   "device_id": "DEVICE_001",   "threshold": 0.8,   "record_video": true,   "video_length_sec": 10,   "server_time": "2025-05-04T06:14:30Z" }`
        
        字段说明：`threshold`检测阈值，`record_video`是否需要设备录制视频，`video_length_sec`录像长度秒数，`server_time`为云端当前时间方便设备校准。云端还可下发其他配置，如模型版本号等。
        
    - **权限控制：**需要设备凭证认证。设备应提前在云平台注册获取`<device_token>`（例如设备首次注册时由云端签发JWT或其它Token）。如果认证失败返回401 Unauthorized。
        
    - **示例请求：**`GET /api/device/config?device_id=DEVICE_001`，Header: `Authorization: Bearer eyJhbGciOiJI...`
        
    - **示例响应：**(HTTP 200 OK)
        
        json
        
        复制编辑
        
        `{   "device_id": "DEVICE_001",   "threshold": 0.8,   "record_video": true,   "video_length_sec": 10,   "server_time": "2025-05-04T06:14:30Z" }`
        
- **GET /api/device/commands** – **设备获取待执行命令**
    
    - **功能：**云平台下发给设备的远程指令获取接口。设备定期调用该接口查看云端是否有待执行的指令（例如远程重启、升级固件、调整参数等）。云平台返回指令列表并在设备确认后标记指令已下发。
        
    - **请求参数：**
        
        - **Query:** `device_id`（设备ID）
            
        - **Headers:** `Authorization: Bearer <device_token>`
            
    - **响应格式：**JSON，包含零个或多个命令对象的数组。例如：
        
        json
        
        复制编辑
        
        `{   "device_id": "DEVICE_001",   "commands": [     {       "cmd_id": 123,       "type": "update_threshold",       "params": { "threshold": 0.9 }     }   ] }`
        
        如果没有命令则`commands`数组为空。每个命令含命令ID、类型和参数等字段。上例表示有一条更新阈值的命令，将threshold改为0.9。设备拿到命令后应执行相应操作（比如更新本地配置），然后可以通过另一个接口回传执行结果。
        
    - **权限控制：**需要设备Token认证。
        
    - **示例请求：**`GET /api/device/commands?device_id=DEVICE_001`，Header带设备授权。
        
    - **示例响应：**
        
        json
        
        复制编辑
        
        `{   "device_id": "DEVICE_001",   "commands": [     {       "cmd_id": 123,       "type": "update_threshold",       "params": { "threshold": 0.9 }     }   ] }`
        
- **POST /api/device/ack** – **设备命令执行结果回执**
    
    - **功能：**设备调用此接口向云端确认已收到并执行某项云端下发的命令。用于云平台了解执行情况。
        
    - **请求参数：**
        
        - **Headers:** `Authorization: Bearer <device_token>`
            
        - **Body(JSON):** 包含设备ID及命令执行结果，例如：
            
            json
            
            复制编辑
            
            `{   "device_id": "DEVICE_001",   "cmd_id": 123,   "status": "success",   "result": "threshold updated to 0.9" }`
            
            这里`status`可以是"success"或"failure"，`result`提供附加信息或错误原因。
            
    - **响应格式：**JSON 确认，例如`{ "ack": true }`表示云端记录成功。
        
    - **权限控制：**需设备认证。
        
    - **示例请求：**
        
        bash
        
        复制编辑
        
        `POST /api/device/ack  Authorization: Bearer <device_token> {   "device_id": "DEVICE_001",   "cmd_id": 123,   "status": "success",   "result": "threshold updated to 0.9" }`
        
    - **示例响应：**
        
        json
        
        复制编辑
        
        `{ "ack": true }`
        

_注：根据具体需求，"配置获取"和"命令获取"也可以合并在一个接口，如设备每次请求同时获得配置更新和命令列表。但此处分开描述便于理解。_

### 3.2 嵌入式设备上传至云平台的接口

这些接口由嵌入式设备调用，用于将数据传给云平台，包括设备注册、状态心跳和事件上报等。每个请求同样需要认证，以确保是合法设备发送。

- **POST /api/device/register** – **设备注册并绑定**
    
    - **功能：**嵌入式设备首次接入时注册到云平台并绑定到当前用户。设备提供自身标识和安全凭证完成身份验证，云平台记录设备并生成访问令牌。
        
    - **请求参数：**
        
        - **Headers:** `Authorization: Bearer <user_token>`（用户认证令牌）
            
        - **Body(JSON):** 提交设备标识和密钥，例如：
            
            json
            
            复制编辑
            
            `{   "device_id": "DEVICE_001",   "device_secret": "abcd1234",   "device_name": "客厅摄像头",   "model_version": "v1.0" }`
            
            其中`device_secret`是设备出厂预置的安全密钥或注册码，云端提前保存于设备信息表的`device_secret`字段，用于验证。也可以使用其他认证机制（如证书等）。
            
    - **响应格式：**JSON，包含注册结果和设备后续访问凭证。例如：
        
        json
        
        复制编辑
        
        `{   "device_id": "DEVICE_001",   "device_name": "客厅摄像头",   "status": "offline",   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." }`
        
        字段说明：`device_id`设备ID，`device_name`设备名称，`status`设备状态，`token`为云端颁发的设备认证令牌（用于之后调用受保护接口）。如果注册失败（如密钥不匹配或设备已被绑定），返回错误信息。
        
    - **权限控制：**需要用户token认证，确保只有已登录用户才能注册和绑定设备。
        
    - **示例请求：**
        
        bash
        
        复制编辑
        
        `POST /api/device/register  Authorization: Bearer <user_token> {   "device_id": "DEVICE_001",   "device_secret": "abcd1234",   "device_name": "客厅摄像头",   "model_version": "v1.0" }`
        
    - **示例响应：**
        
        json
        
        复制编辑
        
        `{   "device_id": "DEVICE_001",   "device_name": "客厅摄像头",   "status": "offline",   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." }`
        
- **POST /api/device/heartbeat** – **设备心跳**
    
    - **功能：**嵌入式设备定期发送心跳包，通知云平台自己仍然在线，并可附带当前状态。云平台更新设备最后活动时间，并可在APP上反映在线状态。
        
    - **请求参数:**
        
        - **Headers:** `Authorization: Bearer <device_token>`
            
        - **Body(JSON):** 包含设备状态信息，例如：
            
            json
            
            复制编辑
            
            `{   "device_id": "DEVICE_001",   "timestamp": "2025-05-04T06:15:00Z",   "status": "online",   "temp": 45.2 }`
            
            字段说明：`status`可以是online/offline/standby等状态字符串，`temp`示例为设备温度。可以根据需要扩展更多字段，如CPU利用率、电池电量等。
            
    - **响应格式：**JSON 确认，例如`{ "received": true }`。服务器也可返回指示信息，如要求设备频率或配置更新提示，这里简化为确认接收。
        
    - **权限控制：**需设备token认证。
        
    - **示例请求：**
        
        bash
        
        复制编辑
        
        `POST /api/device/heartbeat  Authorization: Bearer <device_token> {   "device_id": "DEVICE_001",   "timestamp": "2025-05-04T06:15:00Z",   "status": "online",   "temp": 45.2 }`
        
    - **示例响应：**`{"received": true}` （表示服务器已更新状态）
        
- **POST /api/device/event** – **跌倒事件上报**
    
    - **功能：**嵌入式设备检测到跌倒事件时调用此接口，将事件信息和相关媒体上传云平台，触发告警。
        
    - **请求参数：**
        
        - **Headers:** `Authorization: Bearer <device_token>`
            
        - **Body:** 可以使用`multipart/form-data`上传，包含JSON字段和文件。主要字段：
            
            - `device_id` (字符串) – 设备ID
                
            - `event_type` (字符串) – 事件类型，一般为"fall"
                
            - `timestamp` (字符串) – 事件发生时间ISO格式
                
            - `confidence` (数字) – 置信度（可选）
                
            - `image_file` (文件) – 跌倒时刻截图图片文件（JPEG/PNG）
                
            - `video_file` (文件，可选) – 跌倒事件视频片段（MP4）
                
            - 其他：如果不用multipart，也可以全JSON，其中图像用Base64字符串`image_base64`，视频用例如`video_url`字段（需设备先上传视频到公共URL）。
                
        
        例如使用multipart时，JSON字段组成部分示例：
        
        ini
        
        复制编辑
        
        `device_id=DEVICE_001 event_type=fall timestamp=2025-05-04T06:14:00Z confidence=0.95 image_file=<上传的JPEG文件> video_file=<上传的MP4文件>`
        
        或者JSON请求体示例（图像Base64方式）：
        
        json
        
        复制编辑
        
        `{   "device_id": "DEVICE_001",   "event_type": "fall",   "timestamp": "2025-05-04T06:14:00Z",   "confidence": 0.95,   "image_base64": "<Base64编码数据>",   "video_url": "http://cloud.example.com/upload/DEVICE_001_20250504_061400.mp4" }`
        
        云平台接收到请求后，需要将图像和视频保存（如果是multipart上传，可直接存储文件；如果是URL则可能需要服务端自行下载保存），然后在数据库中创建一条新的`alarm_records`记录和对应的`videos`记录（如果有视频）。
        
    - **响应格式：**JSON，包含云端处理结果。例如：
        
        json
        
        复制编辑
        
        `{   "saved": true,   "alarm_id": 1001,   "message": "Event recorded" }`
        
        表示事件已保存，产生了alarm_id=1001的记录。若上传失败则返回错误信息和saved=false。
        
    - **权限控制：**需要设备token认证，以确保只有合法设备才能上报事件。
        
    - **示例请求：** (multipart形式概述)
        
        pgsql
        
        复制编辑
        
        `POST /api/device/event  Authorization: Bearer <device_token> Content-Type: multipart/form-data; boundary=----WebKitFormBoundary...  ----WebKitFormBoundary... Content-Disposition: form-data; name="device_id"  DEVICE_001 ----WebKitFormBoundary... Content-Disposition: form-data; name="event_type"  fall ----WebKitFormBoundary... Content-Disposition: form-data; name="timestamp"  2025-05-04T06:14:00Z ----WebKitFormBoundary... Content-Disposition: form-data; name="confidence"  0.95 ----WebKitFormBoundary... Content-Disposition: form-data; name="image_file"; filename="frame.jpg" Content-Type: image/jpeg  <二进制图片数据> ----WebKitFormBoundary... Content-Disposition: form-data; name="video_file"; filename="event.mp4" Content-Type: video/mp4  <二进制视频数据> ----WebKitFormBoundary...--`
        
    - **示例响应：**(HTTP 200)
        
        json
        
        复制编辑
        
        `{   "saved": true,   "alarm_id": 1001,   "message": "Event recorded" }`
        
        云平台收到此请求后，会立即在服务器端：存储上传的媒体文件（例如保存到`/media/DEVICE_001_20250504_061400.jpg`和`.mp4`），在数据库`alarm_records`插入新记录（包含device_id、时间等），在`videos`表插入视频记录（如果有视频，关联alarm_id）。随后云平台可能触发进一步动作，如调用通知服务推送告警给用户APP。
        

### 3.3 云平台与移动 APP 的数据交互接口

这些接口用于云平台与APP之间传递业务数据。APP通过调用这些HTTP API，与云平台交换信息，实现登录、绑定设备、查询状态和获取报警记录等功能。**权限控制**方面，移动APP用户在登录后会获得用户令牌（token），之后每次请求均需在Header中带上该token以验证用户身份和权限。以下接口假设路径以`/api`开头，为RESTful风格，响应均为JSON格式数据。

- **POST /api/user/login** – **用户登录**
    
    - **功能：**用户在APP上登录账号，使用用户名和密码换取认证令牌，以后续调用其他受保护接口。
        
    - **请求参数：**
        
        - **Body(JSON):** 包含用户名和密码，例如：
            
            json
            
            复制编辑
            
            `{   "username": "johnsmith",   "password": "mypassword" }`
            
    - **响应格式：**JSON，包含登录结果及用户Token，例如：
        
        json
        
        复制编辑
        
        `{   "success": true,   "user_id": 42,   "token": "eyJhbGciOiJIUzI1NiIs...",   "expires_in": 86400 }`
        
        字段说明：`user_id`用户ID，`token`是颁发给客户端的JWT或其他类型令牌字符串，`expires_in`是有效期（秒）。如果登录失败（用户名不存在或密码错误），返回例如：`{ "success": false, "error": "Invalid credentials" }`，不提供token。
        
    - **权限控制：**登录接口本身不需要已有token，但一旦获取token，后续接口都需要。密码应在服务端进行验证（存储的是hash）。
        
    - **示例请求：**`POST /api/user/login`，Body: `{ "username": "johnsmith", "password": "mypassword" }`
        
    - **示例响应：**
        
        json
        
        复制编辑
        
        `{   "success": true,   "user_id": 42,   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.XYZ...",   "expires_in": 86400 }`
        
- **POST /api/user/register** – **用户注册** (如需要)
    
    - **功能：**允许新用户注册账户的接口。提供用户名、密码等信息，创建新用户。
        
    - **请求参数：**
        
        - **Body(JSON):** 例如：
            
            json
            
            复制编辑
            
            `{   "username": "johnsmith",   "password": "mypassword",   "name": "John Smith",   "contact_info": "john@example.com" }`
            
            其中username和password是必填，name和contact_info为可选的个人信息。
            
    - **响应格式：**JSON，包括注册结果，如：`{ "success": true, "user_id": 42 }`。失败时返回错误信息（比如用户名已存在）。
        
    - **权限控制：**公开接口，但应有限制策略防止滥用（如验证码）。
        
    - **示例:** 省略（流程类似登录）。
        
- **POST /api/user/logout** – **用户注销**
    
    - **功能：**用户退出登录，将当前token作废。
        
    - **请求参数：**Header中携带用户的token；Body通常不需要特别内容。
        
    - **响应格式：**`{ "success": true }`表示已注销。服务器端若维护token列表，则将其标记失效。若使用JWT无状态token，可由客户端自行删除即可。
        
    - **权限控制：**需要有效的用户token才能注销自己（但也可以接受无效token调用，服务器做幂等处理）。
        
- **GET /api/user/profile** – **获取用户信息**
    
    - **功能：**登录状态下获取自己的用户资料（基本信息）。
        
    - **请求参数：**Headers带用户token。
        
    - **响应格式：**JSON，包含用户基本信息，例如：
        
        json
        
        复制编辑
        
        `{   "user_id": 42,   "username": "johnsmith",   "name": "John Smith",   "contact_info": "john@example.com",   "register_time": "2025-01-10T12:00:00Z" }`
        
    - **权限控制：**需要用户token。
        
- **POST /api/device/bind** – **设备绑定**
    
    - **功能：**将一台设备绑定到当前登录用户。由于场景是一用户一设备，此接口用于用户首次使用APP时绑定他们购买/安装的摄像头设备。绑定通常需要提供设备的唯一识别码以及安全码。
        
    - **请求参数：**
        
        - **Headers:** 用户token
            
        - **Body(JSON):** 提供设备标识及验证信息，例如：
            
            json
            
            复制编辑
            
            `{   "device_id": "DEVICE_001",   "device_secret": "abcd1234" }`
            
            `device_secret`通常是设备随机生成或出厂提供的一个PIN码/QR码，用于证明用户手上有实物设备。云平台验证`device_id`是否存在，以及secret是否匹配设备信息表中的记录且尚未被绑定。如果验证通过，则在设备表将该设备的user_id设置为当前用户，实现绑定关系建立。
            
    - **响应格式：**JSON，表示绑定结果：`{ "success": true, "message": "Device bound successfully" }`。如果失败（比如设备不存在、密钥不匹配或设备已被绑定），返回`{ "success": false, "error": "Device not found or already bound" }`。
        
    - **权限控制：**需要用户已登录(token)，且该用户当前未绑定过设备（如果业务上限制每用户只能绑定一台且已绑定则应提示）。
        
    - **示例请求：**`POST /api/device/bind`，Header带用户token，Body: `{"device_id": "DEVICE_001", "device_secret": "abcd1234"}`
        
    - **示例响应：**
        
        json
        
        复制编辑
        
        `{   "success": true,   "message": "Device bound successfully" }`
        
- **POST /api/device/unbind** – **设备解绑** (可选)
    
    - **功能：**允许用户解绑当前设备。例如用户不再使用设备或转让。
        
    - **请求参数：**Header用户token，Body可以包含device_id（若每用户只有一台也可不传）。
        
    - **响应格式：**`{ "success": true }` 解绑成功。
        
    - **权限控制：**需要用户token，并确保该用户确实绑定此设备。
        
- **GET /api/device** – **获取设备信息**
    
    - **功能：**APP获取当前绑定设备的详细信息，包括设备状态。
        
    - **请求参数：**Header用户token。因一用户一设备，可直接根据token找到用户->设备；如果一对多，可用query参数指定`device_id`或设计`GET /api/devices`返回列表。
        
    - **响应格式：**JSON，包括设备主要信息和状态，例如：
        
        json
        
        复制编辑
        
        `{   "device_id": "DEVICE_001",   "device_name": "客厅摄像头",   "install_location": "老人房间",   "status": "online",   "last_active": "2025-05-04T06:15:00Z",   "model_version": "v1.0",   "config": {     "threshold": 0.8,     "record_video": true   } }`
        
        如果设备离线，可在`status`或根据`last_active`显示。`config`可以包含对用户可见的关键配置。
        
    - **权限控制：**需要用户token，且用户只能访问自己的设备信息。
        
- **GET /api/alarms** – **获取告警事件列表**
    
    - **功能：**APP查询历史跌倒告警记录列表，用于在手机端展示事件列表。支持参数控制查询范围。
        
    - **请求参数：**
        
        - **Headers:** 用户token
            
        - **Query:** 可选参数，如`device_id`（若一用户多设备时指定设备），`limit`（条数限制，例如最近20条），`since`或`start_time`（查询某时间后的记录），`handled`（是否已处理的过滤）。在当前场景，一用户一设备，可不必传device_id，后台可据token识别用户的设备。示例：`GET /api/alarms?limit=20&handled=0` 获取未处理的最近20条。
            
    - **响应格式：**JSON 列表，每项为一个告警概要对象。例如：
        
        json
        
        复制编辑
        
        `[   {     "alarm_id": 1001,     "device_id": "DEVICE_001",     "event_type": "fall",     "event_time": "2025-05-01T08:30:00Z",     "handled": false   },   {     "alarm_id": 1000,     "device_id": "DEVICE_001",     "event_type": "fall",     "event_time": "2025-04-28T19:20:15Z",     "handled": true   } ]`
        
        列表按照时间或主键倒序。每项内容包括事件ID、类型、时间、处理标志等，可供APP列出。
        
    - **权限控制：**需要用户token，服务器据token确定user_id，只返回该用户关联设备的记录。防止跨用户访问。
        
    - **示例请求：**`GET /api/alarms?limit=5` (Header 带用户token)
        
    - **示例响应：**如上JSON数组示例。
        
- **GET /api/alarms/{alarm_id}** – **获取告警事件详情**
    
    - **功能：**获取某条具体跌倒告警的详细信息，包括发生时间、描述、以及媒体资料链接等。APP用于在详细页面展示。
        
    - **请求参数：**
        
        - **Headers:** 用户token
            
        - **URL路径:** 需要提供要查询的`alarm_id`，例如`/api/alarms/1001`。
            
    - **响应格式：**JSON对象，包含详细信息，例如：
        
        json
        
        复制编辑
        
        `{   "alarm_id": 1001,   "device_id": "DEVICE_001",   "event_type": "fall",   "event_time": "2025-05-01T08:30:00Z",   "confidence": 0.95,   "image_url": "https://cloud.example.com/media/DEVICE_001_1001.jpg",   "video_url": "https://cloud.example.com/media/DEVICE_001_1001.mp4",   "handled": false,   "alarm_message": "Detected a fall in living room" }`
        
        字段说明：`confidence`模型置信度，`image_url`告警截图URL，`video_url`视频URL（如有），`alarm_message`文字描述。当APP收到这些URL后，可以通过单独的文件下载请求获取媒体内容（如果有权限保护，需要附带用户token，或者这些URL本身带有短期令牌）。为了安全，媒体获取也可通过另一API例如`GET /api/media/{alarm_id}/image`来受控下载。简单起见这里给出直接URL。
        
    - **权限控制：**需要用户token，且请求的alarm必须属于该用户绑定的设备，否则返回404或403。
        
    - **示例请求：**`GET /api/alarms/1001` (Header 带token)
        
    - **示例响应：**如上所示JSON对象。
        
- **POST /api/alarms/{alarm_id}/ack** – **标记告警为已处理**
    
    - **功能：**用户在APP查看或处理完某告警后，调用此接口将告警标记为已处理，以免重复提示。
        
    - **请求参数：**Header用户token，URL路径提供alarm_id。Body可为空，或可选提供处理备注等。
        
    - **响应格式：**`{ "success": true }`。服务器会将alarm_records对应记录的`handled`字段置1，并记录处理时间（可扩展在alarm_records增加handled_time或通过日志记录）。
        
    - **权限控制：**需要用户token且只能处理自己的设备告警。
        
- **GET /api/device/status** – **获取设备在线状态**
    
    - **功能：**APP实时查询设备是否在线，或者获取设备当前状态（可能包括摄像头画面概览等）。
        
    - **请求参数：**Header用户token。
        
    - **响应格式：**JSON，例如：`{ "device_id": "DEVICE_001", "status": "online", "last_active": "2025-05-04T06:15:00Z" }`。也可以在`/api/device`接口中已经包含状态，所以此接口可视情况实现。
        
    - **权限控制：**用户token。
        

_注：APP与云平台的接口大部分都是用户token授权的REST API，实际实现中可以将 `/api/alarms`, `/api/device` 等归纳在例如 `/api/user/{user_id}/devices` 等路径下，但为简洁起见这里平铺展示。所有这些接口应通过HTTPS提供，并在后端验证token有效性和对应用户权限。_

### 3.4 移动 APP 后端接口（用户账户与应用功能）

此部分实际上与3.3有重叠，已包含用户登录、注册、设备绑定等典型APP后端接口。这里再归纳列出并补充说明一些APP端特有的接口或机制：

- **用户登录/注册/登出接口：**(`POST /api/user/login`, `POST /api/user/register`, `POST /api/user/logout`) – 前面已详细说明。确保密码安全传输，token生成后返回给APP保存（一般保存在本地安全存储）。登出或token过期需重新登录获取。
    
- **用户资料获取/修改接口：**(`GET /api/user/profile`, `POST /api/user/profile`) – 获取个人信息以及修改个人信息（如修改联系邮箱/电话用于通知）。修改资料需要提供要更新的字段，服务器验证并保存。
    
- **设备绑定/解绑接口：**(`POST /api/device/bind`, `POST /api/device/unbind`) – 前述说明了绑定流程。解绑接口在需要时提供，解绑后设备可重新绑定给别的用户。注意安全，解绑可以在APP操作，也可要求物理按键确认等（视产品设计）。
    
- **告警记录查询接口：**(`GET /api/alarms`, `GET /api/alarms/{id}`, `POST /api/alarms/{id}/ack`) – 提供给APP查询和更新告警处理状态，已在3.3部分说明。
    
- **历史视频查询/下载接口：**如果APP支持查看历史录像列表（例如每天的录像剪辑，不仅限于跌倒事件），可以设计类似`GET /api/videos`接口，按照日期或事件列出视频列表。当前聚焦跌倒事件，视频通过告警关联获取即可。若要单独下载视频文件，可提供`GET /api/videos/{video_id}`接口，返回视频流或下载URL。
    
- **实时视频流获取接口（扩展）：**若APP有查看实时视频的需求，典型实现方式是在设备和APP之间建立实时流通道（并非通过REST传输视频帧，因为HTTP不擅长持续大数据流）。可采用**RTSP/WebRTC**等方案。云平台可充当信令协调角色。例如APP请求`POST /api/device/start_stream`，云平台通知设备开始推流（通过commands接口或长连接），设备开始在RTSP服务器发布流，云平台返回流媒体URL给APP。APP用播放器连接RTSP。这个过程需要对接流媒体服务，属于系统扩展功能。
    


**权限与安全总结：**所有对云平台的API（无论设备端还是APP端）都需要进行权限控制，设备使用设备Token，用户使用用户Token，并且后端校验请求中的资源属于该身份。例如用户A即使知道了用户B设备的ID和报警ID，也无法通过API获取B的报警数据，因为服务器会检查token对应的用户与资源是否匹配。不符合则返回授权错误或空结果。此外，接口应做好输入校验、防止SQL注入和基本的速率限制，保证系统安全稳定。

**接口示例小结：**通过上述接口列表，嵌入式设备能够获取所需配置并上报事件，云平台将事件存储并通过API和推送通知移动APP，移动APP则可以登录后查询设备和事件信息、查看图片视频，并对告警进行处理和管理，实现完整的跌倒检测闭环功能。这些接口遵循RESTful设计风格，数据格式以JSON为主，在数据库结构支持下，实现了系统各组件之间清晰的数据通信。