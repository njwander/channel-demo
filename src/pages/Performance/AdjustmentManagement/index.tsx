import { FC, useState, useEffect } from 'react'
import {
    Table,
    Card,
    Typography,
    Form,
    Input,
    Button,
    Select,
    Space,
    Tag,
    Row,
    Col,
    DatePicker,
    message,
    Modal,
    InputNumber,
    Descriptions,
    Divider,
    Radio
} from 'antd'
import {
    SearchOutlined,
    SyncOutlined,
    PlusOutlined,
    EyeOutlined
} from '@ant-design/icons'
import dayjs from 'dayjs'
import type { Adjustment, AdjustmentType, AdjustmentStatus } from '../../../types/performance'
import type { Channel } from '../../../types/channel'

const { Title } = Typography
const { RangePicker } = DatePicker
const { Option } = Select

// Mock Orders for demonstration
const mockOrders = [
    { id: 'DD20260110001', orderNo: 'DD20260110001', customerName: '四川XX商贸有限公司', amount: 100000 },
    { id: 'DD20260110002', orderNo: 'DD20260110002', customerName: '成都YY科技有限公司', amount: 50000 },
    { id: 'DD20260110003', orderNo: 'DD20260110003', customerName: '重庆ZZ信息技术有限公司', amount: 80000 },
]

/**
 * 调账管理页面
 */
