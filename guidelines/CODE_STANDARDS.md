# 代码规范

本文档定义了项目的代码编写标准，包括代码格式、TypeScript 使用、命名规范和注释规范。

## 目录

- [代码格式](#代码格式)
- [文件组织](#文件组织)
- [TypeScript 规范](#typescript-规范)
- [命名规范](#命名规范)
- [注释规范](#注释规范)

---

## 代码格式

### 基本原则

1. **保持简洁**：代码应该简洁、清晰、易于理解
2. **单一职责**：每个函数/组件只做一件事
3. **可复用性**：抽取可复用的逻辑和组件
4. **类型安全**：充分利用 TypeScript 的类型系统

### 格式要求

- 使用 2 个空格缩进
- 使用单引号 `'` 而不是双引号 `"`
- 语句结尾不使用分号（遵循 ESLint 配置）
- 每行代码不超过 100 个字符

---

## 文件组织

### 导入顺序

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

## 代码审查检查清单

在代码审查时，请检查以下事项：

- [ ] 代码格式是否符合规范（缩进、引号、分号等）
- [ ] 导入顺序是否正确
- [ ] 是否避免了使用 `any` 类型
- [ ] 命名是否符合规范（文件、变量、函数、组件）
- [ ] 复杂逻辑是否有注释说明
- [ ] 函数和组件是否有 JSDoc 注释

---

## 相关资源

- [TypeScript 官方文档](https://www.typescriptlang.org/docs/)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)













