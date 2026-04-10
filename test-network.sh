#!/bin/bash

# 网络访问测试脚本

echo "=== 网络访问测试 ==="
echo ""

# 1. 检查端口是否被占用
echo "1. 检查 3000 端口状态..."
if lsof -i :3000 > /dev/null 2>&1; then
    echo "✓ 端口 3000 正在使用中"
    lsof -i :3000 | grep LISTEN
else
    echo "✗ 端口 3000 未被使用"
fi
echo ""

# 2. 获取本机 IP 地址
echo "2. 获取本机 IP 地址..."
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    IP=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null)
else
    # Linux
    IP=$(hostname -I | awk '{print $1}')
fi

if [ -n "$IP" ]; then
    echo "✓ 本机 IP 地址: $IP"
    echo "  访问地址: http://$IP:3000"
else
    echo "✗ 无法获取 IP 地址"
fi
echo ""

# 3. 测试本地访问
echo "3. 测试本地访问..."
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 | grep -q "200"; then
    echo "✓ 本地访问正常"
else
    echo "✗ 本地访问失败，请确保开发服务器正在运行"
fi
echo ""

# 4. 检查防火墙（macOS）
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "4. 检查防火墙状态..."
    if /usr/libexec/ApplicationFirewall/socketfilterfw --getglobalstate | grep -q "enabled"; then
        echo "⚠ 防火墙已启用"
        echo "  请确保允许 Node.js 应用连接网络"
    else
        echo "✓ 防火墙未启用"
    fi
    echo ""
fi

# 5. 检查上传目录
echo "5. 检查上传目录..."
if [ -d "public/uploads" ]; then
    echo "✓ 上传目录存在"
    PERMS=$(stat -f "%OLp" public/uploads 2>/dev/null || stat -c "%a" public/uploads 2>/dev/null)
    echo "  权限: $PERMS"
else
    echo "⚠ 上传目录不存在，正在创建..."
    mkdir -p public/uploads
    echo "✓ 已创建上传目录"
fi
echo ""

# 6. 检查环境变量
echo "6. 检查环境变量..."
if [ -f ".env.local" ]; then
    echo "✓ .env.local 文件存在"
    if grep -q "JWT_SECRET" .env.local; then
        echo "✓ JWT_SECRET 已配置"
    else
        echo "✗ JWT_SECRET 未配置"
    fi
else
    echo "✗ .env.local 文件不存在"
    echo "  请创建 .env.local 文件并配置 JWT_SECRET"
fi
echo ""

echo "=== 测试完成 ==="
echo ""
echo "访问地址："
echo "  - 本地: http://localhost:3000"
if [ -n "$IP" ]; then
    echo "  - 局域网: http://$IP:3000"
fi
