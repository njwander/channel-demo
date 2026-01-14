# 样式规范

本文档定义了项目的样式使用标准，包括颜色使用规范、样式方案和响应式设计。

## 目录

- [颜色使用规范](#颜色使用规范)
- [样式方案](#样式方案)
- [响应式设计](#响应式设计)

---

## 颜色使用规范

### 规范说明

本项目采用统一的颜色体系，确保界面的一致性和专业性。所有 UI 组件在使用颜色时，必须遵循以下规范。

### 主题色系

#### 主色调
- **主题色**: `#ff5050` (红色) - 用于品牌标识和重要操作
- **成功色**: `#52c41a` (绿色) - 用于表示成功、完成、正向状态
- **警告色**: `#faad14` (橙色) - 用于表示警告、待处理、需要注意的状态

#### 中性色
- **默认色**: `#000000d9` (深灰色) - 用于常规文本和默认状态
- **次要色**: `#00000073` (浅灰色) - 用于辅助信息和次要内容

### 颜色使用原则

#### 语义化使用
- **红色 (#ff5050)**: 用于表示需要关注、风险、错误、应收等负面或重要信息
- **绿色 (#52c41a)**: 用于表示成功、完成、收入、正向等积极信息
- **橙色 (#faad14)**: 用于表示警告、待处理、进行中等中间状态

#### 使用场景
- **数据指标**: 根据数据性质选择对应颜色
  - 收入类数据: 绿色
  - 支出/风险类数据: 红色
  - 待处理/进行中数据: 橙色
- **状态标签**: 根据状态含义选择对应颜色
- **按钮操作**: 根据操作重要性选择对应颜色

### 具体应用示例

#### 客户详情页面指标颜色
```typescript
// 基础信息 - 默认色
CRM编码: 默认色 (#000000d9)
合同金额: 默认色 (#000000d9)

// 正向信息 - 绿色
累计付款: #52c41a

// 需要关注 - 红色
应收金额: #ff5050
未开票金额: #ff5050

// 待处理状态 - 橙色
未签约合同: #faad14
进行中购买清单: #faad14
```

#### 状态标签颜色映射
```typescript
const statusColorMap = {
  // 成功状态 - 绿色
  '已通过': '#52c41a',
  '已完成': '#52c41a',
  '使用中': '#52c41a',
  
  // 警告状态 - 橙色
  '审批中': '#faad14',
  '试用中': '#faad14',
  '进行中': '#faad14',
  
  // 风险状态 - 红色
  '已过期': '#ff5050',
  '未交付': '#ff5050',
  '撤销': '#ff5050'
}
```

### 实施规范

#### 颜色变量定义
建议在项目中定义颜色常量：
```typescript
export const COLORS = {
  PRIMARY: '#ff5050',      // 主题色
  SUCCESS: '#52c41a',      // 成功色
  WARNING: '#faad14',      // 警告色
  DEFAULT: '#000000d9',    // 默认色
  SECONDARY: '#00000073'   // 次要色
} as const
```

#### 使用建议
1. **保持一致性**: 相同语义的信息使用相同颜色
2. **避免过度使用**: 单个页面颜色种类不超过3种
3. **考虑可访问性**: 确保颜色对比度符合WCAG标准
4. **语义优先**: 优先考虑颜色的语义含义，而非视觉效果

### 禁止事项
- 禁止随意使用其他颜色，必须从规范色系中选择
- 禁止在同一页面使用超过3种不同的强调色
- 禁止使用纯黑色 (#000000) 作为文本色
- 禁止使用过于鲜艳或刺眼的颜色

### 代码审查检查清单

在代码审查时，请检查以下事项：
- [ ] 颜色值是否来自规范色系
- [ ] 相同语义的信息是否使用相同颜色
- [ ] 单个页面是否使用了超过3种不同的强调色
- [ ] 是否避免了使用纯黑色 (#000000) 作为文本色
- [ ] 颜色对比度是否符合可访问性标准

---

## 样式方案

### 样式方案优先级

推荐按以下优先级选择样式方案：

1. **Ant Design 内置样式** - 优先使用 Ant Design 组件的 `style` 属性
2. **内联样式 (Inline Styles)** - 使用 React 的 `style` 属性
3. **CSS Modules** - 组件私有样式
4. **全局样式** - 仅用于全局性的样式定义

### ⚠️ 重要：Tailwind CSS 使用限制

**问题背景：**
在项目中，虽然配置了 Tailwind CSS，但在某些情况下（特别是从 Gemini 等 AI 工具生成的代码），使用 Tailwind 类名可能导致样式不生效。

**常见问题：**
1. Tailwind 类名未正确编译（如 `className="flex items-center gap-3"`）
2. 类名在运行时未正确应用
3. 样式优先级冲突

**解决方案：**
**优先使用内联样式或 Ant Design 的样式系统**，而不是 Tailwind CSS 类名。

**错误示例：**
```typescript
// ❌ 不推荐：使用 Tailwind 类名
<div className="flex items-center gap-3 mb-4">
  <div className="text-xs text-gray-500">标签</div>
</div>
```

**正确示例：**
```typescript
// ✅ 推荐：使用内联样式
<div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
  <div style={{ fontSize: 12, color: '#8c8c8c' }}>标签</div>
</div>

// ✅ 或者使用 Ant Design 的 Space 组件
<Space align="center" size={12} style={{ marginBottom: 16 }}>
  <Text type="secondary" style={{ fontSize: 12 }}>标签</Text>
</Space>
```

**样式值参考：**
```typescript
// 常用样式值映射
const styleMappings = {
  // 间距
  gap: {
    'gap-1': 4,
    'gap-2': 8,
    'gap-3': 12,
    'gap-4': 16,
  },
  // 字体大小
  fontSize: {
    'text-xs': 12,
    'text-sm': 14,
    'text-base': 16,
    'text-lg': 18,
  },
  // 颜色
  color: {
    'text-gray-400': '#bfbfbf',
    'text-gray-500': '#8c8c8c',
    'text-gray-600': '#595959',
    'text-gray-900': '#262626',
  },
  // 布局
  display: {
    'flex': 'flex',
    'block': 'block',
    'inline-block': 'inline-block',
  },
  // 对齐
  alignItems: {
    'items-center': 'center',
    'items-start': 'flex-start',
    'items-end': 'flex-end',
  },
  justifyContent: {
    'justify-between': 'space-between',
    'justify-center': 'center',
    'justify-start': 'flex-start',
  },
}
```

**最佳实践：**
1. **新组件开发**：直接使用内联样式，避免 Tailwind 类名
2. **代码审查**：检查是否有 Tailwind 类名，如有则转换为内联样式
3. **AI 生成代码**：从 Gemini 等工具生成的代码，需要将 Tailwind 类名转换为内联样式
4. **一致性**：保持项目中样式使用方式的一致性

### 使用 Ant Design 样式

```typescript
import { Card } from 'antd'

function MyComponent() {
  return (
    <Card
      style={{ marginBottom: 16 }}
      bodyStyle={{ padding: 24 }}
    >
      内容
    </Card>
  )
}
```

### 使用内联样式

```typescript
// 基础用法
<div style={{ 
  display: 'flex', 
  justifyContent: 'space-between',
  marginTop: 20 
}}>
  内容
</div>

// 复杂样式示例
<div style={{
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  marginBottom: 16,
  padding: '16px 24px',
  background: 'white',
  borderRadius: 8,
  border: '1px solid #f0f0f0',
  boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
}}>
  内容
</div>
```

### 样式转换指南（从 Tailwind 到内联样式）

当遇到 Tailwind 类名时，按以下规则转换：

| Tailwind 类名 | 内联样式 |
|-------------|---------|
| `flex` | `display: 'flex'` |
| `items-center` | `alignItems: 'center'` |
| `justify-between` | `justifyContent: 'space-between'` |
| `gap-3` | `gap: 12` |
| `mb-4` | `marginBottom: 16` |
| `p-4` | `padding: 16` |
| `px-4` | `paddingLeft: 16, paddingRight: 16` |
| `py-2` | `paddingTop: 8, paddingBottom: 8` |
| `text-xs` | `fontSize: 12` |
| `text-gray-500` | `color: '#8c8c8c'` |
| `font-bold` | `fontWeight: 'bold'` |
| `rounded-lg` | `borderRadius: 8` |
| `shadow-sm` | `boxShadow: '0 2px 8px rgba(0,0,0,0.06)'` |
| `bg-white` | `background: 'white'` |
| `border` | `border: '1px solid #f0f0f0'` |
| `w-full` | `width: '100%'` |
| `h-full` | `height: '100%'` |
| `text-center` | `textAlign: 'center'` |
| `uppercase` | `textTransform: 'uppercase'` |

---

## 响应式设计

### 使用 Ant Design 的栅格系统

```typescript
import { Row, Col } from 'antd'

<Row gutter={16}>
  <Col xs={24} sm={12} md={8} lg={6}>
    内容
  </Col>
</Row>
```

### 响应式断点

根据 Ant Design 的默认断点系统：

| 屏幕尺寸 | 断点 | 说明 |
|---------|------|------|
| 超大屏幕 | xxl (≥1600px) | 桌面大屏显示器 |
| 超大屏幕 | xl (≥1200px) | 桌面显示器 |
| 大屏幕 | lg (≥992px) | 平板横屏/小桌面 |
| 中等屏幕 | md (≥768px) | 平板竖屏 |
| 小屏幕 | sm (≥576px) | 大手机横屏 |
| 超小屏幕 | xs (<576px) | 手机竖屏 |

---

## 相关资源

- [Ant Design 设计语言](https://ant.design/docs/spec/introduce-cn)
- [Ant Design 响应式栅格系统](https://ant.design/components/grid-cn/#Col)
- [WCAG 可访问性标准](https://www.w3.org/WAI/WCAG21/quickref/)

