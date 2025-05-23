#!/bin/bash

# 设置颜色输出
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 基础URL
BASE_URL="http://localhost:3000/api/v1"

# 使用已有的设备信息
DEVICE_ID="DEVICE_1748008000"
DEVICE_TOKEN=""
USER_ID=""
ACCESS_TOKEN=""
ALARM_ID=""

# 打印带颜色的消息
print_message() {
    echo -e "${GREEN}$1${NC}"
}

print_error() {
    echo -e "${RED}$1${NC}"
}

print_response() {
    echo -e "${YELLOW}响应详情:${NC}"
    echo "$1" | python3 -m json.tool 2>/dev/null || echo "$1"
}

# 发送请求并处理响应
send_request() {
    local method=$1
    local endpoint=$2
    local data=$3
    local auth_type=$4  # "device" 或 "user"
    
    echo -e "\n${YELLOW}请求详情:${NC}"
    echo "方法: $method"
    echo "URL: $BASE_URL$endpoint"
    if [ ! -z "$data" ]; then
        echo "数据: $data"
    fi
    
    # 构建认证头
    local auth_header=""
    if [ "$auth_type" = "device" ] && [ ! -z "$DEVICE_TOKEN" ]; then
        auth_header="Authorization: Device $DEVICE_TOKEN"
    elif [ "$auth_type" = "user" ] && [ ! -z "$ACCESS_TOKEN" ]; then
        auth_header="Authorization: Bearer $ACCESS_TOKEN"
    fi
    
    echo "认证头: $auth_header"
    
    # 发送请求并捕获HTTP状态码
    if [ ! -z "$auth_header" ]; then
        response=$(curl -s -w "\n%{http_code}" -X $method "$BASE_URL$endpoint" \
            -H "Content-Type: application/json" \
            -H "$auth_header" \
            -d "$data")
    else
        response=$(curl -s -w "\n%{http_code}" -X $method "$BASE_URL$endpoint" \
            -H "Content-Type: application/json" \
            -d "$data")
    fi
    
    # 分离响应体和状态码
    http_code=$(echo "$response" | tail -n1)
    response_body=$(echo "$response" | sed '$d')
    
    echo "HTTP状态码: $http_code"
    print_response "$response_body"
    
    if [ "$http_code" -ge 200 ] && [ "$http_code" -lt 300 ]; then
        if echo "$response_body" | grep -q '"error"'; then
            error_msg=$(echo "$response_body" | grep -o '"error":"[^"]*' | cut -d'"' -f4)
            print_error "请求返回错误: $error_msg"
            print_error "完整响应内容:"
            echo "$response_body" | python3 -m json.tool 2>/dev/null || echo "$response_body"
            return 1
        fi
        echo "$response_body"
    else
        print_error "请求失败 (HTTP $http_code)"
        print_error "完整响应内容:"
        echo "$response_body" | python3 -m json.tool 2>/dev/null || echo "$response_body"
        return 1
    fi
}

# 打印测试信息
print_message "\n开始测试 - 设备ID: $DEVICE_ID"

# 1. 测试用户注册
print_message "\n1. 测试用户注册"
response=$(send_request "POST" "/auth/register" "{
    \"username\": \"testuser3\",
    \"password\": \"test123456\",
    \"name\": \"Test User 3\",
    \"contact_info\": \"test3@example.com\"
}")

if [ $? -eq 0 ]; then
    USER_ID=$(echo "$response" | grep -o '"user_id":[0-9]*' | cut -d':' -f2)
    if [ -z "$USER_ID" ]; then
        print_error "未能获取用户ID"
        exit 1
    fi
    print_message "用户注册成功，用户ID: $USER_ID"
else
    print_message "用户可能已存在，继续执行登录测试"
fi

# 2. 测试用户登录
print_message "\n2. 测试用户登录"
response=$(send_request "POST" "/auth/login" "{
    \"username\": \"testuser3\",
    \"password\": \"test123456\"
}")

