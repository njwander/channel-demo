import { FC, useState, useEffect } from 'react'
import {
    Table,
    Card,
    Typography,
    Tag,
    Space,
    Button,
    Form,
    Input,
    Select,
    DatePicker,
    message,
    Tooltip,
    Row,
    Col
} from 'antd'
import {
    PlusOutlined,
    SearchOutlined,
    SyncOutlined,
    EyeOutlined,
    FormOutlined,
    SafetyCertificateOutlined,
    DownloadOutlined
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import type { SettlementApplication, SettlementStatus } from '../../../types/settlement'

const { RangePicker } = DatePicker

/**
 * 入驻申请列表
 */
const SettlementList: FC = () => {
    const navigate = useNavigate()
    const [form] = Form.useForm()
    const [loading, setLoading] = useState(false)
    const [data, setData] = useState<SettlementApplication[]>([])

    // 获取数据
    const fetchData = () => {
        setLoading(true)
        try {
            const storedData = localStorage.getItem('settlement_data')
            if (storedData) {
                setData(JSON.parse(storedData))
            }
        } catch (error) {
            message.error('数据加载失败')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    const [searching, setSearching] = useState(false)

    // 处理查询
    const handleSearch = async () => {
        const values = await form.validateFields()
        setSearching(true)

        // 模拟搜索延迟
        setTimeout(() => {
            const storedData = localStorage.getItem('settlement_data')
            if (storedData) {
                let filteredData: SettlementApplication[] = JSON.parse(storedData)
                if (values.companyName) {
                    filteredData = filteredData.filter(item => item.companyName.includes(values.companyName))
                }
                if (values.auditStatus && values.auditStatus !== 'all') {
                    filteredData = filteredData.filter(item => item.auditStatus === values.auditStatus)
                }
                if (values.owner) {
                    filteredData = filteredData.filter(item => item.owner.includes(values.owner))
                }
                // Assuming 'id' and 'applyTime' filtering might be added later based on the provided snippet's structure
                // if (values.id) filteredData = filteredData.filter(item => item.id.includes(values.id))
                // if (values.applyTime) { /* handle date range filtering */ }

                setData(filteredData)
            }
            setSearching(false)
        }, 600)
    }

    // 重置查询
    const handleReset = () => {
        form.resetFields()
        fetchData()
    }

    // 状态样式映射
    const statusMap: Record<SettlementStatus, { color: string; text: string }> = {
        pending: { color: 'blue', text: '待审批' },
        processing: { color: 'orange', text: '审批中' },
        rejected: { color: 'red', text: '驳回' },
        approved: { color: 'green', text: '通过' }
    }

    const columns = [
        {
            title: '申请单号',
            dataIndex: 'id',
            key: 'id',
            width: 150,
            render: (text: string) => <a onClick={() => navigate(`/settlement-detail/${text}`)}>{text}</a>
        },
        {
            title: '渠道名称',
            dataIndex: 'companyName',
            key: 'companyName',
            ellipsis: true
        },
        {
            title: '所在城市',
            dataIndex: 'city',
            key: 'city',
            width: 100
        },
        {
            title: '联系人',
            dataIndex: 'contactName',
            key: 'contactName',
            width: 100
        },
        {
            title: '推荐人',
            dataIndex: 'referrer',
            key: 'referrer',
            width: 100,
            render: (text: string) => text || '-'
        },
        {
            title: '负责人',
            dataIndex: 'owner',
            key: 'owner',
            width: 100
        },
        {
            title: '申请日期',
            dataIndex: 'applyTime',
            key: 'applyTime',
            width: 120
        },
        {
            title: '审批通过日期',
            dataIndex: 'approvalDate',
            key: 'approvalDate',
            width: 120,
            render: (text: string) => text || '-'
        },
        {
            title: '审批状态',
            dataIndex: 'auditStatus',
            key: 'auditStatus',
            width: 100,
            render: (status: SettlementStatus) => (
                <Tag color={statusMap[status]?.color}>{statusMap[status]?.text}</Tag>
            )
        },
        {
            title: '操作',
            key: 'action',
            width: 120,
            render: (_: any, record: SettlementApplication) => (
                <Space size="middle">
                    <Tooltip title="查看详情">
                        <Button
                            type="text"
                            icon={<EyeOutlined />}
                            onClick={() => navigate(`/settlement-detail/${record.id}`)}
                        />
                    </Tooltip>
                    {record.auditStatus === 'rejected' && (
                        <Tooltip title="修改">
                            <Button
                                type="text"
                                icon={<FormOutlined />}
                                onClick={() => navigate(`/settlement-edit/${record.id}`)}
                            />
                        </Tooltip>
                    )}
                    <Tooltip title="质量检查">
                        <Button
                            type="text"
                            icon={<SafetyCertificateOutlined />}
                            onClick={() => navigate(`/settlement-quality-check?id=${record.id}`)}
                        />
                    </Tooltip>
                </Space>
            )
        }
    ]

    return (
        <div style={{ padding: 24 }}>
            <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography.Title level={4} style={{ margin: 0 }}>入驻申请列表</Typography.Title>
                <Space>
                    <Button
                        type="link"
                        icon={<DownloadOutlined />}
                        href="/templates/20231204-影刀营销合作协议书-标准合同.docx"
                        download
                    >
                        下载合同模板
                    </Button>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => navigate('/settlement-new')}
                        style={{ background: '#ff5050', borderColor: '#ff5050' }}
                    >
                        新建入驻申请
                    </Button>
                </Space>
            </div>

            <Card style={{ marginBottom: 24 }}>
                <Form
                    form={form}
                    onFinish={handleSearch}
                    layout="vertical"
                >
                    <Row gutter={[24, 0]}>
                        <Col xs={24} sm={12} md={8} lg={6}>
                            <Form.Item name="companyName" label="渠道名称">
                                <Input placeholder="请输入渠道名称" allowClear />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={8} lg={6}>
                            <Form.Item name="auditStatus" label="审批状态">
                                <Select placeholder="请选择" allowClear>
                                    <Select.Option value="all">全部</Select.Option>
                                    <Select.Option value="pending">待审批</Select.Option>
                                    <Select.Option value="processing">审批中</Select.Option>
                                    <Select.Option value="rejected">驳回</Select.Option>
                                    <Select.Option value="approved">通过</Select.Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={8} lg={6}>
                            <Form.Item name="owner" label="负责人">
                                <Input placeholder="请输入负责人" allowClear />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={8} lg={6}>
                            <Form.Item name="applyTime" label="申请日期">
                                <RangePicker style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={24} md={24} lg={24} style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 24 }}>
                            <Space>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    icon={<SearchOutlined />}
                                    loading={searching}
                                    style={{ background: '#ff5050', borderColor: '#ff5050' }}
                                >
                                    查询
                                </Button>
                                <Button onClick={handleReset} icon={<SyncOutlined />} disabled={searching}>重置</Button>
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
        </div>
    )
}

export default SettlementList
