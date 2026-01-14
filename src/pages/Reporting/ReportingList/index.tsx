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
    Modal
} from 'antd'
import {
    SearchOutlined,
    SyncOutlined,
    EyeOutlined,
    PlusOutlined,
    ImportOutlined,
    EditOutlined,
    CalendarOutlined,
    SwapOutlined,
    DeleteOutlined
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import type {
    Reporting,
    ReportingStatus,
    FollowupStatus,
    OpportunityStage,
    OrderStatus
} from '../../../types/reporting'

const { Title } = Typography
const { RangePicker } = DatePicker
const { Option } = Select

/**
 * 客户报备列表
 */
const ReportingList: FC = () => {
    const navigate = useNavigate()
    const [form] = Form.useForm()
    const [loading, setLoading] = useState(false)
    const [searching, setSearching] = useState(false)
    const [data, setData] = useState<Reporting[]>([])

    // 获取数据
    const fetchData = () => {
        setLoading(true)
        const storedData = localStorage.getItem('reporting_data')
        if (storedData) {
            setData(JSON.parse(storedData))
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
                const storedData = localStorage.getItem('reporting_data')
                if (storedData) {
                    let filteredData: Reporting[] = JSON.parse(storedData)

                    // 客户名称模糊匹配
                    if (values.customerName) {
                        filteredData = filteredData.filter(item =>
                            item.customerName.toLowerCase().includes(values.customerName.toLowerCase())
                        )
                    }

                    // 状态过滤
                    if (values.status && values.status !== 'all') {
                        filteredData = filteredData.filter(item => item.status === values.status)
                    }

                    // 跟进状态过滤
                    if (values.followupStatus && values.followupStatus !== 'all') {
                        filteredData = filteredData.filter(item => item.followupStatus === values.followupStatus)
                    }

                    // 商机阶段过滤
                    if (values.opportunityStage && values.opportunityStage !== 'all') {
                        filteredData = filteredData.filter(item => item.opportunityStage === values.opportunityStage)
                    }

                    // 成交状态过滤
                    if (values.orderStatus && values.orderStatus !== 'all') {
                        filteredData = filteredData.filter(item => item.orderStatus === values.orderStatus)
                    }

                    // 报备时间过滤
                    if (values.reportingTimeRange) {
                        const [start, end] = values.reportingTimeRange
                        filteredData = filteredData.filter(item => {
                            const date = dayjs(item.reportingTime)
                            return date.isAfter(start.startOf('day')) && date.isBefore(end.endOf('day'))
                        })
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

    // 报备状态映射
    const statusMap: Record<ReportingStatus, { text: string; color: string }> = {
        pending: { text: '待审批', color: 'orange' },
        rejected: { text: '已驳回', color: 'red' },
        protected: { text: '保护期内', color: 'blue' },
        converted: { text: '已转化', color: 'green' },
        expired: { text: '已失效', color: 'default' },
        cancelled: { text: '已作废', color: 'default' }
    }

    // 跟进状态映射
    const followupMap: Record<FollowupStatus, string> = {
        not_started: '未跟进',
        following: '跟进中',
        customer_associated: '关联客户'
    }

    // 商机阶段映射
    const stageMap: Record<OpportunityStage, string> = {
        none: '无商机',
        developing: '商机中',
        closed: '已成单'
    }

    // 成交状态映射
    const orderMap: Record<OrderStatus, string> = {
        signed: '已签约',
        partially_paid: '已回款(部分)',
        fully_paid: '已回款(全部)'
    }

    const columns = [
        {
            title: '客户名称',
            dataIndex: 'customerName',
            key: 'customerName',
            render: (text: string, record: Reporting) => (
                <a onClick={() => navigate(`/reporting-detail/${record.id}`)}>{text}</a>
            ),
            ellipsis: true,
            minWidth: 200
        },
        {
            title: '报备状态',
            dataIndex: 'status',
            key: 'status',
            width: 100,
            render: (status: ReportingStatus) => (
                <Tag color={statusMap[status].color}>{statusMap[status].text}</Tag>
            )
        },
        {
            title: '保护到期',
            dataIndex: 'expiryDate',
            key: 'expiryDate',
            width: 110,
            render: (date: string, record: Reporting) => {
                if (!date) return '-'
                const diff = dayjs(date).diff(dayjs(), 'day')
                const isUrgent = diff <= 7 && diff >= 0
                return (
                    <span style={{ color: isUrgent ? '#ff4d4f' : 'inherit', fontWeight: isUrgent ? 'bold' : 'normal' }}>
                        {date}
                    </span>
                )
            }
        },
        {
            title: '跟进状态',
            dataIndex: 'followupStatus',
            key: 'followupStatus',
            width: 100,
            render: (status: FollowupStatus) => followupMap[status] || '-'
        },
        {
            title: '商机阶段',
            dataIndex: 'opportunityStage',
            key: 'opportunityStage',
            width: 100,
            render: (stage: OpportunityStage) => stageMap[stage] || '-'
        },
        {
            title: '成交状态',
            dataIndex: 'orderStatus',
            key: 'orderStatus',
            width: 120,
            render: (status: OrderStatus) => status ? orderMap[status] : '-'
        },
        {
            title: '所属渠道',
            dataIndex: 'channelName',
            key: 'channelName',
            ellipsis: true,
            width: 180
        },
        {
            title: '负责人',
            dataIndex: 'channelOwner',
            key: 'channelOwner',
            width: 100
        },
        {
            title: '报备时间',
            dataIndex: 'reportingTime',
            key: 'reportingTime',
            width: 160,
            render: (time: string) => dayjs(time).format('YYYY-MM-DD HH:mm')
        },
        {
            title: '操作',
            key: 'action',
            width: 150,
            fixed: 'right' as const,
            render: (_: any, record: Reporting) => (
                <Space size="small">
                    <Tooltip title="查看详情">
                        <Button
                            type="text"
                            icon={<EyeOutlined />}
                            onClick={() => navigate(`/reporting-detail/${record.id}`)}
                        />
                    </Tooltip>
                    {record.status === 'rejected' && (
                        <Tooltip title="重新提交">
                            <Button
                                type="text"
                                icon={<EditOutlined />}
                                onClick={() => navigate('/reporting-new')}
                            />
                        </Tooltip>
                    )}
                    {record.status === 'protected' && (
                        <Tooltip title="延期申请">
                            <Button
                                type="text"
                                icon={<CalendarOutlined />}
                                onClick={() => message.info('发起延期申请审批...')}
                            />
                        </Tooltip>
                    )}
                    {(record.status === 'pending' || record.status === 'rejected') && (
                        <Tooltip title="作废">
                            <Button
                                type="text"
                                icon={<DeleteOutlined />}
                                danger
                                onClick={() => {
                                    Modal.confirm({
                                        title: '确定作废该报备？',
                                        content: '作废后将释放该客户资源，无法撤回。',
                                        onOk: () => message.success('报备已作废')
                                    })
                                }}
                            />
                        </Tooltip>
                    )}
                </Space>
            )
        }
    ]

    return (
        <div style={{ padding: 24 }}>
            <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Title level={4} style={{ margin: 0 }}>客户报备管理</Title>
                <Space>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => navigate('/reporting-new')}
                        style={{ background: '#ff5050', borderColor: '#ff5050' }}
                    >
                        新建报备
                    </Button>
                </Space>
            </div>

            <Card style={{ marginBottom: 24 }}>
                <Form form={form} layout="vertical" onFinish={handleSearch}>
                    <Row gutter={[24, 0]}>
                        <Col xs={24} sm={12} md={8} lg={6}>
                            <Form.Item name="customerName" label="客户名称">
                                <Input placeholder="请输入客户名称" allowClear />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={8} lg={6}>
                            <Form.Item name="status" label="报备状态">
                                <Select placeholder="请选择状态" allowClear>
                                    <Option value="all">全部</Option>
                                    <Option value="pending">待审批</Option>
                                    <Option value="rejected">已驳回</Option>
                                    <Option value="protected">保护期内</Option>
                                    <Option value="converted">已转化</Option>
                                    <Option value="expired">已失效</Option>
                                    <Option value="cancelled">已作废</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={8} lg={6}>
                            <Form.Item name="followupStatus" label="跟进状态">
                                <Select placeholder="请选择状态" allowClear>
                                    <Option value="all">全部</Option>
                                    <Option value="not_started">未跟进</Option>
                                    <Option value="following">跟进中</Option>
                                    <Option value="customer_associated">关联客户</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={8} lg={6}>
                            <Form.Item name="opportunityStage" label="商机阶段">
                                <Select placeholder="请选择阶段" allowClear>
                                    <Option value="all">全部</Option>
                                    <Option value="none">无商机</Option>
                                    <Option value="developing">商机中</Option>
                                    <Option value="closed">已成单</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={8} lg={6}>
                            <Form.Item name="orderStatus" label="成交状态">
                                <Select placeholder="请选择状态" allowClear>
                                    <Option value="all">全部</Option>
                                    <Option value="signed">已签约</Option>
                                    <Option value="partially_paid">已回款(部分)</Option>
                                    <Option value="fully_paid">已回款(全部)</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={8} lg={6}>
                            <Form.Item name="reportingTimeRange" label="报备时间">
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
                scroll={{ x: 1500 }}
                pagination={{
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total) => `共 ${total} 条`
                }}
            />
        </div>
    )
}

export default ReportingList
