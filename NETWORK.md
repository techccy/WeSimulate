# 网络访问配置指南

## 开发环境

### 局域网访问

1. **启动开发服务器**：
   ```bash
   npm run dev
   ```

2. **查看网络地址**：
   - 启动日志会显示 Network 地址，例如：
     ```
     - Local:         http://localhost:3000
     - Network:       http://192.168.31.141:3000
     ```

3. **从其他设备访问**：
   - 确保设备在同一局域网
   - 使用 Network 地址访问：`http://192.168.31.141:3000`

### 公网访问（临时）

使用 ngrok 进行内网穿透：

1. **安装 ngrok**：
   ```bash
   # macOS
   brew install ngrok

   # 或下载：https://ngrok.com/download
   ```

2. **启动 ngrok**：
   ```bash
   ngrok http 3000
   ```

3. **获取公网地址**：
   - ngrok 会显示一个临时的公网 URL，例如：`https://xxx.ngrok-free.app`

4. **使用公网地址访问**：
   - 在任意设备上使用该 URL 访问

### 使用 FRP 进行内网穿透

如果需要稳定的公网访问，可以使用 FRP：

1. **安装 FRP 客户端**：
   ```bash
   # 下载对应平台的 FRP 客户端
   wget https://github.com/fatedier/frp/releases/download/v0.52.3/frp_0.52.3_darwin_amd64.tar.gz
   tar -xzf frp_0.52.3_darwin_amd64.tar.gz
   ```

2. **配置 FRP**（frpc.ini）：
   ```ini
   [common]
   server_addr = your-frp-server.com
   server_port = 7000
   token = your-token

   [web]
   type = http
   local_port = 3000
   custom_domains = your-domain.com
   ```

3. **启动 FRP**：
   ```bash
   ./frpc -c frpc.ini
   ```

## 生产环境

### 使用专业托管服务

推荐使用以下托管服务：

1. **Vercel**（推荐 Next.js）：
   ```bash
   npm install -g vercel
   vercel
   ```

2. **Netlify**：
   ```bash
   npm install -g netlify-cli
   netlify deploy --prod
   ```

3. **自建服务器**：
   ```bash
   npm run build
   npm start
   ```

### 生产环境配置

1. **环境变量**：
   ```env
   JWT_SECRET=your-production-secret-key
   NODE_ENV=production
   ```

2. **使用 HTTPS**：
   - 推荐使用 Nginx 反向代理 + Let's Encrypt
   - 或使用云服务提供的 SSL 证书

3. **使用域名**：
   - 购买域名并配置 DNS
   - 配置 Nginx 反向代理

### Nginx 配置示例

```nginx
server {
    listen 80;
    server_name your-domain.com;

    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 故障排查

### 无法从其他设备访问

1. **检查防火墙**：
   ```bash
   # macOS
   sudo /usr/libexec/ApplicationFirewall/socketfilterfw --add /usr/local/bin/node
   sudo /usr/libexec/ApplicationFirewall/socketfilterfw --unblock /usr/local/bin/node

   # Linux
   sudo ufw allow 3000
   ```

2. **检查端口占用**：
   ```bash
   lsof -i :3000
   ```

3. **测试端口连接**：
   ```bash
   # 在其他设备上测试
   curl http://192.168.31.141:3000
   ```

4. **查看服务器日志**：
   - 检查是否有错误信息
   - 确认服务器正在监听正确的端口

### Cookie 登录问题

1. **清除浏览器 Cookie**：
   - 打开开发者工具 → Application → Cookies
   - 删除所有 Cookie 后重新登录

2. **检查 Cookie 设置**：
   - Cookie 已配置为 `sameSite: "lax"` 以支持跨设备登录
   - 确保浏览器没有禁用 Cookie

3. **使用隐私模式**：
   - 某些浏览器扩展可能影响 Cookie
   - 尝试在隐私模式下访问

### 图片无法上传

1. **检查上传目录权限**：
   ```bash
   chmod 755 public/uploads
   ```

2. **检查文件大小限制**：
   - 默认限制：5MB
   - 可在 `app/api/upload/route.ts` 中修改

3. **查看服务器日志**：
   - 检查上传 API 的错误信息
   - 确认文件已正确保存

## 安全建议

1. **生产环境必须使用 HTTPS**
2. **使用强密码和随机的 JWT_SECRET**
3. **定期更新依赖包**
4. **配置防火墙规则**
5. **启用速率限制**
6. **定期备份数据**
7. **监控访问日志**
