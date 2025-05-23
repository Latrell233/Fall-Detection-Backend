Device Token:
user token:eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImlhdCI6MTc0ODAxMjY4OSwiZXhwIjoxNzQ4MDEzNTg5fQ.MBJSRKvohLBQN41CNWKas9ipLqm6OJDLjJt9Rxpeff8
注册：
curl -X POST http://localhost:3000/api/v1/auth/register -H "Content-Type: application/json" -d '{"username":"testuser3","password":"test123456","name":"Test User 3","contact_info":"test3@example.com"}'
登录：
curl -X POST http://localhost:3000/api/v1/auth/login -H "Content-Type: application/json" -d '{"username": "testuser3", "password": "test123456"}'
{"user":{"id":2,"username":"testuser3","name":"Test User 3","contact_info":"test3@example.com"},"accessToken":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImlhdCI6MTc0ODAxMzAwMSwiZXhwIjoxNzQ4MDEzOTAxfQ.iRpc5oATk-OaOo29911L5-rqlLEpOT3boOOTMrG1U2g","refreshToken":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImlhdCI6MTc0ODAxMzAwMSwiZXhwIjoxNzQ4NjE3ODAxfQ.VpEm9wnv4DATVKP-rueshtjjFGnaVt7M6b0hC1362jM"}
绑定设备：
curl -X POST http://localhost:3000/api/v1/device/register \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImlhdCI6MTc0ODAyNDM4NSwiZXhwIjoxNzQ4MDI1Mjg1fQ.DtQI5LCJIGWrKjsuyxFCM5poidmorX3b4JA0MGL4dqk" \
  -d '{
    "device_id": "DEVICE_001",
    "device_secret": "abcd1234",
    "device_name": "客厅摄像头",
    "model_version": "v1.0"
  }'