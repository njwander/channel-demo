# 开发规范索引

本文档是项目开发规范的索引，帮助快速找到相关的规范文档。

## 📚 规范文档列表

### 核心规范

1. **[代码规范](./CODE_STANDARDS.md)**
   - 代码格式、文件组织
   - TypeScript 规范
   - 命名规范
   - 注释规范

2. **[组件开发规范](./COMPONENT_STANDARDS.md)**
   - 组件结构
   - 组件分类
   - 组件设计原则
   - 页面开发规范

3. **[样式规范](./STYLE_STANDARDS.md)**
   - 颜色使用规范
   - 样式方案（⚠️ 重要：Tailwind CSS 使用限制）
   - 响应式设计
   - 样式转换指南（从 Tailwind 到内联样式）
   - 常见问题排查

4. **[UI 组件使用规范](./UI_COMPONENT_STANDARDS.md)**
   - 响应式 Descriptions 组件规范
   - 表单字段布局规范
   - 其他组件规范

5. **[路由规范](./ROUTING_STANDARDS.md)**
   - 路由命名
   - 路由结构
   - 路由参数获取

6. **[数据存储规范](./DATA_STANDARDS.md)**
   - 存储方案
   - 数据初始化机制
   - 数据文件规范
   - 数据访问规范

7. **[最佳实践](./BEST_PRACTICES.md)**
   - 使用 Ant Design 组件
   - 合理使用 Hooks
   - 错误处理
   - 性能优化
   - Demo场景选择器开发模式

---

## 🎯 快速查找

### 按开发任务查找

#### 编写新组件
- [组件开发规范](./COMPONENT_STANDARDS.md) - 组件结构和设计原则
- [代码规范](./CODE_STANDARDS.md) - 代码格式和命名规范
- [样式规范](./STYLE_STANDARDS.md) - 样式方案和颜色使用（⚠️ 注意 Tailwind CSS 限制）

#### 使用 UI 组件
- [UI 组件使用规范](./UI_COMPONENT_STANDARDS.md) - Descriptions、表单字段等
- [样式规范](./STYLE_STANDARDS.md) - 颜色使用规范和样式方案

#### 修复样式问题
- [样式规范](./STYLE_STANDARDS.md) - 常见问题排查和样式转换指南
- 特别注意：从 Gemini 等 AI 工具生成的代码，需要将 Tailwind 类名转换为内联样式

#### 创建新页面
- [组件开发规范](./COMPONENT_STANDARDS.md) - 页面开发规范
- [路由规范](./ROUTING_STANDARDS.md) - 路由配置

#### 数据存储
- [数据存储规范](./DATA_STANDARDS.md) - 完整的存储方案

#### 性能优化
- [最佳实践](./BEST_PRACTICES.md) - 性能优化技巧

---

## 📋 规范优先级

当规范之间存在冲突时，按以下优先级：

1. **UI_COMPONENT_STANDARDS.md** - UI 组件使用规范（最高优先级）
2. **STYLE_STANDARDS.md** - 样式和颜色规范
3. **CODE_STANDARDS.md** - 代码规范
4. **其他规范文档**

---

## 🔍 在 AI 对话中使用

### 方式一：引用索引文档

```
请参考 guidelines/INDEX.md 中的开发规范
```

### 方式二：引用具体规范

```
请按照 guidelines/UI_COMPONENT_STANDARDS.md 中的规范使用 Descriptions 组件
```

### 方式三：说明规范类型

```
请遵循项目中的样式规范（颜色使用规范）
```

---

## 📝 规范更新记录

- **2024-12-XX**: 创建规范索引文档
- **2024-12-XX**: 拆分规范文档，创建独立的标准文件

---

## 🔗 相关资源

- [项目 README](../README.md) - 项目概览和快速开始
- [Ant Design 官方文档](https://ant.design/components/overview-cn/)
- [React 官方文档](https://react.dev/)
- [TypeScript 官方文档](https://www.typescriptlang.org/docs/)

