import { FC, useState, useEffect } from 'react'
import { Card, Table, Tag, Button, Space, Typography, Form, Input, Select, DatePicker, Modal, message, Descriptions, Divider } from 'antd'
import { SearchOutlined, ReloadOutlined, CheckCircleOutlined, ExclamationCircleOutlined, EyeOutlined, LockOutlined, UnlockOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { MonthlySettlement, MonthlySettlementStatus } from '../../../types/monthlySettlement'
import settlementData from '../../../data/monthly_settlement.json'

const { Title, Text } = Typography
const { RangePicker } = DatePicker

/**
 * 月度结算单
 */
const MonthlySettlementPage: FC = () => {
    const [form] = Form.useForm()
    const [loading, setLoading] = useState(false)
    const [data, setData] = useState<MonthlySettlement[]>([])
    const [isDetailVisible, setIsDetailVisible] = useState(false)
    const [currentSettlement, setCurrentSettlement] = useState<MonthlySettlement | null>(null)
    const [isAppealVisible, setIsAppealVisible] = useState(false)

    useEffect(() => {
        // 模拟从 localStorage 加载或使用初始数据
        const savedData = localStorage.getItem('monthly_settlements')
        if (savedData) {
            setData(JSON.parse(savedData))
        } else {
            setData(settlementData as MonthlySettlement[])
        }
    }, [])

    const saveData = (newData: MonthlySettlement[]) => {
        setData(newData)
        localStorage.setItem('monthly_settlements', JSON.stringify(newData))
    }

    const handleSearch = () => {
        setLoading(true)
        // 实际项目中这里会调用 API
        setTimeout(() => {
            setLoading(false)
            message.success('查询成功')
        }, 500)
    }

    const handleReset = () => {
        form.resetFields()
        handleSearch()
    }

    const handleVerify = (record: MonthlySettlement) => {
        Modal.confirm({
            title: '确认提交核对？',
            content: '确认提交后将进入审核流程，无法再次修改。',
            onOk: () => {
                const newData = data.map(item =>
                    item.id === record.id ? { ...item, status: 'reviewing' as MonthlySettlementStatus } : item
                )
                saveData(newData)
                message.success('提交核对成功')
            }
        })
    }

    const handleShowDetail = (record: MonthlySettlement) => {
        setCurrentSettlement(record)
        setIsDetailVisible(true)
    }

    const handleAppeal = (record: MonthlySettlement) => {
        setCurrentSettlement(record)
        setIsAppealVisible(true)
    }

    const handleReconcile = (record: MonthlySettlement, isLocked: boolean) => {
        Modal.confirm({
            title: isLocked ? '确认进行轧账？' : '确认解除轧账？',
            content: isLocked
                ? '锁定结算后，该周期内的 销售订单核对 和 渠道订单核对 将被锁定，无法再进行变更（确认/异议）。'
                : '解锁结算后，相关核对单将恢复可编辑状态。',
            onOk: () => {
                const newData = data.map(item =>
                    item.id === record.id ? { ...item, isReconciled: isLocked } : item
                )
                saveData(newData)
                // If current settlement is open in modal, update it too
                if (currentSettlement && currentSettlement.id === record.id) {
                    setCurrentSettlement({ ...currentSettlement, isReconciled: isLocked })
                }
                message.success(isLocked ? '已轧账' : '已解除轧账')
            }
        })
    }

    const getStatusTag = (status: MonthlySettlementStatus, isReconciled?: boolean) => {
        if (isReconciled) {
            return <Space><Tag color="purple" icon={<LockOutlined />}>已轧账</Tag>{status === 'completed' && <Tag color="green">已完成</Tag>}</Space>
        }
        switch (status) {
            case 'pending':
                return <Tag color="orange">待核对</Tag>
            case 'reviewing':
                return <Tag color="blue">审核中</Tag>
            case 'completed':
                return <Tag color="green">已完成</Tag>
            default:
                return <Tag>{status}</Tag>
        }
    }

    const columns = [
        {
            title: '结算单号',
            dataIndex: 'id',
            key: 'id',
        },
        {
            title: '结算周期',
            dataIndex: 'cycle',
            key: 'cycle',
        },
        {
            title: '渠道名称',
            dataIndex: 'channelName',
            key: 'channelName',
        },
        {
            title: '成交金额(万)',
            dataIndex: 'orderAmount',
            key: 'orderAmount',
            render: (val: number) => `¥${val.toFixed(2)}`
        },
        {
            title: '分佣比例',
            dataIndex: 'rate',
            key: 'rate',
        },
        {
            title: '实发金额(万)',
            dataIndex: 'actualAmount',
            key: 'actualAmount',
            render: (val: number) => <Text type="danger" strong>¥${val.toFixed(2)}</Text>
        },
        {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            render: (_: any, record: MonthlySettlement) => getStatusTag(record.status, record.isReconciled)
        },
        {
            title: '操作',
            key: 'action',
            render: (_: any, record: MonthlySettlement) => (
                <Space size="middle">
                    <Button type="link" icon={<EyeOutlined />} onClick={() => handleShowDetail(record)}>查看</Button>
                    {record.status === 'pending' && (
                        record.isReconciled ? (
                            <Button type="link" icon={<UnlockOutlined />} onClick={() => handleReconcile(record, false)}>解锁结算</Button>
                        ) : (
                            <Button type="link" icon={<LockOutlined />} onClick={() => handleReconcile(record, true)}>锁定结算</Button>
                        )
                    )}
                </Space>
            ),
        },
    ]

    return (
        <div style={{ padding: 24 }}>
            <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Title level={4}>月度结算单</Title>
            </div>

            <Card style={{ marginBottom: 24 }}>
                <Form form={form} layout="inline" onFinish={handleSearch}>
                    <Form.Item name="channelName" label="渠道名称">
                        <Input placeholder="请输入渠道名称" allowClear />
                    </Form.Item>
                    <Form.Item name="cycle" label="结算周期">
                        <DatePicker picker="month" placeholder="选择月份" />
                    </Form.Item>
                    <Form.Item name="status" label="状态">
                        <Select placeholder="请选择状态" style={{ width: 120 }} allowClear>
                            <Select.Option value="pending">待核对</Select.Option>
                            <Select.Option value="reviewing">审核中</Select.Option>
                            <Select.Option value="completed">已完成</Select.Option>
                        </Select>
                    </Form.Item>
                    <Form.Item>
                        <Space>
                            <Button type="primary" icon={<SearchOutlined />} htmlType="submit">查询</Button>
                            <Button icon={<ReloadOutlined />} onClick={handleReset}>重置</Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Card>

            <Card>
                <Table
                    columns={columns}
                    dataSource={data}
                    rowKey="id"
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                />
            </Card>

            {/* 详情模态框 */}
            <Modal
                title="结算单详情"
                open={isDetailVisible}
                onCancel={() => setIsDetailVisible(false)}
                width={800}
                footer={[
                    <Button key="close" onClick={() => setIsDetailVisible(false)}>关闭</Button>,
                    currentSettlement?.status === 'pending' && (
                        <Button key="verify" type="primary" onClick={() => {
                            setIsDetailVisible(false)
                            handleVerify(currentSettlement)
                        }}>确认提交</Button>
                    )
                ]}
            >
                {currentSettlement && (
                    <>
                        <Descriptions title="基本信息" bordered column={2}>
                            <Descriptions.Item label="结算单号">{currentSettlement.id}</Descriptions.Item>
                            <Descriptions.Item label="结算周期">{currentSettlement.cycle}</Descriptions.Item>
                            <Descriptions.Item label="渠道名称">{currentSettlement.channelName}</Descriptions.Item>
                            <Descriptions.Item label="分佣类型">{currentSettlement.commissionType === 'ladder' ? '阶梯等级' : currentSettlement.commissionType === 'fixed' ? '固定比例' : '个性化'}</Descriptions.Item>
                            <Descriptions.Item label="当前等级">{currentSettlement.level || '-'}</Descriptions.Item>
                            <Descriptions.Item label="状态">{getStatusTag(currentSettlement.status, currentSettlement.isReconciled)}</Descriptions.Item>
                        </Descriptions>

                        <Divider />

                        <Descriptions title="费用明细" bordered column={2}>
                            <Descriptions.Item label="成交订单数">{currentSettlement.orderCount}</Descriptions.Item>
                            <Descriptions.Item label="成交金额">{currentSettlement.orderAmount} 万元</Descriptions.Item>
                            <Descriptions.Item label="分佣比例">{currentSettlement.rate}</Descriptions.Item>
                            <Descriptions.Item label="应发金额">{currentSettlement.payableAmount} 万元</Descriptions.Item>
                            <Descriptions.Item label="调账金额">{currentSettlement.adjustmentAmount} 万元</Descriptions.Item>
                            <Descriptions.Item label="实发金额"><Text type="danger" strong>{currentSettlement.actualAmount} 万元</Text></Descriptions.Item>
                        </Descriptions>

                        <Divider />

                        <Title level={5}>订单明细</Title>
                        <Table
                            size="small"
                            dataSource={currentSettlement.details}
                            pagination={false}
                            rowKey="orderId"
                            columns={[
                                { title: '订单号', dataIndex: 'orderId', key: 'orderId' },
                                { title: '客户名称', dataIndex: 'customerName', key: 'customerName' },
                                { title: '签约日期', dataIndex: 'signDate', key: 'signDate' },
                                { title: '金额(万)', dataIndex: 'amount', key: 'amount', render: (v) => `¥${v.toFixed(2)}` },
                            ]}
                        />

                        {currentSettlement.adjustments && currentSettlement.adjustments.length > 0 && (
                            <>
                                <Divider />
                                <Title level={5}>调账记录</Title>
                                <Table
                                    size="small"
                                    dataSource={currentSettlement.adjustments}
                                    pagination={false}
                                    rowKey="id"
                                    columns={[
                                        { title: '类型', dataIndex: 'type', key: 'type', render: (t) => t === 'performance' ? '业绩调账' : '分佣调账' },
                                        { title: '金额(万)', dataIndex: 'amount', key: 'amount', render: (v) => (v > 0 ? `+${v}` : v) },
                                        { title: '原因', dataIndex: 'reason', key: 'reason' },
                                        { title: '关联审批单', dataIndex: 'auditNo', key: 'auditNo' },
                                    ]}
                                />
                            </>
                        )}
                    </>
                )}
            </Modal>

            {/* 申诉模态框 */}
            <Modal
                title="发起结算申诉"
                open={isAppealVisible}
                onCancel={() => setIsAppealVisible(false)}
                onOk={() => {
                    message.success('申诉已提交，请等待处理')
                    setIsAppealVisible(false)
                }}
            >
                <Form layout="vertical">
                    <Form.Item label="申诉原因" required>
                        <Select placeholder="请选择申诉原因">
                            <Select.Option value="order_missing">订单漏提</Select.Option>
                            <Select.Option value="amount_error">金额不符</Select.Option>
                            <Select.Option value="adjustment_error">调账有误</Select.Option>
                            <Select.Option value="other">其他</Select.Option>
                        </Select>
                    </Form.Item>
                    <Form.Item label="详细说明" required>
                        <Input.TextArea rows={4} placeholder="请详细描述申诉原因，并提供相关证明材料" />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    )
}

export default MonthlySettlementPage