const AdjustmentManagement: FC = () => {
    const [form] = Form.useForm()
    const [newForm] = Form.useForm()
    const [loading, setLoading] = useState(false)
    const [searching, setSearching] = useState(false)
    const [data, setData] = useState<Adjustment[]>([])
    const [channels, setChannels] = useState<Channel[]>([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
    const [currentAdjustment, setCurrentAdjustment] = useState<Adjustment | null>(null)
    const [selectedType, setSelectedType] = useState<AdjustmentType>('performance') // Track selected type in Create Modal
    const [commissionMode, setCommissionMode] = useState<string>('standard') // Track commission mode in Create Modal

    // 获取数据
    const fetchData = () => {
        setLoading(true)
        const storedData = localStorage.getItem('adjustment_data')
        if (storedData) {
            setData(JSON.parse(storedData))
        }

        const storedChannels = localStorage.getItem('channel_data')
        if (storedChannels) {
            setChannels(JSON.parse(storedChannels))
        }
        setLoading(false)
    }

    useEffect(() => {
        fetchData()
    }, [])

    // 处理查询
    const handleSearch = async () => {
        try {
            const values = await form.validateFields()
            setSearching(true)

            setTimeout(() => {
                const storedData = localStorage.getItem('adjustment_data')
                if (storedData) {
                    let filteredData: Adjustment[] = JSON.parse(storedData)

                    if (values.channelName) {
                        filteredData = filteredData.filter(item =>
                            item.channelName.toLowerCase().includes(values.channelName.toLowerCase())
                        )
                    }

                    if (values.type && values.type !== 'all') {
                        filteredData = filteredData.filter(item => item.type === values.type)
                    }

                    if (values.status && values.status !== 'all') {
                        filteredData = filteredData.filter(item => item.status === values.status)
                    }

                    if (values.cycle) {
                        const cycleStr = values.cycle.format('YYYY-MM')
                        filteredData = filteredData.filter(item => item.cycle === cycleStr)
                    }

                    setData(filteredData)
                }
                setSearching(false)
            }, 600)
        } catch (error) {
            console.error('Filter Failed:', error)
        }
    }

    // 处理重置
    const handleReset = () => {
        form.resetFields()
        fetchData()
    }

    // 处理新增调账
    const handleAdd = () => {
        setIsModalOpen(true)
        setSelectedType('performance') // Reset to default
        newForm.setFieldsValue({ type: 'performance' })
    }

    const handleViewDetail = (record: Adjustment) => {
        setCurrentAdjustment(record)
        setIsDetailModalOpen(true)
    }

    const handleModalOk = async () => {
        try {
            const values = await newForm.validateFields()
            const channel = channels.find(c => c.id === values.channelId)

            const newAdj: Adjustment = {
                id: `ADJ${dayjs().format('YYYYMMDD')}${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
                channelId: values.channelId,
                channelName: channel?.companyName || '',
                type: values.type,
                amount: values.type === 'order_level' ? 0 : values.amount, // Order level doesn't track amount directly in list usually, or 0
                cycle: values.cycle.format('YYYY-MM'),
                reason: values.reason,
                status: 'pending',
                creator: '当前用户', // 模拟当前用户
                applyTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
                // Order Level specific
                relatedOrderIds: values.relatedOrderIds,
                performanceMode: values.performanceMode,
                commissionMode: values.commissionMode,
                commissionRate: values.commissionRate,
                reasonCategory: values.reasonCategory,
                // Performance Level specific
                effectiveTime: values.effectiveTime?.format('YYYY-MM-DD HH:mm:ss')
            }

            const storedData = localStorage.getItem('adjustment_data')
            const currentData: Adjustment[] = storedData ? JSON.parse(storedData) : []
            const newData = [newAdj, ...currentData]

            localStorage.setItem('adjustment_data', JSON.stringify(newData))
            message.success('调账申请已提交')
            setIsModalOpen(false)
            newForm.resetFields()
            fetchData()
        } catch (error) {
            console.error('Validation Failed:', error)
        }
    }

    // 状态映射
    const statusMap: Record<AdjustmentStatus, { text: string; color: string }> = {
        pending: { text: '待审批', color: 'orange' },
        approved: { text: '已通过', color: 'green' },
        rejected: { text: '已驳回', color: 'red' }
    }

    // 类型映射
    const typeMap: Record<AdjustmentType, string> = {
        performance: '业绩额调账',
        commission: '分佣额调账',
        order_level: '订单级调整'
    }

    const columns = [
        {
            title: '调账单号',
            dataIndex: 'id',
            key: 'id',
            width: 160
        },
        {
            title: '渠道名称',
            dataIndex: 'channelName',
            key: 'channelName',
            ellipsis: true
        },
        {
            title: '调账类型',
            dataIndex: 'type',
            key: 'type',
            width: 180,
            render: (type: AdjustmentType) => typeMap[type]
        },
        {
            title: '调账金额',
            dataIndex: 'amount',
            key: 'amount',
            width: 120,
            align: 'right' as const,
            render: (val: number, record: Adjustment) => {
                if (record.type === 'order_level') {
                    const pMode = record.performanceMode === 'include' ? '业绩计入' : '业绩不计';
                    let cMode = '';
                    if (record.commissionMode === 'standard') cMode = '标准提成';
                    else if (record.commissionMode === 'none') cMode = '无提成';
                    else cMode = `提成${record.commissionRate}%`;

                    return (
                        <Space direction="vertical" size={0}>
                            <Tag color={record.performanceMode === 'include' ? 'blue' : 'default'} style={{ marginRight: 0 }}>{pMode}</Tag>
                            <Tag color={record.commissionMode === 'none' ? 'default' : 'orange'} style={{ marginRight: 0 }}>{cMode}</Tag>
                        </Space>
                    )
                }
                return `${val > 0 ? '+' : ''}${val.toFixed(2)} 万元`
            }
        },
        {
            title: '归属账期',
            dataIndex: 'cycle',
            key: 'cycle',
            width: 100
        },
        {
            title: '原因说明',
            dataIndex: 'reason',
            key: 'reason',
            ellipsis: true
        },
        {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            width: 100,
            render: (status: AdjustmentStatus) => (
                <Tag color={statusMap[status].color}>{statusMap[status].text}</Tag>
            )
        },
        {
            title: '操作人',
            dataIndex: 'creator',
            key: 'creator',
            width: 100
        },
        {
            title: '申请时间',
            dataIndex: 'applyTime',
            key: 'applyTime',
            width: 160
        },
        {
            title: '操作',
            key: 'action',
            width: 100,
            render: (_: any, record: Adjustment) => (
                <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => handleViewDetail(record)}>
                    详情
                </Button>
            )
        }
    ]

    return (
        <div style={{ padding: 24 }}>
            <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Title level={4} style={{ margin: 0 }}>调账管理</Title>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleAdd}
                    style={{ background: '#ff5050', borderColor: '#ff5050' }}
                >
                    新增调账
                </Button>
            </div>

            <Card style={{ marginBottom: 24 }}>
                <Form form={form} layout="vertical" onFinish={handleSearch}>
                    <Row gutter={[24, 0]}>
                        <Col xs={24} sm={12} md={8} lg={6}>
                            <Form.Item name="channelName" label="渠道名称">
                                <Input placeholder="请输入渠道名称" allowClear />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={8} lg={6}>
                            <Form.Item name="type" label="调账类型">
                                <Select placeholder="请选择类型" allowClear>
                                    <Option value="all">全部</Option>
                                    <Option value="performance">业绩额调账</Option>
                                    <Option value="commission">分佣额调账</Option>
                                    <Option value="order_level">订单级调整</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={8} lg={6}>
                            <Form.Item name="status" label="审批状态">
                                <Select placeholder="请选择状态" allowClear>
                                    <Option value="all">全部</Option>
                                    <Option value="pending">待审批</Option>
                                    <Option value="approved">已通过</Option>
                                    <Option value="rejected">已驳回</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={8} lg={6}>
                            <Form.Item name="cycle" label="归属账期">
                                <DatePicker picker="month" style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                        <Col span={24} style={{ textAlign: 'right' }}>
                            <Space>
                                <Button
                                    type="primary"
                                    icon={<SearchOutlined />}
                                    htmlType="submit"
                                    loading={searching}
                                    style={{ background: '#ff5050', borderColor: '#ff5050' }}
                                >
                                    查询
                                </Button>
                                <Button icon={<SyncOutlined />} onClick={handleReset}>重置</Button>
                            </Space>
                        </Col>
                    </Row>
                </Form>
            </Card>

            <Table
                columns={columns}
                dataSource={data}
                rowKey="id"
                loading={loading}
                pagination={{
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total) => `共 ${total} 条`
                }}
            />

            <Modal
                title="新增调账申请"
                open={isModalOpen}
                onOk={handleModalOk}
                onCancel={() => {
                    setIsModalOpen(false)
                    newForm.resetFields()
                }}
                okText="提交申请"
                cancelText="取消"
                width={600}
                destroyOnClose
            >
                <Form form={newForm} layout="vertical" style={{ marginTop: 16 }}>
                    <Row gutter={16}>
                        <Col span={24}>
                            <Form.Item
                                name="channelId"
                                label="选择渠道"
                                rules={[{ required: true, message: '请选择渠道' }]}
                            >
                                <Select placeholder="请选择渠道" showSearch optionFilterProp="children">
                                    {channels.map(c => (
                                        <Option key={c.id} value={c.id}>{c.companyName}</Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="type"
                                label="调账类型"
                                rules={[{ required: true, message: '请选择调账类型' }]}
                            >
                                <Select
                                    placeholder="请选择调账类型"
                                    onChange={(value) => setSelectedType(value)}
                                >
                                    <Option value="performance">业绩额调账（冲等级）</Option>
                                    <Option value="commission">分佣额调账（发奖金）</Option>
                                    <Option value="order_level">订单级调整</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="cycle"
                                label="归属账期"
                                rules={[{ required: true, message: '请选择归属账期' }]}
                            >
                                <DatePicker picker="month" style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>

                        {/* Dynamic Fields based on Type */}
                        {selectedType === 'performance' && (
                            <Col span={12}>
                                <Form.Item
                                    name="effectiveTime"
                                    label="生效时间"
                                    rules={[{ required: true, message: '请选择生效时间' }]}
                                >
                                    <DatePicker showTime style={{ width: '100%' }} format="YYYY-MM-DD HH:mm:ss" />
                                </Form.Item>
                            </Col>
                        )}

                        {selectedType === 'order_level' ? (
                            <>
                                <Col span={24}>
                                    <Form.Item
                                        name="relatedOrderIds"
                                        label="关联订单"
                                        rules={[{ required: true, message: '请选择关联订单' }]}
                                    >
                                        <Select
                                            mode="multiple"
                                            placeholder="请选择关联订单"
                                            optionLabelProp="label"
                                        >
                                            {mockOrders.map(order => (
                                                <Option key={order.id} value={order.id} label={order.orderNo}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                        <span>{order.orderNo}</span>
                                                        <span>{order.customerName} (¥{order.amount.toLocaleString()})</span>
                                                    </div>
                                                </Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        name="performanceMode"
                                        label="业绩计算模式"
                                        initialValue="include"
                                        rules={[{ required: true }]}
                                    >
                                        <Radio.Group>
                                            <Radio value="include">计入业绩</Radio>
                                            <Radio value="exclude">不计入业绩</Radio>
                                        </Radio.Group>
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        name="commissionMode"
                                        label="提成计算模式"
                                        initialValue="standard"
                                        rules={[{ required: true }]}
                                    >
                                        <Radio.Group onChange={(e) => setCommissionMode(e.target.value)}>
                                            <Radio value="standard">标准计算</Radio>
                                            <Radio value="custom_rate">自定义比例</Radio>
                                            <Radio value="none">不计提成</Radio>
                                        </Radio.Group>
                                    </Form.Item>
                                </Col>

                                {commissionMode === 'custom_rate' && (
                                    <Col span={12}>
                                        <Form.Item
                                            name="commissionRate"
                                            label="提成比例 (%)"
                                            rules={[{ required: true, message: '请输入提成比例' }]}
                                        >
                                            <InputNumber min={0} max={100} style={{ width: '100%' }} placeholder="例: 15" />
                                        </Form.Item>
                                    </Col>
                                )}

                                <Col span={12}>
                                    <Form.Item
                                        name="reasonCategory"
                                        label="调整原因分类"
                                        rules={[{ required: true, message: '请选择原因分类' }]}
                                    >
                                        <Select placeholder="请选择原因分类">
                                            <Option value="agreement">特殊合作协议</Option>
                                            <Option value="rule_diff">计算规则差异</Option>
                                            <Option value="low_participation">渠道参与度低</Option>
                                            <Option value="non_standard">非标项目折算</Option>
                                            <Option value="other">其他</Option>
                                        </Select>
                                    </Form.Item>
                                </Col>
                            </>
                        ) : (
                            <Col span={24}>

                                <Form.Item
                                    name="amount"
                                    label="调账金额 (万元)"
                                    rules={[{ required: true, message: '请输入调账金额' }]}
                                >
                                    <InputNumber
                                        style={{ width: '100%' }}
                                        placeholder="请输入金额，支持负数"
                                        precision={2}
                                    />
                                </Form.Item>
                            </Col>
                        )}

                        <Col span={24}>
                            <Form.Item
                                name="reason"
                                label={selectedType === 'order_level' ? "原因说明" : "调账原因"}
                                rules={[{ required: true, message: '请输入说明' }]}
                            >
                                <Input.TextArea rows={4} placeholder="请详细说明" />
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Modal>

            {/* Detail Modal */}
            <Modal
                title={`调账详情 - ${currentAdjustment?.id}`}
                open={isDetailModalOpen}
                onCancel={() => setIsDetailModalOpen(false)}
                footer={[
                    <Button key="close" onClick={() => setIsDetailModalOpen(false)}>
                        关闭
                    </Button>
                ]}
                width={700}
            >
                {currentAdjustment && (
                    <div>
                        <div style={{ marginBottom: 24 }}>
                            <Card size="small">
                                <Space size="large">
                                    <span>
                                        调账类型: <strong>{typeMap[currentAdjustment.type]}</strong>
                                    </span>
                                    <span>
                                        状态: <Tag color={statusMap[currentAdjustment.status].color}>{statusMap[currentAdjustment.status].text}</Tag>
                                    </span>
                                    <span>
                                        审批时间: {currentAdjustment.status === 'approved' ? '2026-01-12 15:30' : '-'}
                                    </span>
                                </Space>
                            </Card>
                        </div>

                        <Descriptions title="基本信息" bordered column={2}>
                            <Descriptions.Item label="调账单号">{currentAdjustment.id}</Descriptions.Item>
                            <Descriptions.Item label="所属渠道">{currentAdjustment.channelName}</Descriptions.Item>
                            <Descriptions.Item label="归属账期">{currentAdjustment.cycle}</Descriptions.Item>
                            <Descriptions.Item label="申请人">{currentAdjustment.creator}</Descriptions.Item>
                            <Descriptions.Item label="申请时间">{currentAdjustment.applyTime}</Descriptions.Item>
                            {currentAdjustment.type === 'performance' && (
                                <Descriptions.Item label="生效时间">{currentAdjustment.effectiveTime || '-'}</Descriptions.Item>
                            )}
                            {currentAdjustment.type === 'order_level' ? (
                                <>
                                    <Descriptions.Item label="业绩模式">
                                        <Tag color={currentAdjustment.performanceMode === 'include' ? 'blue' : 'default'}>
                                            {currentAdjustment.performanceMode === 'include' ? '计入业绩' : '不计入业绩'}
                                        </Tag>
                                    </Descriptions.Item>
                                    <Descriptions.Item label="提成模式">
                                        {currentAdjustment.commissionMode === 'standard' && '标准计算'}
                                        {currentAdjustment.commissionMode === 'none' && '不计提成'}
                                        {currentAdjustment.commissionMode === 'custom_rate' && `自定义比例 (${currentAdjustment.commissionRate}%)`}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="调整原因分类" span={2}>
                                        {currentAdjustment.reasonCategory}
                                    </Descriptions.Item>
                                </>
                            ) : (
                                <Descriptions.Item label="调账金额">
                                    <span style={{ color: currentAdjustment.amount >= 0 ? 'green' : 'red', fontWeight: 'bold' }}>
                                        {currentAdjustment.amount > 0 ? '+' : ''}{currentAdjustment.amount} 万元
                                    </span>
                                </Descriptions.Item>
                            )}
                            <Descriptions.Item label="原因说明" span={2}>
                                {currentAdjustment.reason}
                            </Descriptions.Item>
                        </Descriptions>

                        {currentAdjustment.type === 'order_level' && (
                            <>
                                <Divider orientation="left">关联订单明细</Divider>
                                <Table
                                    dataSource={mockOrders.filter(o => currentAdjustment.relatedOrderIds?.includes(o.id))}
                                    rowKey="id"
                                    pagination={false}
                                    size="small"
                                    columns={[
                                        { title: '订单编号', dataIndex: 'orderNo' },
                                        { title: '客户名称', dataIndex: 'customerName' },
                                        {
                                            title: '订单金额',
                                            dataIndex: 'amount',
                                            render: val => `¥${val.toLocaleString()}`
                                        },
                                        {
                                            title: '计入业绩',
                                            render: () => {
                                                if (currentAdjustment.performanceMode === 'include') {
                                                    return <Tag color="blue">✅ 计入</Tag>
                                                }
                                                return <Tag color="default">❌ 不计入</Tag>
                                            }
                                        },
                                        {
                                            title: '计入提成',
                                            render: (_, record) => {
                                                if (currentAdjustment.commissionMode === 'none') {
                                                    return <Tag color="default">❌ 无提成</Tag>
                                                }
                                                // Simplified calc logic for display
                                                let commission = 0;
                                                const rate = currentAdjustment.commissionMode === 'custom_rate'
                                                    ? (currentAdjustment.commissionRate || 0)
                                                    : 10; // Mock standard rate of 10%

                                                commission = (record.amount * rate) / 100
                                                return <span style={{ color: 'green' }}>✅ ¥{commission.toLocaleString()} ({rate}%)</span>
                                            }
                                        }
                                    ]}
                                />
                                <div style={{ marginTop: 16, background: '#f5f5f5', padding: 12, borderRadius: 4 }}>
                                    <Typography.Text type="secondary">
                                        📊 对业绩的影响：该订单金额 {currentAdjustment.performanceMode === 'include' ? '计入' : '不计入'} 渠道"本周期累计业绩"{currentAdjustment.performanceMode === 'include' ? '，累计达到门槛可触发升级' : '，不影响等级判定'}<br />
                                        💰 对提成的影响：{currentAdjustment.commissionMode === 'none' ? '该订单不计算提成' : `按${currentAdjustment.commissionMode === 'standard' ? '标准' : '自定义'}比例计算提成，计入 ${currentAdjustment.cycle} 结算单`}
                                    </Typography.Text>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    )
}

export default AdjustmentManagement
