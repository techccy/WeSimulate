# WeSimulate - 朋友圈模拟生成器

基于 Next.js 的全栈 Web 应用，允许用户通过表单输入，实时生成高度还原的"微信朋友圈"截图，并导出为高清图片。

## 功能特性

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

## 技术栈

- **全栈框架**: Next.js 16.2.2 (App Router)
- **前端语言**: TypeScript
- **样式处理**: Tailwind CSS 3.4.19
- **状态管理**: React Hooks (useState)
- **图片生成**: html2canvas
- **构建工具**: Turbopack

## 项目结构

```
generate-moments/
├── app/
│   ├── favicon.svg          # 网站图标
│   ├── globals.css          # 全局样式
│   ├── layout.tsx           # 根布局
│   ├── manifest.json        # PWA 配置
│   └── page.tsx             # 主页面
├── components/
│   ├── EditorPanel.tsx      # 编辑器组件
│   └── MomentPreview.tsx    # 预览组件
├── types/
│   └── index.ts             # TypeScript 类型定义
├── buildthings/
│   ├── example.html         # UI 样板参考
│   └── task.md              # 项目需求文档
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── postcss.config.js
├── next.config.js
└── .gitignore
```

## 快速开始

### 安装依赖

```bash
npm install
```

### 运行开发服务器

```bash
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000) 查看应用。

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

ISC