if [ $? -eq 0 ]; then
    ACCESS_TOKEN=$(echo "$response" | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
    if [ -z "$ACCESS_TOKEN" ]; then
        print_error "未能获取用户Token"
        exit 1
    fi
    print_message "用户登录成功"
    print_message "用户Token: $ACCESS_TOKEN"
else
    print_error "用户登录失败"
    exit 1
fi

# 3. 测试设备注册和绑定
print_message "\n3. 测试设备注册和绑定"
print_message "使用设备ID: $DEVICE_ID"
print_message "使用设备密钥: abcd1234"
print_message "使用用户ID: $USER_ID"
print_message "使用用户Token: $ACCESS_TOKEN"

response=$(send_request "POST" "/device/bind" "{
    \"device_id\": \"$DEVICE_ID\",
    \"device_secret\": \"abcd1234\",
    \"user_id\": $USER_ID
}" "user")

if [ $? -eq 0 ]; then
    print_message "设备注册和绑定成功"
    # 获取设备token用于后续测试
    DEVICE_TOKEN=$(echo "$response" | grep -o '"device_token":"[^"]*' | cut -d'"' -f4)
    if [ ! -z "$DEVICE_TOKEN" ]; then
        print_message "设备Token: $DEVICE_TOKEN"
    fi
else
    print_error "设备注册和绑定失败"
    # 检查设备状态
    print_message "\n检查设备状态..."
    response=$(send_request "GET" "/device/info" "" "user")
    print_message "设备状态响应:"
    echo "$response" | python3 -m json.tool 2>/dev/null || echo "$response"
    exit 1
fi

# 4. 测试设备心跳
print_message "\n4. 测试设备心跳"
response=$(send_request "POST" "/device/heartbeat" "{
    \"device_id\": \"$DEVICE_ID\",
    \"timestamp\": \"$(date -u +"%Y-%m-%dT%H:%M:%SZ")\",
    \"status\": \"online\",
    \"temp\": 45.2
}" "device")

if [ $? -eq 0 ]; then
    print_message "心跳发送成功"
else
    print_error "心跳发送失败"
    exit 1
fi

# 5. 测试事件上报
print_message "\n5. 测试事件上报"
# 创建临时图片文件
echo "Test image content" > test_image.jpg

response=$(curl -s -X POST "$BASE_URL/device/event" \
    -H "Authorization: Device $DEVICE_TOKEN" \
    -F "device_id=$DEVICE_ID" \
    -F "event_type=fall" \
    -F "timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")" \
    -F "confidence=0.95" \
    -F "image_file=@test_image.jpg")

if [ $? -eq 0 ]; then
    ALARM_ID=$(echo $response | grep -o '"alarm_id":[0-9]*' | cut -d':' -f2)
    if [ -z "$ALARM_ID" ]; then
        print_error "未能获取告警ID"
        exit 1
    fi
    print_message "事件上报成功"
    print_message "告警ID: $ALARM_ID"
    # 清理临时文件
    rm test_image.jpg
else
    print_error "事件上报失败"
    exit 1
fi

# 6. 测试获取告警列表（用户端）
print_message "\n6. 测试获取告警列表"
response=$(send_request "GET" "/alarms?limit=10&handled=0" "" "user")

if [ $? -eq 0 ]; then
    print_message "告警列表获取成功"
    ALARM_COUNT=$(echo $response | grep -o '"alarm_id":[0-9]*' | wc -l)
    print_message "告警数量: $ALARM_COUNT"
else
    print_error "获取告警列表失败"
    exit 1
fi

# 7. 测试获取告警详情
if [ ! -z "$ALARM_ID" ]; then
    print_message "\n7. 测试获取告警详情"
    response=$(send_request "GET" "/alarms/$ALARM_ID" "" "user")
    
    if [ $? -eq 0 ]; then
        print_message "告警详情获取成功"
        
        # 8. 测试确认告警
        print_message "\n8. 测试确认告警"
        response=$(send_request "POST" "/alarms/$ALARM_ID/ack" "" "user")
        
        if [ $? -eq 0 ]; then
            print_message "告警确认成功"
        else
            print_error "告警确认失败"
            exit 1
        fi
    else
        print_error "获取告警详情失败"
        exit 1
    fi
fi

# 9. 测试设备解绑
print_message "\n9. 测试设备解绑"
response=$(send_request "POST" "/device/unbind" "{
    \"device_id\": \"$DEVICE_ID\"
}" "user")

if [ $? -eq 0 ]; then
    print_message "设备解绑成功"
else
    print_error "设备解绑失败"
    exit 1
fi

print_message "\n所有测试完成！" 