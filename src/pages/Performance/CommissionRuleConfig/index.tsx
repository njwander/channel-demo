import { FC, useState, useEffect } from 'react'
import {
    Form,
    Input,
    Button,
    Card,
    Typography,
    Space,
    Row,
    Col,
    InputNumber,
    message,
    Divider,
    Breadcrumb,
    Switch
} from 'antd'
import {
    PlusOutlined,
    DeleteOutlined,
    SaveOutlined,
    ArrowLeftOutlined
} from '@ant-design/icons'
import { useNavigate, useParams } from 'react-router-dom'
import dayjs from 'dayjs'
import type { CommissionRule, LadderTier } from '../../../types/commissionRule'

const { Title, Text } = Typography

/**
 * 分佣规则配置页面 (编辑/新增)
 */
const CommissionRuleConfig: FC = () => {
    const navigate = useNavigate()
    const { id } = useParams<{ id: string }>()
    const [form] = Form.useForm()
    const isEdit = id && id !== 'new'

    useEffect(() => {
        if (isEdit) {
            const storedData = localStorage.getItem('commission_rules')
            if (storedData) {
                const rules: CommissionRule[] = JSON.parse(storedData)
                const rule = rules.find(r => r.id === id)
                if (rule) {
                    form.setFieldsValue(rule)
                }
            }
        } else {
            // 设置默认梯度
            form.setFieldsValue({
                type: '阶梯分佣',
                status: 'enabled',
                isDefault: false,
                tiers: [{ min: 0, max: 10, rate: 5 }]
            })
        }
    }, [id, isEdit, form])

    // 保存规则
    const handleSave = async () => {
        try {
            const values = await form.validateFields()

            // 校验区间合理性
            const tiers: LadderTier[] = values.tiers
            const sortedTiers = [...tiers].sort((a, b) => a.min - b.min)

            for (let i = 0; i < sortedTiers.length; i++) {
                if (sortedTiers[i].max !== null && sortedTiers[i].min >= sortedTiers[i].max!) {
                    message.error(`梯度 ${i + 1} 的最小值必须小于最大值`)
                    return
                }
                if (i > 0 && sortedTiers[i].min !== sortedTiers[i - 1].max) {
                    message.error(`梯度 ${i + 1} 的起始值必须等于上一个梯度的截止值`)
                    return
                }
            }
            if (sortedTiers[0].min !== 0) {
                message.error('第一个梯度的起始值必须为 0')
                return
            }

            const storedData = localStorage.getItem('commission_rules')
            let rules: CommissionRule[] = storedData ? JSON.parse(storedData) : []

            if (isEdit) {
                rules = rules.map(r => {
                    if (r.id === id) {
                        return { ...r, ...values }
                    }
                    // 如果当前规则设为默认，则取消其他规则的默认
                    if (values.isDefault) {
                        return { ...r, isDefault: false }
                    }
                    return r
                })
            } else {
                // 如果当前新规则设为默认，则取消其他规则的默认
                if (values.isDefault) {
                    rules = rules.map(r => ({ ...r, isDefault: false }))
                }
                const newRule: CommissionRule = {
                    ...values,
                    id: `RULE${Date.now().toString().slice(-6)}`,
                    creator: '管理员',
                    createTime: dayjs().format('YYYY-MM-DD HH:mm:ss')
                }
                rules.push(newRule)
            }

            localStorage.setItem('commission_rules', JSON.stringify(rules))
            message.success('规则保存成功')
            navigate('/performance/commission-rules')
        } catch (error) {
            console.error('Validate Failed:', error)
        }
    }

    return (
        <div style={{ padding: 24 }}>
            <div style={{ marginBottom: 16 }}>
                <Breadcrumb items={[
                    { title: '业绩管理' },
                    { title: <a onClick={() => navigate('/performance/commission-rules')}>分佣规则管理</a> },
                    { title: isEdit ? '编辑规则' : '配置新规则' }
                ]} />
            </div>

            <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Space size="middle">
                    <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/performance/commission-rules')}>返回</Button>
                    <Title level={4} style={{ margin: 0 }}>{isEdit ? '编辑分佣规则' : '配置新分佣规则'}</Title>
                </Space>
                <Button
                    type="primary"
                    icon={<SaveOutlined />}
                    onClick={handleSave}
                    style={{ background: '#ff5050', borderColor: '#ff5050' }}
                >
                    保存规则
                </Button>
            </div>

            <Form form={form} layout="vertical">
                <Card title="基本设置" style={{ marginBottom: 24 }}>
                    <Row gutter={24}>
                        <Col span={12}>
                            <Form.Item name="name" label="规则名称" rules={[{ required: true, message: '请输入规则名称' }]}>
                                <Input placeholder="如：2026标准代理商规则" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="description" label="规则描述">
                                <Input placeholder="如：针对2026年新签的一级渠道" />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="status" label="状态" initialValue="enabled">
                                <Input.Group compact>
                                    <Button type={form.getFieldValue('status') === 'enabled' ? 'primary' : 'default'} onClick={() => form.setFieldsValue({ status: 'enabled' })}>启用</Button>
                                    <Button type={form.getFieldValue('status') === 'disabled' ? 'primary' : 'default'} onClick={() => form.setFieldsValue({ status: 'disabled' })}>禁用</Button>
                                </Input.Group>
                            </Form.Item>
                        </Col>
                        <Col span={4}>
                            <Form.Item name="isDefault" label="设为默认" valuePropName="checked">
                                <Switch />
                            </Form.Item>
                        </Col>
                    </Row>
                </Card>

                <Card title="规则明细配置">
                    <Text type="secondary" style={{ display: 'block', marginBottom: 20 }}>
                        请配置不同业绩区间的提成比例。区间单位为：万元。
                    </Text>

                    <Form.List name="tiers">
                        {(fields, { add, remove }) => (
                            <>
                                {fields.map(({ key, name, ...restField }, index) => (
                                    <div key={key}>
                                        <Row gutter={16} align="middle">
                                            <Col span={6}>
                                                <Form.Item
                                                    {...restField}
                                                    name={[name, 'min']}
                                                    label={index === 0 ? "业绩下限 (万)" : ""}
                                                    rules={[{ required: true }]}
                                                >
                                                    <InputNumber style={{ width: '100%' }} disabled={index === 0} placeholder=">= 0" />
                                                </Form.Item>
                                            </Col>
                                            <Col span={1} style={{ textAlign: 'center', paddingTop: index === 0 ? 30 : 5 }}>
                                                至
                                            </Col>
                                            <Col span={6}>
                                                <Form.Item
                                                    {...restField}
                                                    name={[name, 'max']}
                                                    label={index === 0 ? "业绩上限 (万)" : ""}
                                                >
                                                    <InputNumber style={{ width: '100%' }} placeholder="留空表示无上限" />
                                                </Form.Item>
                                            </Col>
                                            <Col span={6}>
                                                <Form.Item
                                                    {...restField}
                                                    name={[name, 'rate']}
                                                    label={index === 0 ? "提成比例 (%)" : ""}
                                                    rules={[{ required: true }]}
                                                >
                                                    <InputNumber
                                                        style={{ width: '100%' }}
                                                        min={0}
                                                        max={100}
                                                        formatter={value => `${value}%`}
                                                        parser={value => value!.replace('%', '') as any}
                                                    />
                                                </Form.Item>
                                            </Col>
                                            <Col span={3} style={{ paddingTop: index === 0 ? 30 : 5 }}>
                                                {fields.length > 1 && (
                                                    <Button
                                                        type="text"
                                                        danger
                                                        icon={<DeleteOutlined />}
                                                        onClick={() => remove(name)}
                                                    />
                                                )}
                                            </Col>
                                        </Row>
                                        {index < fields.length - 1 && <Divider style={{ margin: '12px 0' }} />}
                                    </div>
                                ))}
                                <Form.Item style={{ marginTop: 24 }}>
                                    <Button type="dashed" onClick={() => {
                                        const lastTier = form.getFieldValue(['tiers', fields.length - 1])
                                        add({
                                            min: lastTier?.max || 0,
                                            max: lastTier?.max ? lastTier.max + 50 : 100,
                                            rate: (lastTier?.rate || 0) + 2
                                        })
                                    }} block icon={<PlusOutlined />}>
                                        添加梯度
                                    </Button>
                                </Form.Item>
                            </>
                        )}
                    </Form.List>
                </Card>
            </Form>
        </div>
    )
}

export default CommissionRuleConfig
