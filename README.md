# 商机渠道管理系统

这是一个基于 React + TypeScript + Ant Design + Vite 的前端页面开发框架，主要用于快速编写和展示前端页面 Demo。

## 技术栈

- **React 18** - 现代化的 UI 框架
- **TypeScript** - 类型安全的 JavaScript 超集
- **Ant Design 5** - 企业级 UI 设计语言和 React 组件库
- **Vite** - 下一代前端构建工具
- **React Router 6** - React 应用的路由管理

## 快速开始

### 安装依赖

```bash
pnpm install
```

### 启动开发服务器

```bash
pnpm run dev
```

访问 http://localhost:3000 查看应用。

### 构建生产版本

```bash
pnpm run build
```

### 预览生产构建

```bash
pnpm run preview
```

## 项目结构

```
jiaofu-demo/
├── public/                 # 静态资源文件
│   └── vite.svg           # 网站图标
├── src/
│   ├── layouts/           # 布局组件
│   │   └── MainLayout/    # 主布局（侧边栏+顶部栏）
│   ├── pages/             # 页面组件
│   │   ├── Home/          # 首页
│   │   ├── Demo1/         # 示例页面1
│   │   ├── Demo2/         # 示例页面2
│   │   └── NotFound/      # 404页面
│   ├── routes/            # 路由配置
│   │   ├── index.tsx      # 路由主文件
│   │   └── menuConfig.tsx # 菜单配置
│   ├── styles/            # 全局样式
│   │   └── global.css     # 全局CSS样式
│   ├── App.tsx            # 应用主组件
│   └── main.tsx           # 应用入口文件
├── guidelines/            # 开发规范文档
│   ├── INDEX.md          # 规范索引
│   ├── CODE_STANDARDS.md # 代码规范
│   ├── COMPONENT_STANDARDS.md # 组件开发规范
│   ├── STYLE_STANDARDS.md # 样式规范
│   ├── UI_COMPONENT_STANDARDS.md # UI组件使用规范
│   ├── ROUTING_STANDARDS.md # 路由规范
│   ├── DATA_STANDARDS.md # 数据存储规范
│   └── BEST_PRACTICES.md # 最佳实践
├── index.html             # HTML入口文件
├── package.json           # 项目依赖配置
├── tsconfig.json          # TypeScript配置
├── vite.config.ts         # Vite配置
└── README.md              # 项目说明文档
```

## 功能特性

### ✅ 已实现

- 🎨 基于 Ant Design 5 的现代化 UI
- 🔐 TypeScript 类型安全
- 🚀 Vite 极速开发体验
- 📱 响应式布局设计
- 🎯 React Router 路由管理
- 🎪 侧边栏导航和页面布局
- 📄 示例页面和组件展示

### 📋 设计原则

- **纯展示型** - 不依赖后端 API，使用 localStorage 进行数据存储
- **数据文件化** - 从本地 JSON 文件加载静态数据，便于修改和维护
- **自动初始化** - 服务启动时自动清理并加载数据，保证演示环境的一致性
- **组件化** - 采用组件化开发模式
- **可扩展** - 易于添加新页面和功能
- **规范化** - 遵循统一的开发规范

## 添加新页面

### 1. 创建页面组件

在 `src/pages/` 目录下创建新的页面文件夹：

```typescript
// src/pages/NewPage/index.tsx
function NewPage() {
  return (
    <div>
      <h1>新页面</h1>
    </div>
  )
}

export default NewPage
```

### 2. 配置路由

在 `src/routes/index.tsx` 中添加路由：

```typescript
import NewPage from '@/pages/NewPage'

// 在 Routes 中添加
<Route path="new-page" element={<NewPage />} />
```

### 3. 配置菜单（可选）

如果需要在侧边栏显示，在 `src/routes/menuConfig.tsx` 中添加菜单项：

```typescript
{
  key: 'new-page',
  label: '新页面',
  icon: <YourIcon />,
  path: '/new-page',
}
```

## 常用组件示例

查看 `src/pages/Demo1` 和 `src/pages/Demo2` 了解以下组件的使用：

- 表单 (Form)
- 表格 (Table)
- 卡片 (Card)
- 统计 (Statistic)
- 进度条 (Progress)
- 模态框 (Modal)
- 步骤条 (Steps)
- 描述列表 (Descriptions)

