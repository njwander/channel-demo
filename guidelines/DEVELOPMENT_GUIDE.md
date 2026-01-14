# 开发规范文档

> **⚠️ 重要提示**：本文档的内容已拆分为多个独立的规范文件，请参考 [规范索引](./INDEX.md) 获取最新的规范文档。
> 
> 本文档保留作为历史参考，建议使用新的规范文件结构：
> - [规范索引](./INDEX.md) - 所有规范文档的索引
> - [代码规范](./CODE_STANDARDS.md) - 代码、TypeScript、命名、注释规范
> - [组件开发规范](./COMPONENT_STANDARDS.md) - 组件和页面开发规范
> - [样式规范](./STYLE_STANDARDS.md) - 样式和颜色规范
> - [UI 组件使用规范](./UI_COMPONENT_STANDARDS.md) - UI 组件使用规范
> - [路由规范](./ROUTING_STANDARDS.md) - 路由规范
> - [数据存储规范](./DATA_STANDARDS.md) - 数据存储规范
> - [最佳实践](./BEST_PRACTICES.md) - 最佳实践

---

本文档定义了 OMS AntX Demo 项目的开发规范和最佳实践。

## 目录

- [代码规范](#代码规范)
- [组件开发规范](#组件开发规范)
- [页面开发规范](#页面开发规范)
- [样式规范](#样式规范)
- [路由规范](#路由规范)
- [TypeScript 规范](#typescript-规范)
- [命名规范](#命名规范)

---

## 代码规范

### 基本原则

1. **保持简洁**：代码应该简洁、清晰、易于理解
2. **单一职责**：每个函数/组件只做一件事
3. **可复用性**：抽取可复用的逻辑和组件
4. **类型安全**：充分利用 TypeScript 的类型系统

### 代码格式

- 使用 2 个空格缩进
- 使用单引号 `'` 而不是双引号 `"`
- 语句结尾不使用分号（遵循 ESLint 配置）
- 每行代码不超过 100 个字符

### 文件组织

```typescript
// 1. 导入 React 相关
import { useState, useEffect } from 'react'

// 2. 导入第三方库
import { Button, Form } from 'antd'

// 3. 导入项目内部模块
import CustomComponent from '@/components/CustomComponent'
import { helper } from '@/utils/helper'

// 4. 导入类型定义
import type { UserInfo } from '@/types'

// 5. 导入样式
import './styles.css'
```

---

## 组件开发规范

### 组件结构

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

### 组件分类

#### 1. 页面组件 (Pages)

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

#### 2. 布局组件 (Layouts)

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

#### 3. 公共组件 (Components)

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

### 组件设计原则

1. **Props 设计**
   - 使用 TypeScript 接口定义 Props
   - 必需属性放在前面，可选属性放在后面
   - 提供合理的默认值

2. **状态管理**
   - 使用 `useState` 管理本地状态
   - 状态命名清晰，如 `isLoading`, `userList`
   - 避免过度使用状态，优先使用派生数据

3. **事件处理**
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

1. **创建页面组件**

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

2. **配置路由**

```typescript
// src/routes/index.tsx
import OrderList from '@/pages/OrderList'

// 添加路由
<Route path="order-list" element={<OrderList />} />
```

3. **配置菜单**（如需要）

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

## 样式规范

### 样式方案

推荐按以下优先级选择样式方案：

1. **Ant Design 内置样式** - 优先使用 Ant Design 组件的 `style` 属性
2. **CSS Modules** - 组件私有样式
3. **全局样式** - 仅用于全局性的样式定义

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

### 使用行内样式

```typescript
<div style={{ 
  display: 'flex', 
  justifyContent: 'space-between',
  marginTop: 20 
}}>
  内容
</div>
```

### 响应式设计

使用 Ant Design 的栅格系统：

```typescript
import { Row, Col } from 'antd'

<Row gutter={16}>
  <Col xs={24} sm={12} md={8} lg={6}>
    内容
  </Col>
</Row>
```

---

## 路由规范

### 路由命名

- 使用小写字母和连字符
- 路径应该语义化，清晰表达页面内容

```typescript
// ✅ 推荐
/user-management
/order-detail/:id
/settings/profile

// ❌ 不推荐
/UserManagement
/order_detail/:id
/s/p
```

### 路由结构

```typescript
<Routes>
  <Route path="/" element={<MainLayout />}>
    {/* 重定向到首页 */}
    <Route index element={<Navigate to="/home" replace />} />
    
    {/* 一级路由 */}
    <Route path="home" element={<Home />} />
    <Route path="users" element={<Users />} />
    
    {/* 带参数的路由 */}
    <Route path="user/:id" element={<UserDetail />} />
    
    {/* 404 页面 */}
    <Route path="*" element={<NotFound />} />
  </Route>
</Routes>
```

### 路由参数获取

```typescript
import { useParams, useNavigate } from 'react-router-dom'

function UserDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  return (
    <div>
      <p>用户ID: {id}</p>
      <Button onClick={() => navigate(-1)}>返回</Button>
    </div>
  )
}
```

---

## TypeScript 规范

### 类型定义

```typescript
// ✅ 推荐：使用 interface 定义对象类型
interface User {
  id: string
  name: string
  age: number
}

// ✅ 推荐：使用 type 定义联合类型、交叉类型
type Status = 'active' | 'inactive' | 'pending'
type UserWithStatus = User & { status: Status }

// ✅ 推荐：导出类型供其他模块使用
export interface UserListProps {
  users: User[]
  onSelect: (user: User) => void
}
```

### 函数类型

```typescript
// 函数声明
function getUserName(user: User): string {
  return user.name
}

// 箭头函数
const getUserAge = (user: User): number => {
  return user.age
}

// 函数类型
type HandleSubmit = (values: FormValues) => void
```

### 泛型使用

```typescript
// 泛型函数
function createList<T>(items: T[]): T[] {
  return [...items]
}

// 泛型组件
interface ListProps<T> {
  items: T[]
  renderItem: (item: T) => React.ReactNode
}

function List<T>({ items, renderItem }: ListProps<T>) {
  return <div>{items.map(renderItem)}</div>
}
```

### 避免使用 any

```typescript
// ❌ 不推荐
const data: any = fetchData()

// ✅ 推荐：使用具体类型
interface ApiResponse {
  code: number
  data: User[]
}

const response: ApiResponse = fetchData()

// ✅ 推荐：实在不知道类型时使用 unknown
const data: unknown = fetchData()
```

---

## 命名规范

### 文件命名

- **组件文件**：使用 PascalCase
  - `UserList.tsx`
  - `OrderDetail.tsx`

- **工具函数文件**：使用 camelCase
  - `formatDate.ts`
  - `validateForm.ts`

- **样式文件**：使用 camelCase 或 kebab-case
  - `styles.css`
  - `user-list.css`

### 变量命名

```typescript
// 普通变量：camelCase
const userName = 'John'
const userAge = 25

// 常量：UPPER_SNAKE_CASE
const MAX_COUNT = 100
const API_BASE_URL = 'https://api.example.com'

// 布尔值：使用 is/has/can 前缀
const isLoading = true
const hasPermission = false
const canEdit = true

// 数组：使用复数形式
const users = []
const orderList = []

// 对象：使用单数形式
const user = {}
const config = {}
```

### 函数命名

```typescript
// 事件处理：handle + 动作
const handleClick = () => {}
const handleSubmit = () => {}
const handleChange = () => {}

// 获取数据：get + 名称
const getUserInfo = () => {}
const getOrderList = () => {}

// 设置数据：set + 名称
const setUserName = () => {}
const setSelectedItems = () => {}

// 布尔值判断：is/has/can/should + 描述
const isValidEmail = () => {}
const hasPermission = () => {}
const canDelete = () => {}
```

### 组件命名

```typescript
// ✅ 推荐：使用 PascalCase
function UserProfile() {}
function OrderList() {}
function PaymentModal() {}

// ❌ 不推荐
function userProfile() {}
function order_list() {}
```

---

## 注释规范

### 组件注释

```typescript
/**
 * 用户列表组件
 * 展示用户列表并支持搜索、筛选功能
 * 
 * @example
 * ```tsx
 * <UserList onSelect={(user) => console.log(user)} />
 * ```
 */
function UserList({ onSelect }: UserListProps) {
  // ...
}
```

### 函数注释

```typescript
/**
 * 格式化日期
 * @param date - 日期对象或时间戳
 * @param format - 格式化模板，默认为 'YYYY-MM-DD'
 * @returns 格式化后的日期字符串
 */
function formatDate(date: Date | number, format = 'YYYY-MM-DD'): string {
  // ...
}
```

### 复杂逻辑注释

```typescript
function processOrder(order: Order) {
  // 第一步：验证订单状态
  if (!isValidOrder(order)) {
    return false
  }

  // 第二步：计算订单金额
  const totalAmount = calculateAmount(order)

  // 第三步：提交订单
  return submitOrder(order, totalAmount)
}
```

---

## 最佳实践

### 1. 使用 Ant Design 组件

充分利用 Ant Design 提供的组件，避免重复造轮子：

```typescript
import { Form, Input, Button, message } from 'antd'

function LoginForm() {
  const [form] = Form.useForm()

  const onFinish = (values: any) => {
    console.log(values)
    message.success('登录成功')
  }

  return (
    <Form form={form} onFinish={onFinish}>
      <Form.Item name="username" rules={[{ required: true }]}>
        <Input placeholder="用户名" />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit">
          提交
        </Button>
      </Form.Item>
    </Form>
  )
}
```

### 2. 合理使用 Hooks

```typescript
// ✅ 推荐：自定义 Hook 封装可复用逻辑
function useUserInfo(userId: string) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    // 模拟数据获取
    setTimeout(() => {
      setUser({ id: userId, name: 'John' })
      setLoading(false)
    }, 1000)
  }, [userId])

  return { user, loading }
}

// 使用
function UserProfile({ userId }: { userId: string }) {
  const { user, loading } = useUserInfo(userId)

  if (loading) return <div>加载中...</div>
  return <div>{user?.name}</div>
}
```

### 3. 错误处理

```typescript
// ✅ 推荐：优雅的错误处理
const handleSubmit = async (values: FormValues) => {
  try {
    setLoading(true)
    // 处理表单提交
    message.success('提交成功')
  } catch (error) {
    console.error('提交失败:', error)
    message.error('提交失败，请稍后重试')
  } finally {
    setLoading(false)
  }
}
```

### 4. 性能优化

```typescript
import { useMemo, useCallback } from 'react'

function ExpensiveComponent({ data }: { data: Item[] }) {
  // 使用 useMemo 缓存计算结果
  const processedData = useMemo(() => {
    return data.map(item => ({
      ...item,
      processed: true
    }))
  }, [data])

  // 使用 useCallback 缓存函数
  const handleClick = useCallback((id: string) => {
    console.log('Clicked:', id)
  }, [])

  return (
    <div>
      {processedData.map(item => (
        <div key={item.id} onClick={() => handleClick(item.id)}>
          {item.name}
        </div>
      ))}
    </div>
  )
}
```

### 5. Demo场景选择器开发模式

#### 5.1 设计思路

场景选择器是一种Demo开发模式，通过模拟不同业务场景来展示系统的各种状态。特别适合产品演示和开发测试。

#### 5.2 实现方式

##### 场景配置

```typescript
// 场景类型定义
export type DemoScenario = 'scenario-a' | 'scenario-b' | 'scenario-c'

// 场景配置
export const scenarioConfigs = [
  {
    id: 'scenario-a',
    name: '场景A：正常流程',
    data: { status: 'normal' },
    uiState: { buttonsDisabled: false }
  },
  {
    id: 'scenario-b', 
    name: '场景B：异常处理',
    data: { status: 'error' },
    uiState: { buttonsDisabled: true }
  }
]
```

##### 场景选择器组件

```typescript
const ScenarioSelector = ({ currentScenario, scenarioConfigs, onScenarioChange }) => {
  return (
    <Card style={{ backgroundColor: '#f6ffed', border: '1px solid #b7eb8f' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontWeight: 'bold', color: '#52c41a' }}>[Demo演示助手]</span>
        <span>选择一个场景：</span>
        <Select
          value={currentScenario}
          onChange={onScenarioChange}
          style={{ width: 300 }}
          options={scenarioConfigs.map(config => ({
            value: config.id,
            label: config.name
          }))}
        />
      </div>
    </Card>
  )
}
```

##### 页面使用

```typescript
function DemoPage() {
  const [currentScenario, setCurrentScenario] = useState('scenario-a')
  const currentConfig = scenarioConfigs.find(config => config.id === currentScenario)
  
  return (
    <div>
      <ScenarioSelector
        currentScenario={currentScenario}
        scenarioConfigs={scenarioConfigs}
        onScenarioChange={setCurrentScenario}
      />
      <ContentComponent data={currentConfig?.data} />
    </div>
  )
}
```

#### 5.3 多场景选择器

当需要多种场景选择时，可以并排显示：

```typescript
const CombinedScenarioSelector = ({ 
  currentDemoScenario, demoScenarioConfigs, onDemoScenarioChange,
  currentRenewalScenario, renewalScenarioConfigs, onRenewalScenarioChange 
}) => {
  return (
    <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
      {/* 交付场景选择器 */}
      <div style={{ backgroundColor: '#f6ffed', border: '1px solid #b7eb8f', padding: '12px 16px', borderRadius: '6px' }}>
        <span style={{ fontWeight: 'bold', color: '#52c41a' }}>[交付场景选择]</span>
        <Select value={currentDemoScenario} onChange={onDemoScenarioChange} style={{ width: 300 }} />
      </div>
      
      {/* 续费场景选择器 */}
      <div style={{ backgroundColor: '#fff7e6', border: '1px solid #ffd591', padding: '12px 16px', borderRadius: '6px' }}>
        <span style={{ fontWeight: 'bold', color: '#fa8c16' }}>[续费场景选择]</span>
        <Select value={currentRenewalScenario} onChange={onRenewalScenarioChange} style={{ width: 200 }} />
      </div>
    </div>
  )
}
```

---

## 数据存储规范

### 1. 存储方案

本项目使用浏览器的 **localStorage** 进行数据存储，这样可以进行更直观的演示，方便查看和调试数据。

### 2. 数据初始化机制

#### 2.1 启动时自动清理和加载

每次服务启动时，系统会自动执行以下操作：

1. **清理测试数据**：自动清理掉 localStorage 中的所有测试数据
2. **加载静态数据**：从本地文件中加载静态的 demo 数据到 localStorage

这样设计的好处：
- ✅ 可以手动修改 demo 数据文件，无需考虑兼容 localStorage 中的测试数据
- ✅ 每次启动都是干净的数据环境，避免测试数据污染
- ✅ 数据文件化，便于版本控制和团队协作

#### 2.2 实现位置

数据初始化应该在应用启动时执行，建议在 `src/main.tsx` 或 `src/App.tsx` 中实现：

```typescript
// src/utils/dataInitializer.ts
import initialData from '@/data/initialData.json'

const STORAGE_KEYS = {
  USERS: 'demo_users',
  ORDERS: 'demo_orders',
  TASKS: 'demo_tasks',
  // ... 其他数据键
} as const

/**
 * 初始化 localStorage 数据
 * 清理旧数据并从静态文件加载新数据
 */
export function initializeLocalStorage() {
  // 1. 清理所有 demo 相关的 localStorage 数据
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key)
  })

  // 2. 从静态文件加载数据到 localStorage
  if (initialData.users) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(initialData.users))
  }
  
  if (initialData.orders) {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(initialData.orders))
  }
  
  if (initialData.tasks) {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(initialData.tasks))
  }

  console.log('[数据初始化] localStorage 数据已从静态文件加载')
}

// src/main.tsx 或 src/App.tsx
import { initializeLocalStorage } from '@/utils/dataInitializer'

// 在应用启动时调用
initializeLocalStorage()
```

### 3. 数据文件规范

#### 3.1 文件位置

静态数据文件应存放在 `src/data/` 目录下：

```
src/
├── data/
│   ├── initialData.json      # 主数据文件（推荐）
│   ├── users.json            # 用户数据（可选：分文件存储）
│   ├── orders.json           # 订单数据（可选：分文件存储）
│   └── tasks.json            # 任务数据（可选：分文件存储）
```

#### 3.2 数据文件格式

**方式一：单文件存储（推荐用于小型项目）**

```json
// src/data/initialData.json
{
  "users": [
    {
      "id": "1",
      "name": "张三",
      "email": "zhangsan@example.com",
      "role": "admin"
    },
    {
      "id": "2",
      "name": "李四",
      "email": "lisi@example.com",
      "role": "user"
    }
  ],
  "orders": [
    {
      "id": "order-001",
      "userId": "1",
      "amount": 1000,
      "status": "pending"
    }
  ],
  "tasks": [
    {
      "id": "task-001",
      "title": "完成需求分析",
      "status": "in-progress"
    }
  ]
}
```

**方式二：分文件存储（推荐用于大型项目）**

```typescript
// src/data/index.ts
import usersData from './users.json'
import ordersData from './orders.json'
import tasksData from './tasks.json'

export default {
  users: usersData,
  orders: ordersData,
  tasks: tasksData
}
```

#### 3.3 TypeScript 类型定义

为数据文件定义类型，确保类型安全：

```typescript
// src/types/data.ts
export interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'user'
}

export interface Order {
  id: string
  userId: string
  amount: number
  status: 'pending' | 'completed' | 'cancelled'
}

export interface Task {
  id: string
  title: string
  status: 'todo' | 'in-progress' | 'done'
}

export interface InitialData {
  users: User[]
  orders: Order[]
  tasks: Task[]
}
```

### 4. 数据访问规范

#### 4.1 统一的数据访问工具

创建统一的数据访问工具函数，避免直接操作 localStorage：

```typescript
// src/utils/storage.ts
import type { User, Order, Task } from '@/types/data'

const STORAGE_KEYS = {
  USERS: 'demo_users',
  ORDERS: 'demo_orders',
  TASKS: 'demo_tasks',
} as const

/**
 * 获取用户列表
 */
export function getUsers(): User[] {
  const data = localStorage.getItem(STORAGE_KEYS.USERS)
  return data ? JSON.parse(data) : []
}

/**
 * 保存用户列表
 */
export function saveUsers(users: User[]): void {
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users))
}

/**
 * 获取订单列表
 */
export function getOrders(): Order[] {
  const data = localStorage.getItem(STORAGE_KEYS.ORDERS)
  return data ? JSON.parse(data) : []
}

/**
 * 保存订单列表
 */
export function saveOrders(orders: Order[]): void {
  localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders))
}

/**
 * 获取任务列表
 */
export function getTasks(): Task[] {
  const data = localStorage.getItem(STORAGE_KEYS.TASKS)
  return data ? JSON.parse(data) : []
}

/**
 * 保存任务列表
 */
export function saveTasks(tasks: Task[]): void {
  localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks))
}
```

#### 4.2 在组件中使用

```typescript
import { useState, useEffect } from 'react'
import { getUsers, saveUsers } from '@/utils/storage'
import type { User } from '@/types/data'

function UserList() {
  const [users, setUsers] = useState<User[]>([])

  useEffect(() => {
    // 从 localStorage 加载数据
    const loadedUsers = getUsers()
    setUsers(loadedUsers)
  }, [])

  const handleAddUser = (newUser: User) => {
    const updatedUsers = [...users, newUser]
    setUsers(updatedUsers)
    // 保存到 localStorage
    saveUsers(updatedUsers)
  }

  return (
    <div>
      {users.map(user => (
        <div key={user.id}>{user.name}</div>
      ))}
    </div>
  )
}
```

### 5. 开发环境配置

#### 5.1 Vite 配置（如果需要导入 JSON）

Vite 默认支持 JSON 导入，无需额外配置。如果遇到问题，可以检查 `vite.config.ts`：

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Vite 默认支持 JSON 导入，无需额外配置
})
```

#### 5.2 TypeScript 配置

确保 `tsconfig.json` 支持 JSON 导入：

```json
{
  "compilerOptions": {
    "resolveJsonModule": true,
    // ... 其他配置
  }
}
```

### 6. 注意事项

1. **数据清理时机**：只在服务启动时清理，运行期间保留用户操作的数据
2. **数据格式验证**：加载数据时进行格式验证，避免格式错误导致应用崩溃
3. **错误处理**：处理 localStorage 可能被禁用或存储空间不足的情况
4. **数据备份**：重要数据修改前可以考虑备份，方便回滚

### 7. 完整示例

```typescript
// src/utils/dataInitializer.ts
import initialData from '@/data/initialData.json'
import type { InitialData } from '@/types/data'

const STORAGE_KEYS = {
  USERS: 'demo_users',
  ORDERS: 'demo_orders',
  TASKS: 'demo_tasks',
} as const

/**
 * 初始化 localStorage 数据
 */
export function initializeLocalStorage() {
  try {
    // 1. 清理旧数据
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key)
    })

    // 2. 加载新数据
    const data = initialData as InitialData
    
    if (data.users) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(data.users))
    }
    
    if (data.orders) {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(data.orders))
    }
    
    if (data.tasks) {
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(data.tasks))
    }

    console.log('[数据初始化] ✅ localStorage 数据已从静态文件加载')
  } catch (error) {
    console.error('[数据初始化] ❌ 加载失败:', error)
  }
}

// src/main.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { initializeLocalStorage } from './utils/dataInitializer'
import './styles/global.css'

// 应用启动时初始化数据
initializeLocalStorage()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
```

---

## 总结

本开发规范旨在：

1. ✅ 提高代码质量和可维护性
2. ✅ 统一团队开发风格
3. ✅ 减少常见错误
4. ✅ 提升开发效率

**注意**：规范会随着项目发展不断完善，欢迎提出改进建议！

