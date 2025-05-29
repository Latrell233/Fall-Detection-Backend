#!/bin/bash

# 服务器配置

API_BASE_URL="http://localhost:3000"
# 如果需要修改服务器地址，只需要修改上面的 API_BASE_URL 变量

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
TEST_USERNAME="testuser"
TEST_PASSWORD="password123"
TEST_DEVICE_ID="TEST_DEVICE_$(date +%s)"

# 检查服务器连接
echo -e "${YELLOW}检查服务器连接...${NC}"
if ! curl -s -o /dev/null -w "%{http_code}" "$API_BASE_URL/health" | grep -q "200"; then
    echo -e "${RED}错误: 无法连接到服务器 $API_BASE_URL${NC}"
    echo -e "${YELLOW}请检查:${NC}"
    echo "1. 服务器是否正在运行"
    echo "2. 3000端口是否开放"
    echo "3. 防火墙是否允许外部访问"
    echo "4. 服务器安全组是否配置正确"
    exit 1
fi
echo -e "${GREEN}服务器连接正常${NC}"

# 清理函数
cleanup() {
    echo -e "\n${GREEN}清理测试数据...${NC}"
    
    # 如果存在 token，尝试删除测试数据
    if [ ! -z "$TOKEN" ]; then
        echo "删除测试设备..."
        curl -s -X POST "$API_BASE_URL/api/v1/devices/unbind" \
            -H "Authorization: Bearer $TOKEN" \
            -H "Content-Type: application/json" \
            -d "{\"device_id\": \"$TEST_DEVICE_ID\"}"
            
        # 等待一下确保设备被删除
        sleep 1
            
        echo "删除测试用户..."
        curl -s -X DELETE "$API_BASE_URL/api/v1/users/me" \
            -H "Authorization: Bearer $TOKEN"
    fi
    
    echo -e "${GREEN}清理完成${NC}"
}

# 设置退出时清理
trap cleanup EXIT

# 测试函数
run_test() {
    local test_name=$1
    local test_command=$2
    local expected_status=$3
    
    echo -e "\n${GREEN}测试: $test_name${NC}"
    echo "执行: $test_command"
    
    # 添加超时和详细错误信息
    response=$(curl -s -w "\n%{http_code}" -m 10 $test_command)
    http_code=$(echo "$response" | tail -n1)
    response=$(echo "$response" | sed '$d')
    
    if [ "$http_code" != "200" ]; then
        echo -e "${RED}✗ 测试失败 (HTTP $http_code)${NC}"
        echo "响应: $response"
        TEST_RESULTS[$test_name]="失败"
        FAILED_TESTS=$((FAILED_TESTS + 1))
    elif echo "$response" | grep -q '"error"'; then
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
    "-X POST $API_BASE_URL/api/v1/auth/register \
    -H 'Content-Type: application/json' \
    -d '{
        \"username\": \"$TEST_USERNAME\",
        \"password\": \"$TEST_PASSWORD\",
        \"name\": \"Test User\",
        \"contact_info\": \"test@example.com\"
    }'" 0

# 2. 测试用户登录
echo -e "\n${GREEN}测试: 用户登录${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "$API_BASE_URL/api/v1/auth/login" \
    -H "Content-Type: application/json" \
    -d "{
        \"username\": \"$TEST_USERNAME\",
        \"password\": \"$TEST_PASSWORD\"
    }")
echo "登录响应: $LOGIN_RESPONSE"

# 提取 token
TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)
if [ -z "$TOKEN" ]; then
    echo -e "${RED}错误: 未能获取到 token${NC}"
    echo -e "${YELLOW}请检查:${NC}"
    echo "1. 登录响应是否正常"
    echo "2. 响应格式是否正确"
    echo "3. 服务器日志是否有错误"
    exit 1
fi
echo "获取到的 token: $TOKEN"
TEST_RESULTS["用户登录"]="通过"
PASSED_TESTS=$((PASSED_TESTS + 1))
TOTAL_TESTS=$((TOTAL_TESTS + 1))

# 3. 测试设备注册
echo -e "\n${GREEN}测试: 设备注册${NC}"
DEVICE_RESPONSE=$(curl -s -X POST "$API_BASE_URL/api/v1/devices/register" \
    -H 'Content-Type: application/json' \
    -H "Authorization: Bearer $TOKEN" \
    -d "{
        \"device_id\": \"$TEST_DEVICE_ID\",
        \"device_secret\": \"test123\",
        \"device_name\": \"测试设备\",
        \"model_version\": \"v1.0\",
        \"install_location\": \"测试房间\"
    }")

echo "设备注册响应: $DEVICE_RESPONSE"

# 检查是否注册成功
if echo "$DEVICE_RESPONSE" | grep -q '"error"'; then
    echo -e "${RED}✗ 设备注册失败${NC}"
    exit 1
fi

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

# 4. 测试获取设备列表
run_test "获取设备列表" \
    "-X GET $API_BASE_URL/api/v1/devices \
    -H 'Authorization: Bearer $TOKEN'" 0

# 5. 测试设备心跳
run_test "设备心跳" \
    "-X POST $API_BASE_URL/api/v1/devices/heartbeat \
    -H 'Content-Type: application/json' \
    -H 'Authorization: Device $DEVICE_TOKEN' \
    -d '{
        \"device_id\": \"$TEST_DEVICE_ID\",
        \"timestamp\": \"$(date -u +"%Y-%m-%dT%H:%M:%SZ")\",
        \"status\": \"online\",
        \"temp\": 45.2
    }'" 0

# 6. 测试事件上报
run_test "事件上报" \
    "-X POST $API_BASE_URL/api/v1/devices/event \
    -H 'Content-Type: application/json' \
    -H 'Authorization: Device $DEVICE_TOKEN' \
    -d '{
        \"device_id\": \"$TEST_DEVICE_ID\",
        \"event_type\": \"fall\",
        \"event_time\": \"$(date -u +"%Y-%m-%dT%H:%M:%SZ")\",
        \"confidence\": 0.95,
        \"alarm_message\": \"检测到跌倒\"
    }'" 0

# 7. 测试获取告警列表
run_test "获取告警列表" \
    "-X GET '$API_BASE_URL/api/v1/alarms?from=$(date -u -d '1 hour ago' +"%Y-%m-%dT%H:%M:%SZ")&to=$(date -u +"%Y-%m-%dT%H:%M:%SZ")' \
    -H 'Authorization: Bearer $TOKEN'" 0

# 8. 测试获取用户信息
run_test "获取用户信息" \
    "-X GET $API_BASE_URL/api/v1/users/me \
    -H 'Authorization: Bearer $TOKEN'" 0

# 9. 测试设备解绑
run_test "设备解绑" \
    "-X POST $API_BASE_URL/api/v1/devices/unbind \
    -H 'Content-Type: application/json' \
    -H 'Authorization: Bearer $TOKEN' \
    -d '{
        \"device_id\": \"$TEST_DEVICE_ID\"
    }'" 0

# 10. 测试健康检查
run_test "健康检查" \
    "-X GET $API_BASE_URL/health" 0

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