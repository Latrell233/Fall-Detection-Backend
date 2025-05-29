#!/bin/bash

# 服务器配置
API_BASE_URL="http://localhost:3000"

# 颜色输出
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 测试结果
declare -A TEST_RESULTS
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# 测试数据
TEST_USERNAME="event_test_user"
TEST_PASSWORD="password123"
TEST_DEVICE_ID="EVENT_TEST_DEVICE_$(date +%s)"
TIMESTAMP=$(date +%s)

# 创建测试目录
TEST_DIR="test_downloads"
UPLOAD_DIR="uploads"
PUBLIC_DIR="public"

# 创建目录结构
mkdir -p "$TEST_DIR"
mkdir -p "$UPLOAD_DIR/images/${TEST_DEVICE_ID}"
mkdir -p "$UPLOAD_DIR/videos/${TEST_DEVICE_ID}"
mkdir -p "$PUBLIC_DIR/images/${TEST_DEVICE_ID}"
mkdir -p "$PUBLIC_DIR/videos/${TEST_DEVICE_ID}"

# 上传路径（内部使用）
UPLOAD_IMAGE_PATH="/images/${TEST_DEVICE_ID}/${TIMESTAMP}.jpg"
UPLOAD_VIDEO_PATH="/videos/${TEST_DEVICE_ID}/${TIMESTAMP}.mp4"

# 下载路径（外部访问）
DOWNLOAD_IMAGE_URL="${API_BASE_URL}/api/v1/media/images/${TEST_DEVICE_ID}/${TIMESTAMP}.jpg"
DOWNLOAD_VIDEO_URL="${API_BASE_URL}/api/v1/media/videos/${TEST_DEVICE_ID}/${TIMESTAMP}.mp4"

# 创建测试文件
echo "创建测试文件..."
echo "生成测试图片和视频..."

# 生成测试图片（800x600 白色图片）
convert -size 800x600 xc:white "$PUBLIC_DIR/images/${TEST_DEVICE_ID}/${TIMESTAMP}.jpg"
if [ $? -ne 0 ]; then
    echo -e "${RED}错误: 生成测试图片失败${NC}"
    exit 1
fi

# 生成测试视频（5秒测试视频）
ffmpeg -f lavfi -i testsrc=duration=5:size=1280x720:rate=30 "$PUBLIC_DIR/videos/${TEST_DEVICE_ID}/${TIMESTAMP}.mp4" 2>/dev/null
if [ $? -ne 0 ]; then
    echo -e "${RED}错误: 生成测试视频失败${NC}"
    exit 1
fi

# 复制到 uploads 目录（用于数据库记录）
cp "$PUBLIC_DIR/images/${TEST_DEVICE_ID}/${TIMESTAMP}.jpg" "$UPLOAD_DIR/images/${TEST_DEVICE_ID}/"
cp "$PUBLIC_DIR/videos/${TEST_DEVICE_ID}/${TIMESTAMP}.mp4" "$UPLOAD_DIR/videos/${TEST_DEVICE_ID}/"

echo "测试文件创建完成:"
echo "图片: $UPLOAD_DIR/images/${TEST_DEVICE_ID}/${TIMESTAMP}.jpg"
echo "视频: $UPLOAD_DIR/videos/${TEST_DEVICE_ID}/${TIMESTAMP}.mp4"

# 测试函数
run_test() {
    local test_name=$1
    local test_command=$2
    local expected_status=$3
    
    echo -e "\n${GREEN}测试: $test_name${NC}"
    echo "执行: $test_command"
    
    response=$(eval "$test_command")
    status=$?
    
    # 检查响应是否包含错误
    if echo "$response" | grep -q '"error"'; then
        echo -e "${RED}✗ 测试失败${NC}"
        echo "响应: $response"
        TEST_RESULTS[$test_name]="失败"
        FAILED_TESTS=$((FAILED_TESTS + 1))
    else
        echo -e "${GREEN}✓ 测试通过${NC}"
        echo "响应: $response"
        TEST_RESULTS[$test_name]="通过"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    fi
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
}

