# 路由规范

本文档定义了项目的路由配置和使用标准。

## 目录

- [路由命名](#路由命名)
- [路由结构](#路由结构)
- [路由参数获取](#路由参数获取)

---

## 路由命名

### 命名规则

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

---

## 路由结构

### 标准路由配置

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

---

## 路由参数获取

### 使用 useParams

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

### 使用 useSearchParams

```typescript
import { useSearchParams } from 'react-router-dom'

function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const keyword = searchParams.get('keyword')

  const handleSearch = (newKeyword: string) => {
    setSearchParams({ keyword: newKeyword })
  }

  return (
    <div>
      <p>搜索关键词: {keyword}</p>
    </div>
  )
}
```

---

## 代码审查检查清单

在代码审查时，请检查以下事项：

- [ ] 路由路径是否符合命名规范（小写字母和连字符）
- [ ] 路由路径是否语义化
- [ ] 路由参数是否正确获取和使用
- [ ] 404 路由是否正确配置

---

## 相关资源

- [React Router 官方文档](https://reactrouter.com/)













