# WeSimulate - 朋友圈模拟生成器

基于 Next.js 的全栈 Web 应用，允许用户通过表单输入，实时生成高度还原的"微信朋友圈"截图，并导出为高清图片。

## 功能特性

### 用户认证模块
- ✅ 用户注册（用户名 + 密码确认）
- ✅ 用户登录
- ✅ JWT 令牌认证
- ✅ 未登录禁止导出图片
- ✅ 预览框下方提示"请先注册/登录"

### 编辑器模块
- ✅ 上传头像（支持 Base64 编码）
- ✅ 自定义昵称
- ✅ 发布正文内容编辑
- ✅ 图片上传（支持 1-9 张，自动适配宫格布局）
- ✅ 位置信息（可选）
- ✅ 发布时间自定义
- ✅ 点赞名单管理（逗号分隔）
- ✅ 评论列表管理（支持添加/删除）
- ✅ 显示/隐藏评论区开关
- ✅ 显示/隐藏删除按钮开关

### 预览模块
- ✅ 像素级还原微信 8.0+ 样式
- ✅ 动态图片宫格布局（1大图、3张1x3、4张2x2、6张2x3、9张3x3）
- ✅ 实时预览更新
- ✅ 响应式设计（PC 端编辑，模拟手机端显示）

### 导出模块
- ✅ 一键导出 PNG 图片
- ✅ 高清输出（2x 倍率）
- ✅ 使用 html2canvas 实现可靠导出
- ✅ 需要登录才能导出

## 技术栈

- **全栈框架**: Next.js 16.2.2 (App Router)
- **前端语言**: TypeScript
- **样式处理**: Tailwind CSS 3.4.19
- **状态管理**: React Hooks (useState, useContext)
- **图片生成**: html2canvas
- **构建工具**: Turbopack
- **认证**: bcryptjs, jsonwebtoken

## 项目结构

```
generate-moments/
├── app/
│   ├── favicon.svg          # 网站图标
│   ├── globals.css          # 全局样式
│   ├── layout.tsx           # 根布局（包含 AuthProvider）
│   ├── manifest.json        # PWA 配置
│   ├── page.tsx             # 主页面（含认证逻辑）
│   └── api/
│       └── auth/
│           ├── register/    # 注册 API
│           ├── login/       # 登录 API
│           ├── verify/      # 验证 API
│           └── logout/      # 登出 API
├── components/
│   ├── EditorPanel.tsx      # 编辑器组件
│   ├── MomentPreview.tsx    # 预览组件
│   └── AuthModal.tsx        # 认证模态框
├── contexts/
│   └── AuthContext.tsx      # 认证上下文
├── lib/
│   ├── auth.ts              # 认证工具函数
│   └── storage.ts           # 用户存储工具
├── types/
│   └── index.ts             # TypeScript 类型定义
├── data/
│   └── users.json           # 用户数据（不在 Git 中）
├── buildthings/
│   ├── example.html         # UI 样板参考
│   └── task.md              # 项目需求文档
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── postcss.config.js
├── next.config.js
├── .env.local               # 环境变量（不在 Git 中）
└── .gitignore
```

## 快速开始

### 安装依赖

```bash
npm install
```

### 配置环境变量

创建 `.env.local` 文件：

```env
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-please
```

**重要**：在生产环境中，请使用强密码生成 JWT_SECRET。

### 运行开发服务器

```bash
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000) 查看应用。

### 从其他设备访问

应用已配置为监听所有网络接口，支持从其他设备访问：

1. **局域网访问**：
   - 查看启动日志中的 Network 地址（如 `http://192.168.31.141:3000`）
   - 在同一局域网内的其他设备上访问该地址

2. **公网访问**：
   - 配置端口转发：将路由器的 3000 端口转发到开发服务器的 IP
   - 使用 ngrok 等内网穿透工具：
     ```bash
     ngrok http 3000
     ```
   - 获取公网 URL 后在任意设备上访问

**注意事项**：
- 确保防火墙允许 3000 端口的入站连接
- 生产环境请使用 HTTPS 和专业的托管服务
- Cookie 已配置为 `sameSite: "lax"` 以支持跨设备登录

### 构建生产版本

```bash
npm run build
```

### 启动生产服务器

```bash
npm start
```

## 数据结构

```typescript
interface MomentPost {
  avatar: string;        // 头像 URL/Base64
  nickname: string;      // 昵称
  content: string;       // 正文
  images: string[];      // 图片数组 (max 9)
  location?: string;     // 位置
  timestamp: string;     // 发布时间描述
  likes: string[];       // 点赞人名数组
  comments: {            // 评论数组
    user: string;
    text: string;
  }[];
}
```

## 许可证

MIT

## 安全措施

本项目实现了多层次的安全防护措施：

### 1. 认证与授权
- **JWT 令牌**：使用 JSON Web Token 进行用户认证
- **密码哈希**：使用 bcryptjs 对用户密码进行加盐哈希存储
- **HttpOnly Cookies**：认证令牌存储在 HttpOnly Cookie 中，防止 XSS 攻击
- **Secure Cookies**：生产环境下使用 HTTPS 传输 Cookie
- **SameSite Cookies**：设置 `strict` 模式防止 CSRF 攻击

### 2. 输入验证
- **用户名验证**：限制长度（3-20字符），只允许字母、数字、下划线和中文
- **密码验证**：限制长度（6-50字符）
- **输入清理**：使用 `sanitizeInput` 函数移除危险字符（如 `<` `>`）
- **前后端双重验证**：客户端和服务端都进行输入验证

### 3. 防止常见攻击
- **XSS 防护**：输入清理 + React 自动转义
- **CSRF 防护**：SameSite Cookie + JWT 认证
- **SQL 注入防护**：使用文件存储而非数据库，避免 SQL 注入
- **暴力破解防护**：虽然未实现速率限制，但密码哈希增加了破解成本

### 4. 数据安全
- **敏感数据保护**：用户数据存储在 `data/` 目录，已加入 `.gitignore`
- **环境变量保护**：`.env.local` 已加入 `.gitignore`
- **密码安全存储**：使用 bcrypt 加盐哈希，不存储明文密码
- **最小权限原则**：只存储必要的用户信息

### 5. 生产环境建议
在生产环境中，建议额外实施以下安全措施：

- 使用强随机密钥作为 `JWT_SECRET`
- 实现速率限制（Rate Limiting）防止暴力破解
- 添加验证码功能防止自动化攻击
- 使用 HTTPS 传输所有数据
- 定期更新依赖包
- 实现 IP 黑名单机制
- 添加日志记录和监控
- 使用专业的数据库（如 PostgreSQL、MongoDB）
- 实现用户会话管理和自动过期
- 添加双因素认证（2FA）
