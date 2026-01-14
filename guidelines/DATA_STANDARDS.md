# 数据存储规范

本文档定义了项目的数据存储标准和使用规范。

## 目录

- [存储方案](#存储方案)
- [数据初始化机制](#数据初始化机制)
- [数据文件规范](#数据文件规范)
- [数据访问规范](#数据访问规范)
- [开发环境配置](#开发环境配置)
- [注意事项](#注意事项)

---

## 存储方案

本项目使用浏览器的 **localStorage** 进行数据存储，这样可以进行更直观的演示，方便查看和调试数据。

---

## 数据初始化机制

### 启动时自动清理和加载

每次服务启动时，系统会自动执行以下操作：

1. **清理测试数据**：自动清理掉 localStorage 中的所有测试数据
2. **加载静态数据**：从本地文件中加载静态的 demo 数据到 localStorage

这样设计的好处：
- ✅ 可以手动修改 demo 数据文件，无需考虑兼容 localStorage 中的测试数据
- ✅ 每次启动都是干净的数据环境，避免测试数据污染
- ✅ 数据文件化，便于版本控制和团队协作

### 实现位置

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

---

## 数据文件规范

### 文件位置

静态数据文件应存放在 `src/data/` 目录下：

```
src/
├── data/
│   ├── initialData.json      # 主数据文件（推荐）
│   ├── users.json            # 用户数据（可选：分文件存储）
│   ├── orders.json           # 订单数据（可选：分文件存储）
│   └── tasks.json            # 任务数据（可选：分文件存储）
```

### 数据文件格式

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

### TypeScript 类型定义

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

---

## 数据访问规范

### 统一的数据访问工具

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

### 在组件中使用

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

---

## 开发环境配置

### Vite 配置（如果需要导入 JSON）

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

### TypeScript 配置

确保 `tsconfig.json` 支持 JSON 导入：

```json
{
  "compilerOptions": {
    "resolveJsonModule": true,
    // ... 其他配置
  }
}
```

---

## 注意事项

1. **数据清理时机**：只在服务启动时清理，运行期间保留用户操作的数据
2. **数据格式验证**：加载数据时进行格式验证，避免格式错误导致应用崩溃
3. **错误处理**：处理 localStorage 可能被禁用或存储空间不足的情况
4. **数据备份**：重要数据修改前可以考虑备份，方便回滚

---

## 完整示例

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

## 代码审查检查清单

在代码审查时，请检查以下事项：

- [ ] 是否使用统一的数据访问工具函数
- [ ] 数据文件是否定义了 TypeScript 类型
- [ ] 数据初始化是否在应用启动时正确执行
- [ ] 是否处理了 localStorage 可能被禁用的情况
- [ ] 数据格式是否正确验证













