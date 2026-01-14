# UI 组件使用规范

本文档定义了项目中 UI 组件的标准使用方式，确保团队开发的一致性和代码质量。

> **注意**：颜色使用规范已移至 [STYLE_STANDARDS.md](./STYLE_STANDARDS.md)，请参考该文档。

## 目录

- [如何在 AI 对话中使用此规范](#如何在-ai-对话中使用此规范)
- [响应式 Descriptions 组件规范](#响应式-descriptions-组件规范)
- [表单字段布局规范](#表单字段布局规范)
- [其他组件规范](#其他组件规范)（待补充）

---

## 如何在 AI 对话中使用此规范

当你在与 AI 助手（如 Cursor、Claude、ChatGPT 等）对话时，可以通过以下方式让 AI 遵循此规范：

### 方式一：直接引用规范文档（推荐）

```
请按照 guidelines/UI_COMPONENT_STANDARDS.md 中的规范来使用 Descriptions 组件
```

### 方式二：引用规范名称

```
请使用项目中的响应式 Descriptions 组件规范
```

### 方式三：引用常量名称

```
请使用 RESPONSIVE_DESCRIPTIONS_COLUMN 常量来配置 Descriptions 组件
```

### 方式四：说明是项目规范

```
这是项目规范，请遵循：
- 使用 RESPONSIVE_DESCRIPTIONS_COLUMN 常量
- 设置 bordered={false} 和 size="small"
- 空值显示为 '--'
```

### 示例对话

**你：** "请在这个页面添加一个信息展示区域，使用 Descriptions 组件，按照 `guidelines/UI_COMPONENT_STANDARDS.md` 中的规范"

**AI：** 会自动使用 `RESPONSIVE_DESCRIPTIONS_COLUMN` 常量，并遵循所有规范要求。

### 提示

- 在开始新任务时，可以提前告诉 AI："请遵循项目中的 UI 组件使用规范"
- 如果 AI 没有遵循规范，可以提醒："请参考 `guidelines/UI_COMPONENT_STANDARDS.md`"
- 对于代码审查，可以说："请检查是否符合 `guidelines/UI_COMPONENT_STANDARDS.md` 中的规范"

---

## 响应式 Descriptions 组件规范

### 规范说明

在使用 Ant Design 的 `Descriptions` 组件展示表单信息时，**必须**使用响应式列数配置，以确保在不同屏幕尺寸下都有良好的显示效果。

### 响应式断点配置

根据 Ant Design 的默认断点系统，我们定义了以下响应式列数规则：

| 屏幕尺寸 | 断点 | 列数 | 说明 |
|---------|------|------|------|
| 超大屏幕 | xxl (≥1600px) | 4列 | 桌面大屏显示器 |
| 超大屏幕 | xl (≥1200px) | 4列 | 桌面显示器 |
| 大屏幕 | lg (≥992px) | 3列 | 平板横屏/小桌面 |
| 中等屏幕 | md (≥768px) | 2列 | 平板竖屏 |
| 小屏幕 | sm (≥576px) | 2列 | 大手机横屏 |
| 超小屏幕 | xs (<576px) | 1列 | 手机竖屏 |

### 标准配置代码

#### 方式一：使用项目提供的常量（推荐）

```tsx
import { Descriptions } from 'antd';
import { RESPONSIVE_DESCRIPTIONS_COLUMN } from '@/utils/descriptionsConfig';

<Descriptions 
  bordered={false} 
  column={RESPONSIVE_DESCRIPTIONS_COLUMN} 
  size="small"
>
  <Descriptions.Item label="字段1">值1</Descriptions.Item>
  <Descriptions.Item label="字段2">值2</Descriptions.Item>
  <Descriptions.Item label="字段3">值3</Descriptions.Item>
  <Descriptions.Item label="字段4">值4</Descriptions.Item>
</Descriptions>
```

**推荐使用常量方式**，可以确保全项目配置统一，且便于后续维护。

#### 方式二：直接配置对象

```tsx
import { Descriptions } from 'antd';

<Descriptions 
  bordered={false} 
  column={{
    xxl: 4,
    xl: 4,
    lg: 3,
    md: 2,
    sm: 2,
    xs: 1,
  }} 
  size="small"
>
  <Descriptions.Item label="字段1">值1</Descriptions.Item>
  <Descriptions.Item label="字段2">值2</Descriptions.Item>
  <Descriptions.Item label="字段3">值3</Descriptions.Item>
  <Descriptions.Item label="字段4">值4</Descriptions.Item>
</Descriptions>
```

### 必须遵循的属性

1. **`bordered={false}`** - 去掉边框，使界面更轻量
2. **`size="small"`** - 使用小尺寸，提高信息密度
3. **响应式 `column` 配置** - 必须使用对象形式配置，不能使用固定数字

### 使用示例

#### 示例 1：基础信息展示（推荐使用常量）

```tsx
import { RESPONSIVE_DESCRIPTIONS_COLUMN } from '@/utils/descriptionsConfig';

<Card title="基础信息" style={{ marginBottom: 16 }}>
  <Descriptions 
    bordered={false} 
    column={RESPONSIVE_DESCRIPTIONS_COLUMN} 
    size="small"
  >
    <Descriptions.Item label="客户全称">{customerInfo.fullName || '--'}</Descriptions.Item>
    <Descriptions.Item label="客户简称">{customerInfo.shortName || '--'}</Descriptions.Item>
    <Descriptions.Item label="所属行业">{customerInfo.industry || '--'}</Descriptions.Item>
    <Descriptions.Item label="客户来源">{customerInfo.source || '--'}</Descriptions.Item>
  </Descriptions>
</Card>
```

#### 示例 2：在函数中返回 Descriptions

```tsx
import { RESPONSIVE_DESCRIPTIONS_COLUMN } from '@/utils/descriptionsConfig';

const renderInfo = (data: InfoData) => {
  return (
    <Descriptions 
      bordered={false} 
      column={RESPONSIVE_DESCRIPTIONS_COLUMN} 
      size="small"
    >
      <Descriptions.Item label="企业名称">{data.name || '--'}</Descriptions.Item>
      <Descriptions.Item label="税号">{data.taxId || '--'}</Descriptions.Item>
      <Descriptions.Item label="地址">{data.address || '--'}</Descriptions.Item>
      <Descriptions.Item label="电话">{data.phone || '--'}</Descriptions.Item>
    </Descriptions>
  );
};
```

### 空值处理规范

所有字段值应统一处理空值，使用 `|| '--'` 或 `?? '--'` 来显示占位符：

```tsx
// ✅ 正确
<Descriptions.Item label="客户名称">{customerInfo.name || '--'}</Descriptions.Item>

// ❌ 错误 - 空值会显示空白
<Descriptions.Item label="客户名称">{customerInfo.name}</Descriptions.Item>
```

**使用 `'--'` 而非 `'-'` 的原因：**

1. **更好的辨识度**：两个连字符 `--` 比单个连字符 `-` 在视觉上更加突出，能够更清晰地表示这是一个空值占位符，而不是普通文本中的连字符
2. **避免歧义**：单个 `-` 可能在某些上下文中被误认为是减号、分隔符或其他符号，而 `--` 明确表示"无数据"
3. **用户体验**：在快速浏览界面时，`--` 更容易被识别为空值，减少用户的困惑

### 常见错误示例

#### ❌ 错误 1：使用固定列数

```tsx
// 错误：固定列数，无法响应式适配
<Descriptions column={4} size="small">
  {/* ... */}
</Descriptions>
```

#### ❌ 错误 2：缺少必要属性

```tsx
// 错误：缺少 bordered={false} 和 size="small"
<Descriptions 
  column={{
    xxl: 4,
    xl: 4,
    lg: 3,
    md: 2,
    sm: 2,
    xs: 1,
  }}
>
  {/* ... */}
</Descriptions>
```

#### ❌ 错误 3：使用不完整的响应式配置

```tsx
// 错误：缺少部分断点配置
<Descriptions 
  column={{
    lg: 3,
    md: 2,
  }}
  size="small"
>
  {/* ... */}
</Descriptions>
```

### 特殊情况处理

#### 需要跨多列的字段

如果某个字段需要跨多列显示（如长文本），可以使用 `span` 属性：

```tsx
<Descriptions 
  bordered={false} 
  column={{
    xxl: 4,
    xl: 4,
    lg: 3,
    md: 2,
    sm: 2,
    xs: 1,
  }} 
  size="small"
>
  <Descriptions.Item label="详细地址" span={4}>
    {address || '--'}
  </Descriptions.Item>
  <Descriptions.Item label="备注" span={4}>
    {remark || '--'}
  </Descriptions.Item>
</Descriptions>
```

**注意**：`span` 的值应该根据最大列数（4列）来设置，组件会自动适配到其他屏幕尺寸。

### 代码审查检查清单

在代码审查时，请检查以下事项：

- [ ] 是否使用了响应式 `column` 配置（对象形式）
- [ ] 是否设置了 `bordered={false}`
- [ ] 是否设置了 `size="small"`
- [ ] 是否包含了所有断点（xxl, xl, lg, md, sm, xs）
- [ ] 空值是否统一处理为 `--`
- [ ] 代码格式是否规范

### 常量配置位置

项目提供了统一的响应式列数配置常量，位置：
- `src/utils/descriptionsConfig.ts` - 导出 `RESPONSIVE_DESCRIPTIONS_COLUMN` 常量

**强烈建议使用此常量**，而不是在每个组件中重复定义配置对象。

### 参考实现

项目中的参考实现位置：
- `src/pages/customerDetail/:id/:tab/components/CustomerInfoTab.tsx` - 基础信息和开票信息示例

---

## 表单按钮布局规范

### 规范说明

本规范定义了表单操作按钮的标准布局方式，适用于所有表单提交场景，确保用户操作的一致性和可预期性。

### 核心设计原则

1. **按钮位置**：确认（主功能）按钮在右，取消按钮在左
2. **按钮颜色**：确认按钮使用主题色（`#ff5050`），取消按钮使用灰色
3. **按钮对齐**：按钮右对齐，确保主要操作按钮在用户视觉焦点位置
4. **按钮间距**：按钮之间保持适当间距（通常为 8px）

### 标准代码实现

#### 基础布局结构

```tsx
import { Button, Space } from 'antd'
import { SaveOutlined, CloseOutlined } from '@ant-design/icons'

<Form.Item>
  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
    <Button onClick={handleCancel}>
      取消
    </Button>
    <Button
      type="primary"
      htmlType="submit"
      icon={<SaveOutlined />}
      loading={loading}
    >
      确认
    </Button>
  </div>
</Form.Item>
```

#### 使用 Space 组件（推荐）

```tsx
import { Button, Space } from 'antd'
import { SaveOutlined } from '@ant-design/icons'

<Form.Item>
  <Space style={{ display: 'flex', justifyContent: 'flex-end' }}>
    <Button onClick={handleCancel}>
      取消
    </Button>
    <Button
      type="primary"
      htmlType="submit"
      icon={<SaveOutlined />}
      loading={loading}
    >
      确认
    </Button>
  </Space>
</Form.Item>
```

### 按钮样式规范

#### 确认按钮（主功能按钮）

- **类型**: `type="primary"`（使用主题色 `#ff5050`）
- **位置**: 右侧
- **图标**: 根据操作类型添加相应图标（如保存使用 `SaveOutlined`）
- **加载状态**: 提交时显示 `loading` 状态

#### 取消按钮

- **类型**: 默认类型（灰色）
- **位置**: 左侧
- **功能**: 取消当前操作，通常执行返回或重置操作

### 完整示例

```tsx
import { Form, Button, Space, message } from 'antd'
import { SaveOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'

function EditForm() {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSave = async () => {
    try {
      setLoading(true)
      const values = await form.validateFields()
      // 保存逻辑
      message.success('保存成功')
    } catch (error) {
      console.error('保存失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    navigate(-1) // 或 navigate('/path')
  }

  return (
    <Form form={form}>
      {/* 表单字段 */}
      
      <Form.Item>
        <Space style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button onClick={handleCancel}>
            取消
          </Button>
          <Button
            type="primary"
            htmlType="button"
            icon={<SaveOutlined />}
            onClick={handleSave}
            loading={loading}
          >
            确认
          </Button>
        </Space>
      </Form.Item>
    </Form>
  )
}
```

### 特殊情况处理

#### 只有确认按钮

如果表单不需要取消操作（如确认对话框），可以只显示确认按钮，但应右对齐：

```tsx
<Form.Item>
  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
    <Button
      type="primary"
      htmlType="submit"
      loading={loading}
    >
      确认
    </Button>
  </div>
</Form.Item>
```

#### 多个操作按钮

如果有多个操作按钮（如保存、保存并继续、取消），应按照重要性从左到右排列：

```tsx
<Form.Item>
  <Space style={{ display: 'flex', justifyContent: 'flex-end' }}>
    <Button onClick={handleCancel}>取消</Button>
    <Button onClick={handleSaveDraft}>保存草稿</Button>
    <Button
      type="primary"
      onClick={handleSave}
      loading={loading}
    >
      确认
    </Button>
  </Space>
</Form.Item>
```

### 代码审查检查清单

在代码审查时，请检查以下事项：

- [ ] 确认按钮是否在右侧
- [ ] 取消按钮是否在左侧
- [ ] 确认按钮是否使用 `type="primary"`（主题色）
- [ ] 取消按钮是否使用默认类型（灰色）
- [ ] 按钮是否右对齐
- [ ] 按钮之间是否有适当间距
- [ ] 提交时是否显示 loading 状态

---

## 表单字段布局规范

### 规范说明

本规范定义了表单字段的标准布局方式，适用于需要展示多个字段信息的场景，如客户档案、产品详情等。该规范采用上下布局（标签在上、值在下）、响应式多列网格布局，确保在不同屏幕尺寸下都有良好的显示效果。

### 核心设计原则

1. **上下布局**：字段标签在上，字段值在下，提高信息可读性
2. **响应式多列**：根据页面宽度自动调整每行字段数量
3. **语义化颜色**：根据字段值的语义使用不同颜色（参考[颜色使用规范](./STYLE_STANDARDS.md#颜色使用规范)）
4. **字体区分**：标签和值使用不同的字体大小和粗细进行区分
5. **区域分组**：使用黑色标题和灰色背景区分不同的区域

### 布局结构

#### 区域标题样式

- **背景色**: `#f5f5f5` (浅灰色)
- **文字颜色**: `#000000d9` (深灰色)
- **字体大小**: `14px`
- **字体粗细**: `600` (加粗)
- **内边距**: `10px 16px`
- **边框**: 底部 `1px solid #e8e8e8`

#### 字段容器样式

- **布局方式**: CSS Grid 响应式布局
- **最小宽度**: `250px` (每个字段的最小宽度)
- **网格配置**: `repeat(auto-fill, minmax(250px, 1fr))`
- **间距**: `12px` (字段之间的间距)
- **容器内边距**: `12px`

#### 字段项样式

- **布局方向**: `flex-direction: column` (上下布局)
- **内边距**: `10px 12px`
- **背景色**: `#fff` (白色)
- **无边框**: 不设置边框，保持简洁

### 字体规范

#### 字段标签（标签在上）

- **字体大小**: `12px`
- **字体颜色**: `#8c8c8c` (浅灰色)
- **字体粗细**: `400` (正常)
- **下边距**: `6px` (与值的间距)

#### 字段值（值在下）

- **字体大小**: `14px`
- **字体颜色**: 根据语义动态判断（见颜色判断逻辑）
- **字体粗细**: `500` (中等，有值时) / `400` (正常，空值时)
- **字体样式**: 空值时使用 `italic` (斜体)

#### 区域标题

- **字体大小**: `14px`
- **字体颜色**: `#000000d9` (深灰色)
- **字体粗细**: `600` (加粗)

### 颜色使用规范

字段值的颜色根据字段名和值的语义自动判断，遵循[颜色使用规范](./STYLE_STANDARDS.md#颜色使用规范)：

- **绿色 (#52c41a)**: 累计、收入、付款、已完成、已通过等正向信息
- **红色 (#ff5050)**: 应收、未开票、未交付、过期、风险等需要关注的信息
- **橙色 (#faad14)**: 待处理、审批中、试用中、进行中等中间状态
- **默认色 (#000000d9)**: 常规信息
- **空值色 (#bfbfbf)**: 空值或未填写

### 标准代码实现

#### 1. 区域容器结构

```tsx
<div
  style={{
    marginBottom: 16,
    backgroundColor: '#fff',
    border: '1px solid #f0f0f0',
    borderRadius: '4px',
    overflow: 'hidden',
  }}
>
  {/* 区域标题 */}
  <div
    style={{
      backgroundColor: '#f5f5f5',
      padding: '10px 16px',
      borderBottom: '1px solid #e8e8e8',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      cursor: 'pointer',
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <span style={{ fontSize: '14px', color: '#000000d9', fontWeight: 600 }}>
        {groupIcon}
      </span>
      <span style={{ fontSize: '14px', color: '#000000d9', fontWeight: 600 }}>
        {groupName}
      </span>
      <span style={{ color: '#00000073', fontSize: '12px', fontWeight: 400 }}>
        ({fields.length} 项)
      </span>
    </div>
    {/* 展开/收起图标 */}
  </div>

  {/* 字段列表 - 响应式多列布局 */}
  <div
    style={{
      backgroundColor: '#fff',
      padding: '12px',
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
      gap: '12px',
    }}
  >
    {fields.map((field) => renderField(field))}
  </div>
</div>
```

#### 2. 单个字段渲染

```tsx
const renderField = (field: FieldType) => {
  const fieldValue = values[field.name];
  const isEditable = !field.readonly;
  const hasValue = fieldValue !== null && fieldValue !== undefined && fieldValue !== '';
  const valueColor = getFieldValueColor(field, fieldValue);

  return (
    <div
      key={field.name}
      style={{
        padding: '10px 12px',
        backgroundColor: '#fff',
        transition: 'all 0.2s',
        minWidth: '250px',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* 字段标签 - 在上 */}
      <div
        style={{
          fontSize: '12px',
          color: '#8c8c8c',
          fontWeight: 400,
          marginBottom: '6px',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
        }}
      >
        <span>{field.label}</span>
        {field.required && (
          <span style={{ color: '#ff5050', fontWeight: 'bold' }}>*</span>
        )}
        {field.description && (
          <Tooltip title={field.description} placement="top">
            <QuestionCircleOutlined
              style={{ fontSize: '11px', color: '#bfbfbf', cursor: 'help' }}
            />
          </Tooltip>
        )}
      </div>

      {/* 字段值 - 在下 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          minHeight: '22px',
        }}
      >
        <div
          style={{
            flex: 1,
            fontSize: '14px',
            color: hasValue ? valueColor : '#bfbfbf',
            fontWeight: hasValue ? 500 : 400,
            fontStyle: hasValue ? 'normal' : 'italic',
            lineHeight: '1.5',
            wordBreak: 'break-word',
          }}
        >
          {hasValue ? fieldValue : '--'}
        </div>
        {isEditable && (
          <EditOutlined
            style={{
              color: '#ff5050',
              fontSize: '12px',
              marginLeft: '8px',
              flexShrink: 0,
              cursor: 'pointer',
              opacity: 0.7,
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '1';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '0.7';
            }}
            onClick={() => handleEdit(field)}
          />
        )}
      </div>
    </div>
  );
};
```

#### 3. 颜色判断函数

```tsx
/**
 * 根据字段值和字段名判断应该使用的颜色
 * 遵循项目的颜色使用规范
 */
const getFieldValueColor = (field: FieldType, value: any): string => {
  // 空值使用灰色
  if (value === null || value === undefined || value === '') {
    return '#bfbfbf';
  }

  const fieldName = field.name;
  const valueStr = String(value).toLowerCase();

  // 正向/成功类字段 - 绿色 (#52c41a)
  if (
    fieldName.includes('累计') ||
    fieldName.includes('收入') ||
    fieldName.includes('付款') ||
    fieldName.includes('已') ||
    fieldName.includes('完成') ||
    fieldName.includes('通过') ||
    fieldName.includes('使用中') ||
    valueStr.includes('已通过') ||
    valueStr.includes('已完成') ||
    valueStr.includes('使用中')
  ) {
    return '#52c41a';
  }

  // 风险/需要关注类字段 - 红色 (#ff5050)
  if (
    fieldName.includes('应收') ||
    fieldName.includes('未开票') ||
    fieldName.includes('未交付') ||
    fieldName.includes('过期') ||
    fieldName.includes('撤销') ||
    fieldName.includes('风险') ||
    valueStr.includes('已过期') ||
    valueStr.includes('未交付') ||
    valueStr.includes('撤销')
  ) {
    return '#ff5050';
  }

  // 警告/待处理类字段 - 橙色 (#faad14)
  if (
    fieldName.includes('待处理') ||
    fieldName.includes('审批') ||
    fieldName.includes('试用') ||
    fieldName.includes('进行中') ||
    valueStr.includes('审批中') ||
    valueStr.includes('试用中') ||
    valueStr.includes('进行中')
  ) {
    return '#faad14';
  }

  // 默认使用深灰色
  return '#000000d9';
};
```

### 响应式自适应说明

#### Grid 布局配置

使用 CSS Grid 的 `repeat(auto-fill, minmax(250px, 1fr))` 实现响应式布局：

- **`minmax(250px, 1fr)`**: 每个字段最小宽度 250px，最大宽度自适应
- **`auto-fill`**: 自动填充可用空间，根据容器宽度自动计算列数
- **`gap: '12px'`**: 字段之间的间距

#### 自适应行为

- **大屏幕** (≥1000px): 每行显示 4-5 个字段
- **中等屏幕** (768px - 999px): 每行显示 3 个字段
- **小屏幕** (500px - 767px): 每行显示 2 个字段
- **超小屏幕** (<500px): 每行显示 1 个字段

### 必须遵循的属性

1. **上下布局**: 必须使用 `flex-direction: column`
2. **响应式网格**: 必须使用 `grid-template-columns: repeat(auto-fill, minmax(250px, 1fr))`
3. **字体大小**: 标签 `12px`，值 `14px`
4. **颜色语义化**: 必须使用 `getFieldValueColor` 函数判断颜色
5. **区域标题**: 必须使用黑色标题 (`#000000d9`) 和灰色背景 (`#f5f5f5`)
6. **无边框**: 字段项不设置边框

### 使用示例

#### 完整示例

```tsx
import { useState } from 'react';
import { Tooltip } from 'antd';
import { EditOutlined, QuestionCircleOutlined } from '@ant-design/icons';

interface Field {
  name: string;
  label: string;
  required?: boolean;
  description?: string;
  readonly?: boolean;
}

function FormFieldsLayout({ fields, values }: { fields: Field[]; values: Record<string, any> }) {
  const [editingField, setEditingField] = useState<Field | null>(null);

  const getFieldValueColor = (field: Field, value: any): string => {
    if (value === null || value === undefined || value === '') {
      return '#bfbfbf';
    }
    // ... 颜色判断逻辑（见上方代码）
    return '#000000d9';
  };

  const renderField = (field: Field) => {
    const fieldValue = values[field.name];
    const isEditable = !field.readonly;
    const hasValue = fieldValue !== null && fieldValue !== undefined && fieldValue !== '';
    const valueColor = getFieldValueColor(field, fieldValue);

    return (
      <div
        key={field.name}
        style={{
          padding: '10px 12px',
          backgroundColor: '#fff',
          minWidth: '250px',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* 字段标签 */}
        <div
          style={{
            fontSize: '12px',
            color: '#8c8c8c',
            fontWeight: 400,
            marginBottom: '6px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <span>{field.label}</span>
          {field.required && (
            <span style={{ color: '#ff5050', fontWeight: 'bold' }}>*</span>
          )}
          {field.description && (
            <Tooltip title={field.description} placement="top">
              <QuestionCircleOutlined
                style={{ fontSize: '11px', color: '#bfbfbf', cursor: 'help' }}
              />
            </Tooltip>
          )}
        </div>

        {/* 字段值 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            minHeight: '22px',
          }}
        >
          <div
            style={{
              flex: 1,
              fontSize: '14px',
              color: hasValue ? valueColor : '#bfbfbf',
              fontWeight: hasValue ? 500 : 400,
              fontStyle: hasValue ? 'normal' : 'italic',
            }}
          >
            {hasValue ? fieldValue : '--'}
          </div>
          {isEditable && (
            <EditOutlined
              style={{
                color: '#ff5050',
                fontSize: '12px',
                marginLeft: '8px',
                cursor: 'pointer',
                opacity: 0.7,
              }}
              onClick={() => setEditingField(field)}
            />
          )}
        </div>
      </div>
    );
  };

  return (
    <div
      style={{
        backgroundColor: '#fff',
        padding: '12px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
        gap: '12px',
      }}
    >
      {fields.map((field) => renderField(field))}
    </div>
  );
}
```

### 常见错误示例

#### ❌ 错误 1：使用固定列数

```tsx
// 错误：固定列数，无法响应式适配
<div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)' }}>
  {fields.map(renderField)}
</div>
```

#### ❌ 错误 2：左右布局而非上下布局

```tsx
// 错误：标签和值左右排列
<div style={{ display: 'flex', flexDirection: 'row' }}>
  <span>标签</span>
  <span>值</span>
</div>
```

#### ❌ 错误 3：缺少颜色语义化

```tsx
// 错误：所有值使用相同颜色
<div style={{ color: '#000' }}>{value}</div>
```

#### ❌ 错误 4：字段有边框

```tsx
// 错误：不应该设置边框
<div style={{ border: '1px solid #f0f0f0' }}>
  {/* ... */}
</div>
```

### 代码审查检查清单

在代码审查时，请检查以下事项：

- [ ] 是否使用上下布局（`flex-direction: column`）
- [ ] 是否使用响应式网格布局（`repeat(auto-fill, minmax(250px, 1fr))`）
- [ ] 字段标签字体大小是否为 `12px`，颜色是否为 `#8c8c8c`
- [ ] 字段值字体大小是否为 `14px`，是否使用语义化颜色
- [ ] 区域标题是否使用黑色文字 (`#000000d9`) 和灰色背景 (`#f5f5f5`)
- [ ] 字段项是否没有边框
- [ ] 是否实现了颜色判断函数
- [ ] 空值是否显示为 `--` 并使用灰色

### 参考实现

项目中的参考实现位置：
- `src/pages/customerDetail/:id/:tab/components/CustomerProfileTab.tsx` - 客户档案表单字段布局完整示例

---

## 其他组件规范

（待补充其他组件的使用规范）

---

## 更新记录

- **2024-12-XX**: 创建文档，定义响应式 Descriptions 组件使用规范
- **2024-12-XX**: 整合颜色使用规范到本文档
- **2024-12-XX**: 新增表单字段布局规范，定义上下布局、响应式多列、语义化颜色等标准

---

## 相关资源

- [Ant Design Descriptions 组件文档](https://ant.design/components/descriptions-cn/)
- [Ant Design 响应式栅格系统](https://ant.design/components/grid-cn/#Col)

