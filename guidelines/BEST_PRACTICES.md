# 最佳实践

本文档收集了项目开发中的最佳实践和常用模式。

## 目录

- [使用 Ant Design 组件](#使用-ant-design-组件)
- [合理使用 Hooks](#合理使用-hooks)
- [错误处理](#错误处理)
- [性能优化](#性能优化)
- [Demo场景选择器开发模式](#demo场景选择器开发模式)

---

## 使用 Ant Design 组件

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

---

## 合理使用 Hooks

### 自定义 Hook 封装可复用逻辑

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

---

## 错误处理

### 优雅的错误处理

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

---

## 性能优化

### 使用 useMemo 和 useCallback

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

---

## Demo场景选择器开发模式

### 设计思路

场景选择器是一种Demo开发模式，通过模拟不同业务场景来展示系统的各种状态。特别适合产品演示和开发测试。

### 实现方式

#### 场景配置

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

#### 场景选择器组件

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

#### 页面使用

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

### 多场景选择器

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

## 相关资源

- [React 性能优化指南](https://react.dev/learn/render-and-commit)
- [Ant Design 最佳实践](https://ant.design/docs/react/introduce-cn)













