#!/bin/bash

# 设置颜色输出
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 基础URL
BASE_URL="http://localhost:3000/api/v1"

# 测试状态存储
USER_ID=""
ACCESS_TOKEN=""
DEVICE_ID="TEST_DEVICE_001"
DEVICE_SECRET="test_secret_123"
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
    
    echo -e "\n${YELLOW}请求详情:${NC}"
    echo "方法: $method"
    echo "URL: $BASE_URL$endpoint"
    if [ ! -z "$data" ]; then
        echo "数据: $data"
    fi
    
    response=$(curl -s -X $method "$BASE_URL$endpoint" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $ACCESS_TOKEN" \
        -d "$data")
    
    if [ $? -eq 0 ]; then
        print_response "$response"
        echo "$response"
    else
        print_error "请求失败"
        return 1
    fi
}

# 1. 测试用户注册
print_message "\n1. 测试用户注册"
response=$(send_request "POST" "/auth/register" '{
    "username": "testuser3",
    "password": "test123456",
    "name": "Test User 3",
    "contact_info": "test3@example.com"
}')

if [ $? -eq 0 ]; then
    USER_ID=$(echo $response | grep -o '"user_id":[0-9]*' | cut -d':' -f2)
    print_message "注册成功，用户ID: $USER_ID"
else
    print_error "注册失败"
    exit 1
fi

# 2. 测试用户登录
print_message "\n2. 测试用户登录"
response=$(send_request "POST" "/auth/login" '{
    "username": "testuser3",
    "password": "test123456"
}')

if [ $? -eq 0 ]; then
    ACCESS_TOKEN=$(echo $response | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
    print_message "登录成功"
    print_message "Token: $ACCESS_TOKEN"
else
    print_error "登录失败"
    exit 1
fi

# 3. 测试获取设备信息
print_message "\n3. 测试获取设备信息"
response=$(send_request "GET" "/device")

if [ $? -eq 0 ]; then
    print_message "设备信息获取成功"
    DEVICE_COUNT=$(echo $response | grep -o '"device_id":"[^"]*' | wc -l)
    print_message "设备数量: $DEVICE_COUNT"
else
    print_error "获取设备信息失败"
    exit 1
fi

# 4. 测试获取告警列表
print_message "\n4. 测试获取告警列表"
response=$(send_request "GET" "/alarms?limit=10&handled=0")

if [ $? -eq 0 ]; then
    ALARM_ID=$(echo $response | grep -o '"alarm_id":[0-9]*' | head -1 | cut -d':' -f2)
    print_message "告警列表获取成功"
    ALARM_COUNT=$(echo $response | grep -o '"alarm_id":[0-9]*' | wc -l)
    print_message "告警数量: $ALARM_COUNT"
    if [ ! -z "$ALARM_ID" ]; then
        print_message "找到告警ID: $ALARM_ID"
    else
        print_message "没有找到告警记录"
    fi
else
    print_error "获取告警列表失败"
    exit 1
fi

# 5. 如果有告警ID，测试获取告警详情
if [ ! -z "$ALARM_ID" ]; then
    print_message "\n5. 测试获取告警详情"
    response=$(send_request "GET" "/alarms/$ALARM_ID")
    
    if [ $? -eq 0 ]; then
        print_message "告警详情获取成功"
        
        # 6. 测试确认告警
        print_message "\n6. 测试确认告警"
        response=$(send_request "POST" "/alarms/$ALARM_ID/ack")
        
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
else
    print_message "\n5. 跳过告警详情和确认测试（没有告警记录）"
fi

print_message "\n所有测试完成！" 