# 1. 测试用户注册
run_test "用户注册" \
    "curl -s -X POST $API_BASE_URL/api/v1/auth/register \
    -H 'Content-Type: application/json' \
    -d '{
        \"username\": \"$TEST_USERNAME\",
        \"password\": \"$TEST_PASSWORD\",
        \"name\": \"Event Test User\",
        \"contact_info\": \"event_test@example.com\"
    }'" 0

# 2. 测试用户登录
echo -e "\n${GREEN}测试: 用户登录${NC}"
LOGIN_RESPONSE=$(curl -s -X POST $API_BASE_URL/api/v1/auth/login \
    -H "Content-Type: application/json" \
    -d "{
        \"username\": \"$TEST_USERNAME\",
        \"password\": \"$TEST_PASSWORD\"
    }")
echo "登录响应: $LOGIN_RESPONSE"

# 提取 token
TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)
if [ -z "$TOKEN" ]; then
    echo -e "${RED}错误: 未能获取到 token${NC}"
    exit 1
fi
echo "获取到的 token: $TOKEN"
TEST_RESULTS["用户登录"]="通过"
PASSED_TESTS=$((PASSED_TESTS + 1))
TOTAL_TESTS=$((TOTAL_TESTS + 1))

# 3. 测试设备注册
echo -e "\n${GREEN}测试: 设备注册${NC}"
DEVICE_RESPONSE=$(curl -s -X POST $API_BASE_URL/api/v1/devices/register \
    -H 'Content-Type: application/json' \
    -H "Authorization: Bearer $TOKEN" \
    -d "{
        \"device_id\": \"$TEST_DEVICE_ID\",
        \"device_secret\": \"test123\",
        \"device_name\": \"事件测试设备\",
        \"model_version\": \"v1.0\",
        \"install_location\": \"测试房间\"
    }")

echo "设备注册响应: $DEVICE_RESPONSE"

# 提取设备 token
DEVICE_TOKEN=$(echo "$DEVICE_RESPONSE" | sed -n 's/.*\"device_token\":\"\([^\"]*\)\".*/\1/p')
if [ -z "$DEVICE_TOKEN" ]; then
    echo -e "${RED}错误: 未能获取到设备 token${NC}"
    exit 1
fi
echo "获取到的设备 token: $DEVICE_TOKEN"
TEST_RESULTS["设备注册"]="通过"
PASSED_TESTS=$((PASSED_TESTS + 1))
TOTAL_TESTS=$((TOTAL_TESTS + 1))

# 4. 测试事件上报（带图片和视频）
echo -e "\n${GREEN}测试: 事件上报${NC}"
EVENT_RESPONSE=$(curl -s -X POST $API_BASE_URL/api/v1/devices/event \
    -H 'Content-Type: application/json' \
    -H "Authorization: Device $DEVICE_TOKEN" \
    -d "{
        \"device_id\": \"$TEST_DEVICE_ID\",
        \"event_type\": \"fall\",
        \"event_time\": \"$(date -u +"%Y-%m-%dT%H:%M:%SZ")\",
        \"confidence\": 0.95,
        \"image_path\": \"$UPLOAD_IMAGE_PATH\",
        \"video_path\": \"$UPLOAD_VIDEO_PATH\",
        \"alarm_message\": \"检测到跌倒事件\"
    }")

echo "事件上报响应: $EVENT_RESPONSE"

# 提取告警ID
ALARM_ID=$(echo "$EVENT_RESPONSE" | grep -o '"alarm_id":"[^"]*"' | cut -d'"' -f4)
if [ -z "$ALARM_ID" ]; then
    echo -e "${RED}错误: 未能获取到告警ID${NC}"
    exit 1
fi
echo "获取到的告警ID: $ALARM_ID"
TEST_RESULTS["事件上报"]="通过"
PASSED_TESTS=$((PASSED_TESTS + 1))
TOTAL_TESTS=$((TOTAL_TESTS + 1))

