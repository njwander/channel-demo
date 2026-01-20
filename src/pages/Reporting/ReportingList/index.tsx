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
    const [isTransferModalVisible, setIsTransferModalVisible] = useState(false)
    const [isInvalidModalVisible, setIsInvalidModalVisible] = useState(false)
    const [currentRecord, setCurrentRecord] = useState<Reporting | null>(null)
    const [transferForm] = Form.useForm()
    const [invalidForm] = Form.useForm()

    // 判定无效的原因选项
    const invalidReasonOptions = [
        { label: '客户冲突 (CRM已存在/销售跟进中)', value: '客户冲突' },
        { label: '无效客户信息 (名称不符/联系方式有误)', value: '无效客户信息' },
        { label: '非渠道授权范围 (行业/区域限制)', value: '非渠道授权范围' },
        { label: '重复报备', value: '重复报备' },
        { label: '其他', value: '其他' }
    ]

    // 模拟内部员工列表
    const internalStaff = [
        { label: '张三 (渠道负责人)', value: '张三' },
        { label: '李四 (销售经理)', value: '李四' },
        { label: '王五 (销售)', value: '王五' },
        { label: '赵六 (渠道经理)', value: '赵六' }
    ]

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

                    // 是否有效过滤
                    if (values.isValid !== undefined && values.isValid !== 'all') {
                        const isValid = values.isValid === 'true'
                        filteredData = filteredData.filter(item => item.isValid === isValid)
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

    // 处理转交提交
    const handleTransferOk = async () => {
        try {
            const values = await transferForm.validateFields()
            if (!currentRecord) return

            // 模拟更新数据
            const newData = data.map(item => {
                if (item.id === currentRecord.id) {
                    return { ...item, channelOwner: values.newReviewer }
                }
                return item
            })

            setData(newData)
            localStorage.setItem('reporting_data', JSON.stringify(newData))
            message.success(`已成功转交至 ${values.newReviewer}`)
            setIsTransferModalVisible(false)
            transferForm.resetFields()
        } catch (error) {
            console.error('Transfer Failed:', error)
        }
    }

    // 处理判定无效提交
    const handleInvalidOk = async () => {
        try {
            const values = await invalidForm.validateFields()
            if (!currentRecord) return

            // 模拟更新数据
            const newData = data.map(item => {
                if (item.id === currentRecord.id) {
                    return {
                        ...item,
                        status: 'rejected' as const,
                        isValid: false,
                        invalidReason: values.invalidReason
                    }
                }
                return item
            })

            setData(newData)
            localStorage.setItem('reporting_data', JSON.stringify(newData))
            message.success('已判定为无效报备')
            setIsInvalidModalVisible(false)
            invalidForm.resetFields()
        } catch (error) {
            console.error('Invalid Selection Failed:', error)
        }
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
            title: '是否有效',
            dataIndex: 'isValid',
            key: 'isValid',
            width: 100,
            render: (valid: boolean) => (
                valid === undefined ? '-' : (valid ? <Tag color="success">有效</Tag> : <Tag color="error">无效</Tag>)
            )
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
            width: 250,
            fixed: 'right' as const,
            render: (_: any, record: Reporting) => (
                <Space size="middle">
                    <Button
                        type="link"
                        size="small"
                        onClick={() => navigate(`/reporting-detail/${record.id}`)}
                    >
                        详情
                    </Button>
                    {record.status === 'rejected' && (
                        <Button
                            type="link"
                            size="small"
                            onClick={() => navigate('/reporting-new')}
                        >
                            编辑
                        </Button>
                    )}
                    {record.status === 'pending' && (
                        <>
                            <Button
                                type="link"
                                size="small"
                                onClick={() => {
                                    setCurrentRecord(record)
                                    transferForm.setFieldsValue({ newReviewer: record.channelOwner })
                                    setIsTransferModalVisible(true)
                                }}
                            >
                                转交
                            </Button>
                            <Button
                                type="link"
                                size="small"
                                danger
                                onClick={() => {
                                    setCurrentRecord(record)
                                    setIsInvalidModalVisible(true)
                                }}
                            >
                                判定无效
                            </Button>
                        </>
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
                            <Form.Item name="isValid" label="是否有效">
                                <Select placeholder="请选择" allowClear>
                                    <Option value="all">全部</Option>
                                    <Option value="true">有效</Option>
                                    <Option value="false">无效</Option>
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

            {/* 转交任务弹窗 */}
            <Modal
                title="转交报备审查任务"
                open={isTransferModalVisible}
                onOk={handleTransferOk}
                onCancel={() => {
                    setIsTransferModalVisible(false)
                    transferForm.resetFields()
                }}
                destroyOnClose
            >
                <div style={{ marginBottom: 16 }}>
                    <Typography.Text type="secondary">客户名称：</Typography.Text>
                    <Typography.Text strong>{currentRecord?.customerName}</Typography.Text>
                </div>
                <Form form={transferForm} layout="vertical">
                    <Form.Item
                        name="newReviewer"
                        label="选择新负责人"
                        rules={[{ required: true, message: '请选择新负责人' }]}
                    >
                        <Select placeholder="请选择内部员工" options={internalStaff} showSearch />
                    </Form.Item>
                </Form>
            </Modal>

            {/* 判定无效弹窗 */}
            <Modal
                title="判定报备无效"
                open={isInvalidModalVisible}
                onOk={handleInvalidOk}
                onCancel={() => {
                    setIsInvalidModalVisible(false)
                    invalidForm.resetFields()
                }}
                okText="确认无效"
                cancelText="取消"
                destroyOnClose
            >
                <div style={{ marginBottom: 16 }}>
                    <Typography.Text type="secondary">客户名称：</Typography.Text>
                    <Typography.Text strong>{currentRecord?.customerName}</Typography.Text>
                </div>
                <Form form={invalidForm} layout="vertical">
                    <Form.Item
                        name="invalidReason"
                        label="无效原因"
                        rules={[{ required: true, message: '请选择无效原因' }]}
                    >
                        <Select placeholder="请选择无效原因" options={invalidReasonOptions} />
                    </Form.Item>
                    <Form.Item
                        noStyle
                        shouldUpdate={(prevValues, currentValues) => prevValues.invalidReason !== currentValues.invalidReason}
                    >
                        {({ getFieldValue }) =>
                            getFieldValue('invalidReason') === '其他' ? (
                                <Form.Item
                                    name="otherReason"
                                    label="其他原因备注"
                                    rules={[{ required: true, message: '请输入详情' }]}
                                    style={{ marginTop: 16 }}
                                >
                                    <Input.TextArea placeholder="请输入具体原因说明" rows={3} />
                                </Form.Item>
                            ) : null
                        }
                    </Form.Item>
                    <div style={{ marginTop: 8 }}>
                        <Typography.Text type="warning" italic style={{ fontSize: '12px' }}>
                            * 判定为无效报备后，该客户成交将无法获得渠道返点。
                        </Typography.Text>
                    </div>
                </Form>
            </Modal>
        </div>
    )
}

export default ReportingList
