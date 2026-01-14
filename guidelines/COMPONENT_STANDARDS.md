# 组件开发规范

本文档定义了项目的组件和页面开发标准。

## 目录

- [组件结构](#组件结构)
- [组件分类](#组件分类)
- [组件设计原则](#组件设计原则)
- [页面开发规范](#页面开发规范)

---

## 组件结构

### 标准组件结构

```typescript
import { FC } from 'react'
import { Button } from 'antd'

interface ComponentNameProps {
  title: string
  onAction?: () => void
}

/**
 * 组件说明
 * @param props - 组件属性
 */
const ComponentName: FC<ComponentNameProps> = ({ title, onAction }) => {
  // 1. Hooks 声明
  const [state, setState] = useState(false)

  // 2. 事件处理函数
  const handleClick = () => {
    setState(!state)
    onAction?.()
  }

  // 3. 副作用
  useEffect(() => {
    // ...
  }, [])

  // 4. 渲染逻辑
  return (
    <div>
      <h1>{title}</h1>
      <Button onClick={handleClick}>点击</Button>
    </div>
  )
}

export default ComponentName
```

---

## 组件分类

### 1. 页面组件 (Pages)

- 位置：`src/pages/`
- 命名：使用 PascalCase，如 `UserManagement`
- 职责：页面级别的组件，可以包含多个业务组件

```typescript
// src/pages/UserManagement/index.tsx
function UserManagement() {
  return (
    <div>
      {/* 页面内容 */}
    </div>
  )
}

export default UserManagement
```

### 2. 布局组件 (Layouts)

- 位置：`src/layouts/`
- 命名：使用 PascalCase + Layout，如 `MainLayout`
- 职责：定义页面的整体布局结构

```typescript
// src/layouts/MainLayout/index.tsx
function MainLayout() {
  return (
    <Layout>
      {/* 布局结构 */}
    </Layout>
  )
}

export default MainLayout
```

### 3. 公共组件 (Components)

- 位置：`src/components/`
- 命名：使用 PascalCase，如 `UserCard`
- 职责：可复用的业务组件

```typescript
// src/components/UserCard/index.tsx
interface UserCardProps {
  name: string
  avatar: string
}

function UserCard({ name, avatar }: UserCardProps) {
  return (
    <Card>
      {/* 组件内容 */}
    </Card>
  )
}

export default UserCard
```

---

## 组件设计原则

### 1. Props 设计

- 使用 TypeScript 接口定义 Props
- 必需属性放在前面，可选属性放在后面
- 提供合理的默认值

### 2. 状态管理

- 使用 `useState` 管理本地状态
- 状态命名清晰，如 `isLoading`, `userList`
- 避免过度使用状态，优先使用派生数据

### 3. 事件处理

- 事件处理函数使用 `handle` 前缀，如 `handleClick`
- 传递给子组件的回调函数使用 `on` 前缀，如 `onSubmit`

---

## 页面开发规范

### 页面结构

每个页面组件应该包含：

```
PageName/
├── index.tsx          # 页面主文件
├── components/        # 页面私有组件（可选）
└── styles.css        # 页面样式（可选）
```

### 页面开发流程

#### 1. 创建页面组件

```typescript
// src/pages/OrderList/index.tsx
import { Card, Table } from 'antd'

function OrderList() {
  return (
    <div>
      <Card title="订单列表">
        <Table />
      </Card>
    </div>
  )
}

export default OrderList
```

#### 2. 配置路由

```typescript
// src/routes/index.tsx
import OrderList from '@/pages/OrderList'

// 添加路由
<Route path="order-list" element={<OrderList />} />
```

#### 3. 配置菜单（如需要）

```typescript
// src/routes/menuConfig.tsx
{
  key: 'order-list',
  label: '订单列表',
  icon: <UnorderedListOutlined />,
  path: '/order-list',
}
```

### 页面导航

使用 React Router 的 `useNavigate` 进行页面跳转：

```typescript
import { useNavigate } from 'react-router-dom'

function MyComponent() {
  const navigate = useNavigate()

  const handleGoToDetail = (id: string) => {
    navigate(`/detail/${id}`)
  }

  return <Button onClick={() => handleGoToDetail('123')}>查看详情</Button>
}
```

---

## 代码审查检查清单

在代码审查时，请检查以下事项：

- [ ] 组件结构是否符合规范（Hooks、事件处理、副作用、渲染逻辑的顺序）
- [ ] Props 是否使用 TypeScript 接口定义
- [ ] 组件命名是否符合规范（PascalCase）
- [ ] 事件处理函数是否使用 `handle` 前缀
- [ ] 页面文件结构是否合理

---

## 相关资源

- [React 官方文档](https://react.dev/)
- [Ant Design 组件文档](https://ant.design/components/overview-cn/)













