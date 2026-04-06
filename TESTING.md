# 测试指南

## 手动测试步骤

### 1. 启动开发服务器

```bash
npm run dev
```

### 2. 测试注册功能

1. 访问 http://localhost:3000
2. 点击右上角的"注册"按钮
3. 填写表单：
   - 用户名：testuser（至少 3 个字符）
   - 密码：password123（至少 6 个字符）
   - 确认密码：password123
4. 点击"注册"按钮
5. 应该看到注册成功的提示，模态框关闭

### 3. 测试登录功能

1. 如果未登录，点击"登录"按钮
2. 填写表单：
   - 用户名：testuser
   - 密码：password123
3. 点击"登录"按钮
4. 应该看到登录成功，页面显示"欢迎, testuser"

### 4. 测试导出功能（已登录）

1. 在编辑器中修改内容
2. 点击"导出图片"按钮
3. 应该成功下载 PNG 图片

### 5. 测试导出功能（未登录）

1. 点击右上角的"退出"按钮
2. 点击"导出图片"按钮
3. 应该弹出登录模态框
4. 预览框下方应该显示"请先注册/登录"黄色提示

### 6. 测试输入验证

#### 用户名验证
- 尝试注册 2 个字符的用户名 → 应该显示错误
- 尝试注册 21 个字符的用户名 → 应该显示错误
- 尝试使用特殊字符的用户名 → 应该显示错误

#### 密码验证
- 尝试使用 5 个字符的密码 → 应该显示错误
- 尝试使用 51 个字符的密码 → 应该显示错误
- 两次输入的密码不一致 → 应该显示错误

### 7. 测试重复注册

1. 尝试用相同用户名注册
2. 应该显示"用户名已被注册"错误

### 8. 测试错误凭据

1. 尝试用错误的密码登录
2. 应该显示"用户名或密码错误"

## 自动化测试

### API 端点测试

#### 注册端点
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password123","confirmPassword":"password123"}'
```

#### 登录端点
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password123"}' \
  -c cookies.txt
```

#### 验证端点
```bash
curl -X POST http://localhost:3000/api/auth/verify \
  -b cookies.txt
```

#### 登出端点
```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -b cookies.txt
```

## 安全测试

### 1. XSS 测试

尝试注册包含以下内容的用户名：
```html
<script>alert('XSS')</script>
<img src=x onerror=alert(1)>
```

预期：应该被清理或拒绝

### 2. CSRF 测试

尝试从不同域发送 POST 请求到登录端点

预期：应该被 SameSite Cookie 策略阻止

### 3. 暴力破解测试

多次尝试使用错误密码登录

预期：可以成功登录（暂无限速），但 bcrypt 哈希增加了破解成本

## 浏览器测试

推荐在以下浏览器中测试：
- Chrome/Edge（最新版本）
- Firefox（最新版本）
- Safari（最新版本）

## 响应式测试

测试不同屏幕尺寸：
- 桌面（1920x1080）
- 平板（768x1024）
- 手机（375x667）

## 已知限制

1. 当前没有实现速率限制（Rate Limiting）
2. 没有验证码功能
3. 没有双因素认证（2FA）
4. 用户数据存储在文件中（生产环境建议使用数据库）
5. 没有密码重置功能