更多组件请参考 [Ant Design 官方文档](https://ant.design/components/overview-cn/)。

## 数据存储

本项目使用浏览器的 **localStorage** 进行数据存储，便于演示和调试。

### 数据初始化

- **首次加载**：如果 localStorage 中没有数据，会自动加载初始示例数据
- **数据持久化**：用户保存的数据会保留在 localStorage 中，刷新页面不会丢失
- **初始数据**：定义在 `src/utils/dataInitializer.ts` 文件中

### 数据重置

如果需要重置为初始数据，可以在浏览器控制台执行：
```javascript
// 方法1：使用重置函数（如果已暴露到 window）
resetLocalStorage()

// 方法2：手动清理
localStorage.removeItem('demo_data1')
localStorage.removeItem('demo_data2')
location.reload()
```

### 查看数据

在浏览器控制台可以查看当前存储的数据：
```javascript
// 查看demo_data1数据
JSON.parse(localStorage.getItem('demo_data1'))

// 查看demo_data2数据
JSON.parse(localStorage.getItem('demo_data2'))
```

详细的数据存储规范请参考 [数据存储规范](./guidelines/DATA_STANDARDS.md)。

## 开发规范

本项目遵循统一的开发规范，确保代码质量和团队协作效率。

### 📚 规范文档索引

所有开发规范文档位于 `guidelines/` 目录下，建议从 [规范索引](./guidelines/INDEX.md) 开始：

- **[规范索引](./guidelines/INDEX.md)** - 快速查找所有规范文档
- **[代码规范](./guidelines/CODE_STANDARDS.md)** - 代码格式、TypeScript、命名、注释
- **[组件开发规范](./guidelines/COMPONENT_STANDARDS.md)** - 组件结构、页面开发
- **[样式规范](./guidelines/STYLE_STANDARDS.md)** - 颜色使用、样式方案、响应式设计
- **[UI 组件使用规范](./guidelines/UI_COMPONENT_STANDARDS.md)** - Descriptions、表单字段布局等
- **[路由规范](./guidelines/ROUTING_STANDARDS.md)** - 路由配置和使用
- **[数据存储规范](./guidelines/DATA_STANDARDS.md)** - localStorage 使用规范
- **[最佳实践](./guidelines/BEST_PRACTICES.md)** - 开发技巧和常用模式

### 🎯 重要规范速览

#### 颜色使用规范

项目采用统一的颜色体系：
- **主题色**: `#ff5050` (红色) - 品牌标识和重要操作
- **成功色**: `#52c41a` (绿色) - 成功、完成、正向状态
- **警告色**: `#faad14` (橙色) - 警告、待处理状态
- **默认色**: `#000000d9` (深灰色) - 常规文本

详细说明请参考 [样式规范](./guidelines/STYLE_STANDARDS.md#颜色使用规范)。

#### UI 组件使用规范

**Descriptions 组件**必须使用响应式配置：
```typescript
import { RESPONSIVE_DESCRIPTIONS_COLUMN } from '@/utils/descriptionsConfig'

<Descriptions 
  bordered={false} 
  column={RESPONSIVE_DESCRIPTIONS_COLUMN} 
  size="small"
>
  <Descriptions.Item label="字段">{value || '--'}</Descriptions.Item>
</Descriptions>
```

详细说明请参考 [UI 组件使用规范](./guidelines/UI_COMPONENT_STANDARDS.md)。

#### 数据存储规范

- 使用 `localStorage` 进行数据存储
- 启动时自动清理并加载静态数据
- 使用统一的数据访问工具函数

详细说明请参考 [数据存储规范](./guidelines/DATA_STANDARDS.md)。

### 💡 在 AI 对话中使用规范

与 AI 助手（如 Cursor, Antigravity）对话时，可以这样引用规范：

```
请按照 guidelines/UI_COMPONENT_STANDARDS.md 中的规范使用 Descriptions 组件
```

或：

```
请遵循项目中的样式规范（颜色使用规范）
```

更多方式请参考 [规范索引](./guidelines/INDEX.md#在-ai-对话中使用)。

## License

MIT

