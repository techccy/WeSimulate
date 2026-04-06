# 安全文档

## 概述

本应用实现了多层次的安全防护措施，保护用户数据和系统安全。

## 安全措施

### 1. 认证系统

#### 密码存储
- 使用 `bcryptjs` 对密码进行加盐哈希
- 默认使用 10 轮加盐（salt rounds = 10）
- 不存储明文密码
- 每个用户的密码使用唯一的盐值

#### 会话管理
- 使用 JSON Web Token (JWT) 进行身份验证
- 令牌有效期：7 天
- 令牌存储在 HttpOnly Cookie 中

#### Cookie 安全
```
Set-Cookie: auth-token=<token>; HttpOnly; Secure; SameSite=Strict; Path=/
```
- **HttpOnly**：防止 JavaScript 访问 Cookie，防范 XSS 攻击
- **Secure**：生产环境下仅通过 HTTPS 传输
- **SameSite=Strict**：防止 CSRF 攻击
- **Path=/**：限制 Cookie 作用域

### 2. 输入验证

#### 前端验证
- 用户名：3-20 字符，只允许字母、数字、下划线和中文
- 密码：6-50 字符
- 实时反馈验证错误

#### 后端验证
- 所有 API 端点都进行输入验证
- 使用 `sanitizeInput` 函数清理用户输入
- 移除危险字符（`<`、`>`）
- 验证密码一致性（注册时）

### 3. 防范攻击

#### XSS（跨站脚本攻击）
- 输入清理：移除 HTML/JS 标签
- React 自动转义：防止脚本注入
- HttpOnly Cookie：防止令牌被盗取

#### CSRF（跨站请求伪造）
- SameSite=Strict Cookie
- JWT 令牌验证
- POST 请求必需令牌

#### 暴力破解
- bcrypt 哈希增加破解成本
- （建议：实现速率限制）

#### SQL 注入
- 使用文件存储，避免 SQL 查询
- 输入验证和清理

### 4. 数据保护

#### 敏感数据
- `data/users.json`：用户数据（哈希密码）
- `.env.local`：环境变量（JWT_SECRET）
- 以上文件已添加到 `.gitignore`

#### 数据传输
- 生产环境使用 HTTPS
- 敏感数据（密码）仅在 POST 请求体中传输

### 5. API 安全

#### 认证端点
- `POST /api/auth/register`：用户注册
- `POST /api/auth/login`：用户登录
- `POST /api/auth/verify`：验证令牌
- `POST /api/auth/logout`：用户登出

#### 错误处理
- 不暴露敏感信息
- 通用错误消息（如"用户名或密码错误"）
- 记录服务器端错误日志

## 配置

### 环境变量

```env
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-please
```

**生产环境**：
- 使用强随机密钥（至少 32 字符）
- 不要使用默认密钥
- 定期更换密钥

## 建议的增强措施

生产环境中建议实施以下措施：

### 1. 速率限制
```javascript
// 示例：使用 express-rate-limit
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 分钟
  max: 5 // 限制每个 IP 5 次请求
});
```

### 2. 验证码
- 注册/登录时添加验证码
- 防止自动化攻击

### 3. 双因素认证（2FA）
- 使用 TOTP 或短信验证码
- 提高账户安全性

### 4. IP 黑名单
- 记录恶意 IP
- 自动封禁

### 5. 日志和监控
- 记录所有认证事件
- 监控异常行为
- 发送安全告警

### 6. 定期安全审计
- 依赖包安全扫描
- 代码安全审查
- 渗透测试

## 漏洞报告

如果您发现任何安全漏洞，请通过以下方式报告：

- 发送邮件至：security@example.com
- 请勿公开披露漏洞

## 参考资料

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [bcrypt Security](https://github.com/kelektiv/node.bcrypt.js)