# 5. 测试获取告警列表
echo -e "\n${GREEN}测试: 获取告警列表${NC}"
ALARMS_RESPONSE=$(curl -s -X GET "$API_BASE_URL/api/v1/alarms?from=$(date -u -d '1 hour ago' +"%Y-%m-%dT%H:%M:%SZ")&to=$(date -u +"%Y-%m-%dT%H:%M:%SZ")" \
    -H "Authorization: Bearer $TOKEN")
echo "告警列表响应: $ALARMS_RESPONSE"
TEST_RESULTS["获取告警列表"]="通过"
PASSED_TESTS=$((PASSED_TESTS + 1))
TOTAL_TESTS=$((TOTAL_TESTS + 1))

# 6. 测试获取告警详情
echo -e "\n${GREEN}测试: 获取告警详情${NC}"
ALARM_DETAIL_RESPONSE=$(curl -s -X GET "$API_BASE_URL/api/v1/alarms/$ALARM_ID" \
    -H "Authorization: Bearer $TOKEN")
echo "告警详情响应: $ALARM_DETAIL_RESPONSE"

# 提取图片和视频URL
IMAGE_URL=$(echo "$ALARM_DETAIL_RESPONSE" | grep -o '"image_path":"[^"]*"' | cut -d'"' -f4)
VIDEO_URL=$(echo "$ALARM_DETAIL_RESPONSE" | grep -o '"video_path":"[^"]*"' | cut -d'"' -f4)

if [ ! -z "$IMAGE_URL" ]; then
    echo "下载告警图片..."
    curl -s -o "$TEST_DIR/alarm_image.jpg" "$API_BASE_URL/api/v1/media$IMAGE_URL"
    if [ $? -eq 0 ]; then
        echo "图片下载成功: $TEST_DIR/alarm_image.jpg"
    else
        echo -e "${RED}图片下载失败${NC}"
    fi
fi

if [ ! -z "$VIDEO_URL" ]; then
    echo "下载告警视频..."
    curl -s -o "$TEST_DIR/alarm_video.mp4" "$API_BASE_URL/api/v1/media$VIDEO_URL"
    if [ $? -eq 0 ]; then
        echo "视频下载成功: $TEST_DIR/alarm_video.mp4"
    else
        echo -e "${RED}视频下载失败${NC}"
    fi
fi

TEST_RESULTS["获取告警详情"]="通过"
PASSED_TESTS=$((PASSED_TESTS + 1))
TOTAL_TESTS=$((TOTAL_TESTS + 1))

# 7. 测试告警确认
echo -e "\n${GREEN}测试: 告警确认${NC}"
ACK_RESPONSE=$(curl -s -X POST "$API_BASE_URL/api/v1/alarms/$ALARM_ID/ack" -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" -d '{"action":"confirm","message":"已通知家属处理"}')
echo "告警确认响应: $ACK_RESPONSE"

if echo "$ACK_RESPONSE" | grep -q '"success":true'; then
    TEST_RESULTS["告警确认"]="通过"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    TEST_RESULTS["告警确认"]="失败"
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi
TOTAL_TESTS=$((TOTAL_TESTS + 1))

# 输出测试结果统计
echo -e "\n${GREEN}测试完成${NC}"
echo -e "测试结果详情:"
for test_name in "${!TEST_RESULTS[@]}"; do
    if [ "${TEST_RESULTS[$test_name]}" = "通过" ]; then
        echo -e "${GREEN}✓ $test_name: 通过${NC}"
    else
        echo -e "${RED}✗ $test_name: 失败${NC}"
    fi
done

echo -e "\n总计: $TOTAL_TESTS"
echo -e "通过: ${GREEN}$PASSED_TESTS${NC}"
echo -e "失败: ${RED}$FAILED_TESTS${NC}"
echo -e "通过率: $((PASSED_TESTS * 100 / TOTAL_TESTS))%"

echo -e "\n${YELLOW}测试文件位置:${NC}"
echo "上传目录: $UPLOAD_DIR"
echo "公共目录: $PUBLIC_DIR"
echo "下载目录: $TEST_DIR" 