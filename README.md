# 后台管理系统

基于 React 18 + TypeScript + Ant Design 的现代化后台管理系统。

## 功能特性

### 🔐 用户认证
- ✅ 用户登录/退出
- ✅ 路由守卫和权限管理
- ✅ 私有路由保护

### 🎨 界面组件
- ✅ 响应式布局设计
- ✅ 智能Tab标签系统
- ✅ 右键菜单操作
- ✅ 页面标题组件
- ✅ 智能吸附导航栏

### 📁 文件管理
- ✅ 拖拽文件上传
- ✅ 文件夹批量上传
- ✅ 大文件分片上传
- ✅ 多文件进度管理
- ✅ WebWorker后台处理

### 📊 数据管理
- ✅ 员工信息管理
- ✅ 角色权限管理
- ✅ 列表数据CRUD
- ✅ 表单验证处理
- ✅ 数据搜索筛选

## 技术栈

### 前端框架
- React 18 + TypeScript
- Modern.js 2.x 框架
- Ant Design 5.x UI组件库

### 核心功能
- 文件上传：原生HTML + WebWorker
- 状态管理：React Hooks
- 路由管理：Modern.js Router
- HTTP请求：Axios封装

### 开发工具
- TypeScript 类型检查
- ESLint 代码规范
- 热重载开发服务器

## 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

## 项目结构

```
src/
├── components/       # 组件库（按功能分类）
│   ├── layout/       # 布局组件
│   │   ├── PageContainer/    # 页面容器
│   │   ├── PageTitle/        # 页面标题
│   │   └── Sticky/           # 智能吸附组件
│   ├── navigation/   # 导航组件
│   │   ├── TabBar/           # 标签栏
│   │   └── ContextMenu/      # 右键菜单
│   ├── upload/       # 上传组件
│   │   └── FileUpload/       # 文件上传
│   ├── common/       # 通用组件
│   │   ├── ErrorBoundary/    # 错误边界
│   │   ├── SuspenseFallback/ # 加载状态
│   │   └── PrivateRoute/     # 私有路由
│   └── index.ts      # 统一导出
├── layouts/          # 布局文件
│   ├── AdminLayout.tsx
│   └── AdminLayout.css
├── routes/           # 路由页面
│   ├── layout.tsx    # 主布局
│   ├── page.tsx      # 首页
│   ├── login/page.tsx
│   ├── employees/    # 员工管理
│   ├── roles/        # 角色管理
│   └── list/         # 列表管理
│       ├── page.tsx
│       ├── create/page.tsx
│       └── edit/[id]/page.tsx
├── hooks/            # 自定义Hooks
│   ├── useTabs.ts    # Tab管理
│   ├── useTabShortcuts.ts # 快捷键
│   └── useTabPersistence.ts # 持久化
├── utils/            # 工具函数
│   ├── http.ts       # HTTP请求
│   ├── auth.ts       # 权限管理
│   └── fileUtils.ts  # 文件工具
├── types/            # 类型定义
│   └── upload.ts     # 上传类型
└── styles/           # 全局样式
    └── page-title.css
```

## 核心功能

### 🏠 首页概览
- 数据统计卡片展示
- 快速操作入口
- 系统状态监控

### 👥 员工管理
- 员工信息列表
- 新增/编辑员工
- 搜索和筛选功能
- 批量操作支持

### 🔐 角色管理
- 角色权限配置
- 角色成员管理
- 权限继承机制

### 📋 列表管理
- 数据列表展示
- 文件上传功能
- 表单验证处理
- 数据导入导出

### 📁 文件上传
- 拖拽上传支持
- 文件夹批量上传
- 大文件分片处理
- 实时上传进度
- 文件类型验证

## 使用说明

1. **访问系统**：打开 `http://localhost:8080`
2. **用户登录**：使用任意用户名和密码（模拟登录）
3. **导航操作**：左侧菜单切换页面
4. **Tab管理**：支持多标签页操作
5. **文件上传**：在列表页面体验文件上传功能

## 快捷键

- `Ctrl + T`：新建标签页
- `Ctrl + W`：关闭当前标签页
- `Ctrl + Shift + T`：关闭其他标签页
- `Ctrl + Shift + W`：关闭所有标签页

## 技术亮点

- **组件化设计**：按功能分类的组件库
- **类型安全**：完整的TypeScript类型定义
- **性能优化**：WebWorker处理大文件上传
- **用户体验**：智能吸附导航栏
- **响应式设计**：适配不同屏幕尺寸
- **代码规范**：统一的代码风格和结构

## 开发计划

- [ ] 接入真实后端API
- [ ] 添加数据可视化图表
- [ ] 完善权限管理系统
- [ ] 添加主题切换功能
- [ ] 优化移动端体验
- [ ] 添加单元测试

## License

MIT
