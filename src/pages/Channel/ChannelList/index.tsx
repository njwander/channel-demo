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
    Tooltip,
    message,
    Modal,
    Upload
} from 'antd'
import {
    SearchOutlined,
    SyncOutlined,
    EyeOutlined,
    RedoOutlined,
    StopOutlined,
    UploadOutlined
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import type { Channel, ChannelStatus, ChannelLevel, CommissionType } from '../../../types/channel'

const { Title } = Typography
const { RangePicker } = DatePicker
const { Option } = Select

/**
 * 渠道列表页面
 */
const ChannelList: FC = () => {
    const navigate = useNavigate()
    const [form] = Form.useForm()
    const [loading, setLoading] = useState(false)
    const [searching, setSearching] = useState(false)
    const [data, setData] = useState<Channel[]>([])
    const [terminateModalVisible, setTerminateModalVisible] = useState(false)
    const [currentRecord, setCurrentRecord] = useState<Channel | null>(null)
    const [terminateForm] = Form.useForm()

    // 增强渠道数据，注入统计指标
    const getEnhancedChannels = (channels: Channel[]): Channel[] => {
        const reportingData = localStorage.getItem('reporting_data')
        if (!reportingData) return channels

        const reportings: any[] = JSON.parse(reportingData)

        return channels.map(channel => {
            const channelReportings = reportings.filter(r => r.channelId === channel.id)
            const convertedReportings = channelReportings.filter(r => r.status === 'converted')

            // 计算最近成交时间
            let lastConversionTime = '-'
            if (convertedReportings.length > 0) {
                const sorted = [...convertedReportings].sort((a, b) =>
                    dayjs(b.reportingTime).unix() - dayjs(a.reportingTime).unix()
                )
                lastConversionTime = dayjs(sorted[0].reportingTime).format('YYYY-MM-DD HH:mm')
            }

            return {
                ...channel,
                totalReportings: channelReportings.length,
                totalConverted: convertedReportings.length,
                lastConversionTime
            }
        })
    }

    // 获取数据
    const fetchData = () => {
        setLoading(true)
        const storedData = localStorage.getItem('channel_data')
        if (storedData) {
            const channels = JSON.parse(storedData)
            setData(getEnhancedChannels(channels))
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

            // 模拟延迟
            setTimeout(() => {
                const storedData = localStorage.getItem('channel_data')
                if (storedData) {
                    let filteredData: Channel[] = JSON.parse(storedData)

                    // 模糊匹配渠道名称
                    if (values.companyName) {
                        filteredData = filteredData.filter(item =>
                            item.companyName.toLowerCase().includes(values.companyName.toLowerCase())
                        )
                    }

                    // 状态过滤
                    if (values.status && values.status !== 'all') {
                        filteredData = filteredData.filter(item => item.status === values.status)
                    }

                    // 分佣类型过滤
                    if (values.commissionType && values.commissionType !== 'all') {
                        filteredData = filteredData.filter(item => item.commissionType === values.commissionType)
                    }

                    // 等级过滤
                    if (values.level && values.level !== 'all') {
                        if (values.level === 'none') {
                            filteredData = filteredData.filter(item => !item.level)
                        } else {
                            filteredData = filteredData.filter(item => item.level === values.level)
                        }
                    }

                    // 负责人过滤
                    if (values.owner) {
                        filteredData = filteredData.filter(item =>
                            item.owner.toLowerCase().includes(values.owner.toLowerCase())
                        )
                    }

                    // 到期时间过滤
                    if (values.endDateRange) {
                        const [start, end] = values.endDateRange
                        filteredData = filteredData.filter(item => {
                            const date = dayjs(item.endDate)
                            return date.isAfter(start.startOf('day')) && date.isBefore(end.endOf('day'))
                        })
                    }

                    setData(getEnhancedChannels(filteredData))
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

    // 处理延期/续约
    const handleRenew = (record: Channel) => {
        message.info(`调起 ${record.companyName} 的续约流程...`)
    }

    // 处理解约
    const handleTerminate = (record: Channel) => {
        // 1. 清算检查
        const reportingData = localStorage.getItem('reporting_data')
        if (reportingData) {
            const reportings = JSON.parse(reportingData)
            const activeReportings = reportings.filter((r: any) =>
                r.channelId === record.id &&
                ['pending', 'protected'].includes(r.status)
            )

            const unPaidReportings = reportings.filter((r: any) =>
                r.channelId === record.id &&
                r.status === 'converted' &&
                r.orderStatus !== 'fully_paid'
            )

            if (activeReportings.length > 0 || unPaidReportings.length > 0) {
                Modal.error({
                    title: '无法发起解约',
                    content: (
                        <div>
                            <p>该渠道存在未完成的清算项：</p>
                            {activeReportings.length > 0 && <p style={{ color: '#ff4d4f' }}>• 存在 {activeReportings.length} 个待审批或保护期内的报备</p>}
                            {unPaidReportings.length > 0 && <p style={{ color: '#ff4d4f' }}>• 存在 {unPaidReportings.length} 个未完全回款的报备</p>}
                            <p>请先处理相关报备后再试。</p>
                        </div>
                    )
                })
                return
            }
        }

        setCurrentRecord(record)
        setTerminateModalVisible(true)
    }

    // 提交解约
    const submitTerminate = async () => {
        try {
            const values = await terminateForm.validateFields()
            if (!currentRecord) return

            const storedData = localStorage.getItem('channel_data')
            if (storedData) {
                const channels: Channel[] = JSON.parse(storedData)
                const updatedChannels = channels.map(c => {
                    if (c.id === currentRecord.id) {
                        return {
                            ...c,
                            status: 'terminated' as ChannelStatus,
                            terminationReason: values.reason,
                            terminationDescription: values.description,
                            terminationDate: dayjs().format('YYYY-MM-DD'),
                            terminationVoucher: values.voucher?.[0]?.name || 'dummy_voucher.png'
                        }
                    }
                    return c
                })
                localStorage.setItem('channel_data', JSON.stringify(updatedChannels))
                message.success('解约已生效')
                setTerminateModalVisible(false)
                terminateForm.resetFields()
                fetchData()
            }
        } catch (error) {
            console.error('Validation Failed:', error)
        }
    }

    // 状态映射
    const statusMap: Record<ChannelStatus, { text: string; color: string }> = {
        active: { text: '合作中', color: 'success' },
        expiring: { text: '即将到期', color: 'warning' },
        terminated: { text: '已解约', color: 'default' }
    }

    // 分佣类型映射
    const commissionTypeMap: Record<CommissionType, string> = {
        ladder: '阶梯等级',
        fixed: '固定比例',
        personalized: '个性化'
    }

    // 等级映射
    const levelMap: Record<ChannelLevel, { text: string; icon: string }> = {
        gold: { text: '金牌', icon: '🥇' },
        silver: { text: '银牌', icon: '🥈' },
        bronze: { text: '铜牌', icon: '🥉' }
    }

    const columns = [
        {
            title: '渠道名称',
            dataIndex: 'companyName',
            key: 'companyName',
            render: (text: string, record: Channel) => (
                <a onClick={() => navigate(`/channel-detail/${record.id}`)}>{text}</a>
            ),
            ellipsis: true,
            minWidth: 200
        },
        {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            width: 100,
            render: (status: ChannelStatus) => (
                <Tag color={statusMap[status].color}>{statusMap[status].text}</Tag>
            )
        },
        {
            title: '分佣类型',
            dataIndex: 'commissionType',
            key: 'commissionType',
            width: 100,
            render: (type: CommissionType) => commissionTypeMap[type]
        },
        {
            title: '等级',
            dataIndex: 'level',
            key: 'level',
            width: 100,
            render: (level: ChannelLevel | undefined) => {
                if (!level) return '-'
                return (
                    <Space>
                        <span>{levelMap[level].icon}</span>
                        <span>{levelMap[level].text}</span>
                    </Space>
                )
            }
        },
        {
            title: '分佣比例',
            dataIndex: 'commissionRate',
            key: 'commissionRate',
            width: 100,
            render: (text: string) => text || '-'
        },
        {
            title: '开始日期',
            dataIndex: 'startDate',
            key: 'startDate',
            width: 120
        },
        {
            title: '截止日期',
            dataIndex: 'endDate',
            key: 'endDate',
            width: 120,
            render: (date: string, record: Channel) => {
                const isExpiring = record.status === 'expiring'
                return (
                    <span style={{ color: isExpiring ? '#ff4d4f' : 'inherit', fontWeight: isExpiring ? 'bold' : 'normal' }}>
                        {date}
                    </span>
                )
            }
        },
        {
            title: '推荐客户数',
            dataIndex: 'totalReportings',
            key: 'totalReportings',
            width: 140,
            align: 'right' as const,
            sorter: (a: Channel, b: Channel) => (a.totalReportings || 0) - (b.totalReportings || 0)
        },
        {
            title: '成交客户数',
            dataIndex: 'totalConverted',
            key: 'totalConverted',
            width: 140,
            align: 'right' as const,
            sorter: (a: Channel, b: Channel) => (a.totalConverted || 0) - (b.totalConverted || 0)
        },
        {
            title: '最近成交时间',
            dataIndex: 'lastConversionTime',
            key: 'lastConversionTime',
            width: 160
        },
        {
            title: '累计业绩',
            dataIndex: 'ytdPerformance',
            key: 'ytdPerformance',
            width: 120,
            align: 'right' as const,
            render: (val: number) => `${val.toFixed(1)} 万元`
        },
        {
            title: '负责人',
            dataIndex: 'owner',
            key: 'owner',
            width: 100
        },
        {
            title: '操作',
            key: 'action',
            width: 120,
            fixed: 'right' as const,
            render: (_: any, record: Channel) => (
                <Space size="middle">
                    <Tooltip title="查看详情">
                        <Button
                            type="text"
                            icon={<EyeOutlined />}
                            onClick={() => navigate(`/channel-detail/${record.id}`)}
                        />
                    </Tooltip>
                    {record.status === 'expiring' && (
                        <Tooltip title="续约">
                            <Button
                                type="text"
                                icon={<RedoOutlined />}
                                onClick={() => handleRenew(record)}
                                style={{ color: '#fa8c16' }}
                            />
                        </Tooltip>
                    )}
                    {record.status !== 'terminated' && (
                        <Tooltip title="解约">
                            <Button
                                type="text"
                                icon={<StopOutlined />}
                                onClick={() => handleTerminate(record)}
                                danger
                            />
                        </Tooltip>
                    )}
                </Space>
            )
        }
    ]

    return (
        <div style={{ padding: 24 }}>
            <div style={{ marginBottom: 24 }}>
                <Title level={4} style={{ margin: 0 }}>渠道列表</Title>
            </div>

            <Card style={{ marginBottom: 24 }}>
                <Form form={form} layout="vertical" onFinish={handleSearch}>
                    <Row gutter={[24, 0]}>
                        <Col xs={24} sm={12} md={8} lg={6}>
                            <Form.Item name="companyName" label="渠道名称">
                                <Input placeholder="请输入渠道名称" allowClear />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={8} lg={6}>
                            <Form.Item name="status" label="状态">
                                <Select placeholder="请选择状态" allowClear>
                                    <Option value="all">全部</Option>
                                    <Option value="active">合作中</Option>
                                    <Option value="expiring">即将到期</Option>
                                    <Option value="terminated">已解约</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={8} lg={6}>
                            <Form.Item name="commissionType" label="分佣类型">
                                <Select placeholder="请选择类型" allowClear>
                                    <Option value="all">全部</Option>
                                    <Option value="ladder">阶梯等级</Option>
                                    <Option value="fixed">固定比例</Option>
                                    <Option value="personalized">个性化</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={8} lg={6}>
                            <Form.Item name="level" label="等级">
                                <Select placeholder="请选择等级" allowClear>
                                    <Option value="all">全部</Option>
                                    <Option value="gold">🥇 金牌</Option>
                                    <Option value="silver">🥈 银牌</Option>
                                    <Option value="bronze">🥉 铜牌</Option>
                                    <Option value="none">无</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={8} lg={6}>
                            <Form.Item name="owner" label="负责人">
                                <Input placeholder="请输入负责人名称" allowClear />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={8} lg={6}>
                            <Form.Item name="endDateRange" label="到期时间">
                                <RangePicker style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={24} md={24} lg={12} style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end', marginBottom: 24 }}>
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
                scroll={{ x: 1800 }}
                pagination={{
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total) => `共 ${total} 条`
                }}
            />

            <Modal
                title="发起渠道解约"
                open={terminateModalVisible}
                onOk={submitTerminate}
                onCancel={() => {
                    setTerminateModalVisible(false)
                    terminateForm.resetFields()
                }}
                okText="确认解约"
                cancelText="取消"
                okButtonProps={{ danger: true }}
                destroyOnClose
            >
                <div style={{ marginBottom: 16 }}>
                    正在为 <span style={{ fontWeight: 'bold' }}>{currentRecord?.companyName}</span> 发起解约流程。
                </div>
                <Form form={terminateForm} layout="vertical">
                    <Form.Item
                        name="reason"
                        label="解约原因"
                        rules={[{ required: true, message: '请选择解约原因' }]}
                    >
                        <Select placeholder="请选择解约原因">
                            <Option value="contract_expired">合作到期</Option>
                            <Option value="performance_issue">业绩不达标</Option>
                            <Option value="channel_quit">渠道主动退出</Option>
                            <Option value="violation">违规处理</Option>
                            <Option value="other">其他</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item
                        name="description"
                        label="解约说明"
                        rules={[{ required: true, message: '请输入解约说明' }]}
                    >
                        <Input.TextArea rows={4} placeholder="请详细说明解约原因" />
                    </Form.Item>
                    <Form.Item
                        name="voucher"
                        label="解约协议/沟通确认截图"
                        valuePropName="fileList"
                        getValueFromEvent={(e: any) => {
                            if (Array.isArray(e)) return e
                            return e?.fileList
                        }}
                        rules={[{ required: true, message: '请上传解约协议或截图' }]}
                    >
                        <Upload
                            beforeUpload={() => false}
                            maxCount={1}
                            listType="picture"
                        >
                            <Button icon={<UploadOutlined />}>点击上传</Button>
                        </Upload>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    )
}

export default ChannelList
