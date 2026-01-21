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
    Upload
} from 'antd'
import {
    SearchOutlined,
    SyncOutlined,
    UploadOutlined
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import type { Channel, ChannelStatus, CommissionType } from '../../../types/channel'

const { Title, Text } = Typography
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


    // 增强渠道数据，注入统计指标
    const getEnhancedChannels = (channels: Channel[]): Channel[] => {
        const reportingData = localStorage.getItem('reporting_data')
        if (!reportingData) return channels

        const reportings: any[] = JSON.parse(reportingData)

        return channels.map(channel => {
            const channelReportings = reportings.filter(r => r.channelId === channel.id)
            const convertedReportings = channelReportings.filter(r => r.status === 'converted')
            const protectedReportings = channelReportings.filter(r => r.status === 'protected')

            // 计算本月新增报备数 (P1)
            const thisMonth = dayjs().startOf('month')
            const monthNewReportings = channelReportings.filter(r => dayjs(r.reportingTime).isAfter(thisMonth))

            // 计算最近成交时间
            let lastConversionTime = '-'
            if (convertedReportings.length > 0) {
                const sorted = [...convertedReportings].sort((a, b) =>
                    dayjs(b.reportingTime).unix() - dayjs(a.reportingTime).unix()
                )
                lastConversionTime = dayjs(sorted[0].reportingTime).format('YYYY-MM-DD')
            }

            return {
                ...channel,
                totalReportings: channelReportings.length,
                totalConverted: convertedReportings.length,
                protectedCount: protectedReportings.length,
                monthNewCount: monthNewReportings.length,
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

    // 状态映射
    const statusMap: Record<ChannelStatus, { text: string; color: string }> = {
        active: { text: '合作中', color: 'success' },
        expiring: { text: '即将到期', color: 'warning' },
        terminated: { text: '已解约', color: 'default' }
    }

    const columns = [
        {
            title: '渠道名称',
            dataIndex: 'companyName',
            key: 'companyName',
            fixed: 'left' as const,
            render: (text: string, record: Channel) => (
                <a onClick={() => navigate(`/channel-detail/${record.id}`)} style={{ fontWeight: 500 }}>{text}</a>
            ),
            width: 220
        },
        {
            title: '周期累计业绩',
            dataIndex: 'ytdPerformance',
            key: 'ytdPerformance',
            width: 180,
            align: 'right' as const,
            render: (val: number, record: Channel) => (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                    <Text strong style={{ color: '#1890ff' }}>
                        {val?.toFixed(2)} 万元
                    </Text>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                        {record.startDate} ~ {record.endDate}
                    </Text>
                </div>
            ),
            sorter: (a: Channel, b: Channel) => (a.ytdPerformance || 0) - (b.ytdPerformance || 0)
        },
        {
            title: '保护中客户',
            dataIndex: 'protectedCount',
            key: 'protectedCount',
            width: 120,
            align: 'center' as const,
            render: (count: number, record: Channel) => (
                <Button
                    type="link"
                    size="small"
                    onClick={() => navigate(`/reporting-list?channelId=${record.id}&status=protected`)}
                >
                    {count || 0}
                </Button>
            ),
            sorter: (a: any, b: any) => (a.protectedCount || 0) - (b.protectedCount || 0)
        },
        {
            title: '累计成交客户',
            dataIndex: 'totalConverted',
            key: 'totalConverted',
            width: 120,
            align: 'center' as const,
            render: (val: number) => <Text>{val || 0}</Text>,
            sorter: (a: any, b: any) => (a.totalConverted || 0) - (b.totalConverted || 0)
        },
        {
            title: '到期时间',
            dataIndex: 'endDate',
            key: 'endDate',
            width: 120,
            render: (date: string) => {
                const days = dayjs(date).diff(dayjs(), 'day')
                const isNear = days >= 0 && days <= 30
                return (
                    <span style={{ color: isNear ? '#ff4d4f' : 'inherit', fontWeight: isNear ? 600 : 400 }}>
                        {date}
                    </span>
                )
            }
        },
        {
            title: '最近成交',
            dataIndex: 'lastConversionTime',
            key: 'lastConversionTime',
            width: 120,
            render: (text: string) => <Text type="secondary">{text}</Text>
        },
        {
            title: '负责人',
            dataIndex: 'owner',
            key: 'owner',
            width: 100
        },
        {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            width: 90,
            render: (status: ChannelStatus) => (
                <Tag color={statusMap[status].color}>{statusMap[status].text}</Tag>
            )
        },
        {
            title: '操作',
            key: 'action',
            fixed: 'right' as const,
            width: 80,
            render: (_: any, record: Channel) => (
                <Button
                    type="link"
                    size="small"
                    onClick={() => navigate(`/channel-detail/${record.id}`)}
                >
                    详情
                </Button>
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
                            <Form.Item name="owner" label="负责人">
                                <Input placeholder="请输入负责人名称" allowClear />
                            </Form.Item>
                        </Col>
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

export default ChannelList
