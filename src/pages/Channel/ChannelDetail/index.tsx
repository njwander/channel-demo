import { FC, useState, useEffect } from 'react'
import {
    Card,
    Typography,
    Row,
    Col,
    Statistic,
    Tabs,
    Descriptions,
    Table,
    Button,
    Tag,
    Space,
    Modal,
    Form,
    Select,
    Input,
    message,
    Dropdown,
    Empty,
    Divider
} from 'antd'
import {
    ArrowLeftOutlined,
    MoreOutlined,
    EditOutlined,
    HistoryOutlined,
    UserOutlined,
    SafetyCertificateOutlined,
    DownloadOutlined,
    FilePdfOutlined,
    FileWordOutlined,
    PlusOutlined
} from '@ant-design/icons'
import { useNavigate, useParams } from 'react-router-dom'
import dayjs from 'dayjs'
import type { Channel, ChannelStatus, CommissionType } from '../../../types/channel'
import type { CommissionRule } from '../../../types/commissionRule'
import type { Reporting } from '../../../types/reporting'

const { Title, Text } = Typography

/**
 * 渠道详情页
 */
const ChannelDetail: FC = () => {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const [data, setData] = useState<Channel | null>(null)
    const [loading, setLoading] = useState(true)
    const [commissionRules, setCommissionRules] = useState<CommissionRule[]>([])
    const [reportings, setReportings] = useState<Reporting[]>([])

    // 弹窗状态
    const [isCommissionModalVisible, setIsCommissionModalVisible] = useState(false)
    const [commissionForm] = Form.useForm()

    // 获取数据
    const fetchData = () => {
        setLoading(true)
        const storedChannels = localStorage.getItem('channel_data')
        let currentChannel: Channel | null = null
        if (storedChannels) {
            const channels: Channel[] = JSON.parse(storedChannels)
            currentChannel = channels.find(c => c.id === id) || null
            setData(currentChannel)
        }

        const storedRules = localStorage.getItem('commission_rules')
        if (storedRules) {
            setCommissionRules(JSON.parse(storedRules))
        }

        const storedReportings = localStorage.getItem('reporting_data')
        if (storedReportings && currentChannel) {
            const allReportings: Reporting[] = JSON.parse(storedReportings)
            setReportings(allReportings.filter(r =>
                r.channelName === currentChannel?.companyName ||
                r.channelId === currentChannel?.id ||
                r.id.includes(currentChannel?.id || 'NEVER_MATCH')
            ))
        }
        setLoading(false)
    }

    useEffect(() => {
        fetchData()
    }, [id])

    // 状态映射
    const statusMap: Record<ChannelStatus, { text: string; color: string }> = {
        active: { text: '合作中', color: 'success' },
        expiring: { text: '即将到期', color: 'warning' },
        terminated: { text: '已解约', color: 'default' }
    }

    const commissionTypeMap: Record<CommissionType, string> = {
        custom_ladder: '阶梯分佣',
        fixed: '固定分佣',
        personalized: '协议分佣'
    }

    // 提交分佣配置变更
    const handleCommissionSubmit = async () => {
        try {
            const values = await commissionForm.validateFields()
            message.loading({ content: '正在发起变更申请...', key: 'changing' })

            setTimeout(() => {
                message.success({ content: '分佣配置变更申请已提交，等待业务审批', key: 'changing' })
                setIsCommissionModalVisible(false)
                commissionForm.resetFields()
                // 实际业务中这里会产生一个审批流记录，并将渠道状态标记为“变更中”
            }, 1000)
        } catch (error) {
            console.error('Validation Failed:', error)
        }
    }

    if (!data && !loading) return <div style={{ padding: 24 }}><Empty description="未找到渠道资料" /></div>

    return (
        <div style={{ padding: '0 24px 24px' }}>
            {/* 顶部头部概览 */}
            <div style={{
                padding: '16px 0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: '#f5f5f5',
                position: 'sticky',
                top: 0,
                zIndex: 10
            }}>
                <Space size="middle">
                    <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/channel-list')}>返回</Button>
                    <Title level={4} style={{ margin: 0 }}>渠道详情: {data?.companyName}</Title>
                    {data && <Tag color={statusMap[data.status].color}>{statusMap[data.status].text}</Tag>}
                </Space>
                <Space>
                    <Dropdown
                        menu={{
                            items: [
                                { key: '1', label: '变更负责人', icon: <UserOutlined /> },
                                { key: '2', label: '分佣配置变更', icon: <SafetyCertificateOutlined />, onClick: () => setIsCommissionModalVisible(true) },
                                { key: '3', label: '导出明细', icon: <DownloadOutlined /> },
                                { type: 'divider' },
                                { key: '4', label: '解约', icon: <HistoryOutlined />, danger: true },
                            ]
                        }}
                    >
                        <Button icon={<MoreOutlined />}>更多操作</Button>
                    </Dropdown>
                </Space>
            </div>

            <Row gutter={24} style={{ marginTop: 20 }}>
                <Col span={24}>
                    <Card style={{ marginBottom: 24 }}>
                        <Row gutter={48}>
                            <Col span={6}>
                                <Statistic title="本周期业绩" value={data?.ytdPerformance || 0} suffix="万元" precision={2} />
                            </Col>
                            <Col span={6}>
                                <Statistic title="累计成交客户" value={data?.totalConverted || 0} />
                            </Col>
                            <Col span={6}>
                                <Statistic title="权益保护中" value={reportings.filter(r => r.status === 'protected').length} />
                            </Col>
                            <Col span={6}>
                                <Statistic title="预计下月分佣" value={1.2} suffix="万元" precision={2} valueStyle={{ color: '#3f8600' }} />
                            </Col>
                        </Row>
                    </Card>

                    <Tabs
                        type="card"
                        items={[
                            {
                                key: 'basic',
                                label: '基础资料',
                                children: (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                                        <Card title="工商档案" size="small">
                                            <Descriptions column={2}>
                                                <Descriptions.Item label="公司全称">{data?.companyName}</Descriptions.Item>
                                                <Descriptions.Item label="纳税人识别号">91510100MA6XXXXXXX</Descriptions.Item>
                                                <Descriptions.Item label="注册地址">四川省成都市武侯区科华北路65号</Descriptions.Item>
                                                <Descriptions.Item label="开户银行">中国工商银行成都分行</Descriptions.Item>
                                                <Descriptions.Item label="银行账号">6222 0802 **** **** 888</Descriptions.Item>
                                            </Descriptions>
                                        </Card>
                                        <Card
                                            title="分佣配置"
                                            size="small"
                                            extra={<Button type="link" size="small" icon={<EditOutlined />} onClick={() => setIsCommissionModalVisible(true)}>变更申请</Button>}
                                        >
                                            <Descriptions column={2}>
                                                <Descriptions.Item label="分佣类型">{data ? commissionTypeMap[data.commissionType] : '-'}</Descriptions.Item>
                                                <Descriptions.Item label="当前配置">
                                                    {data?.commissionType === 'fixed' ? `${data.commissionRate || 10}%` :
                                                        data?.commissionType === 'custom_ladder' ? (data.ruleId || '通用阶梯规则') : '按协议约定'}
                                                </Descriptions.Item>
                                                <Descriptions.Item label="合作有效期">{`${data?.startDate} 至 ${data?.endDate}`}</Descriptions.Item>
                                            </Descriptions>
                                        </Card>
                                        <Card title="联系人列表" size="small">
                                            <Table
                                                size="small"
                                                dataSource={[
                                                    { key: '1', name: '王小二', position: '技术总监', phone: '13888888888', email: 'wang@example.com' },
                                                    { key: '2', name: '李三', position: '商务经理', phone: '13999999999', email: 'li@example.com' }
                                                ]}
                                                columns={[
                                                    { title: '姓名', dataIndex: 'name', key: 'name' },
                                                    { title: '职位', dataIndex: 'position', key: 'position' },
                                                    { title: '电话', dataIndex: 'phone', key: 'phone' },
                                                    { title: '邮箱', dataIndex: 'email', key: 'email' }
                                                ]}
                                                pagination={false}
                                            />
                                        </Card>
                                    </div>
                                )
                            },
                            {
                                key: 'reporting',
                                label: '报备管理',
                                children: (
                                    <Card
                                        title={`报备客户 (${reportings.length})`}
                                        size="small"
                                        extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/reporting-new')}>新建报备</Button>}
                                    >
                                        <Table
                                            size="small"
                                            dataSource={reportings}
                                            columns={[
                                                { title: '客户名称', dataIndex: 'customerName', key: 'customerName', render: (text, record) => <a onClick={() => navigate(`/reporting-detail/${record.id}`)}>{text}</a> },
                                                { title: '报备状态', dataIndex: 'status', key: 'status', render: (status: any) => <Tag>{status}</Tag> },
                                                { title: '保护到期', dataIndex: 'expiryDate', key: 'expiryDate' },
                                                { title: '负责人', dataIndex: 'channelOwner', key: 'channelOwner' }
                                            ]}
                                        />
                                    </Card>
                                )
                            },
                            {
                                key: 'performance',
                                label: '成交业绩',
                                children: (
                                    <Card title="成交订单列表" size="small">
                                        <Table
                                            size="small"
                                            dataSource={[
                                                { key: '1', orderId: 'ORD2026001', customer: '成都市某某贸易有限公司', date: '2026-01-10', amount: 50.0, paid: 50.0, commission: 6.0 },
                                                { key: '2', orderId: 'ORD2026002', customer: '四川九成商贸', date: '2026-01-15', amount: 30.0, paid: 15.0, commission: 3.6 }
                                            ]}
                                            columns={[
                                                { title: '订单单号', dataIndex: 'orderId', key: 'orderId' },
                                                { title: '客户名称', dataIndex: 'customer', key: 'customer' },
                                                { title: '成单日期', dataIndex: 'date', key: 'date' },
                                                { title: '订单金额 (万)', dataIndex: 'amount', key: 'amount', align: 'right' },
                                                { title: '回款金额 (万)', dataIndex: 'paid', key: 'paid', align: 'right' },
                                                { title: '关联分佣 (万)', dataIndex: 'commission', key: 'commission', align: 'right' }
                                            ]}
                                        />
                                    </Card>
                                )
                            },
                            {
                                key: 'settlement',
                                label: '结算历史',
                                children: (
                                    <Card title="月度结算单" size="small">
                                        <Table
                                            size="small"
                                            dataSource={[
                                                { key: '1', month: '2025-12', amount: 12.5, status: 'paid', payoutDate: '2026-01-05' },
                                                { key: '2', month: '2025-11', amount: 8.2, status: 'paid', payoutDate: '2025-12-05' }
                                            ]}
                                            columns={[
                                                { title: '结算月份', dataIndex: 'month', key: 'month' },
                                                { title: '结算金额 (万)', dataIndex: 'amount', key: 'amount', align: 'right' },
                                                { title: '状态', dataIndex: 'status', key: 'status', render: (s) => <Tag color="success">已支付</Tag> },
                                                { title: '支付日期', dataIndex: 'payoutDate', key: 'payoutDate' }
                                            ]}
                                        />
                                    </Card>
                                )
                            },
                            {
                                key: 'contract',
                                label: '合同协议',
                                children: (
                                    <Card title="已签署合规文件" size="small">
                                        <Table
                                            size="small"
                                            dataSource={[
                                                { key: '1', name: '渠道入驻合作协议.pdf', type: 'standard', date: '2024-01-01' },
                                                { key: '2', name: '廉洁合作承诺书.pdf', type: 'attachment', date: '2024-01-01' }
                                            ]}
                                            columns={[
                                                { title: '文件名称', dataIndex: 'name', key: 'name', render: (t) => <Button type="link" icon={<FilePdfOutlined />}>{t}</Button> },
                                                { title: '类型', dataIndex: 'type', key: 'type', render: (t) => t === 'standard' ? <Tag color="blue">标准合同</Tag> : <Tag>补充附件</Tag> },
                                                { title: '签署日期', dataIndex: 'date', key: 'date' },
                                                { title: '操作', key: 'op', render: () => <Button size="small" icon={<DownloadOutlined />}>下载</Button> }
                                            ]}
                                        />
                                    </Card>
                                )
                            }
                        ]}
                    />
                </Col>
            </Row>

            {/* 分佣配置变更弹窗 */}
            <Modal
                title="分佣配置变更申请"
                open={isCommissionModalVisible}
                onOk={handleCommissionSubmit}
                onCancel={() => setIsCommissionModalVisible(false)}
                width={600}
                destroyOnClose
            >
                <div style={{ marginBottom: 20, padding: '12px', background: '#fff7e6', border: '1px solid #ffe58f', borderRadius: 4 }}>
                    <Text type="warning">注意：修改分佣配置将重新发起业务审批流程，审批通过前仍执行原配置。</Text>
                </div>
                <Form form={commissionForm} layout="vertical">
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item label="当前配置类型">
                                <Input value={data ? commissionTypeMap[data.commissionType] : '-'} disabled />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="当前比例/规则">
                                <Input value={data?.commissionRate || (data?.ruleId || '默认')} disabled />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Divider style={{ margin: '12px 0' }} />
                    <Form.Item name="newType" label="拟变更类型" rules={[{ required: true, message: '请选择变更后的类型' }]}>
                        <Select placeholder="请选择新的分佣类型">
                            <Select.Option value="custom_ladder">阶梯分佣</Select.Option>
                            <Select.Option value="fixed">固定分佣</Select.Option>
                            <Select.Option value="personalized">协议分佣</Select.Option>
                        </Select>
                    </Form.Item>
                    <Form.Item noStyle shouldUpdate={(p, c) => p.newType !== c.newType}>
                        {({ getFieldValue }) => {
                            const newType = getFieldValue('newType');
                            if (newType === 'fixed') {
                                return (
                                    <Form.Item name="newRate" label="拟变更固定比例 (%)" rules={[{ required: true }]}>
                                        <Input type="number" suffix="%" />
                                    </Form.Item>
                                )
                            }
                            if (newType === 'custom_ladder') {
                                return (
                                    <Form.Item name="ruleId" label="拟选择分佣规则" rules={[{ required: true }]}>
                                        <Select options={commissionRules.map(r => ({ label: r.name, value: r.id }))} />
                                    </Form.Item>
                                )
                            }
                            if (newType === 'personalized') {
                                return (
                                    <Form.Item name="description" label="拟变更协议说明" rules={[{ required: true }]}>
                                        <Input.TextArea rows={3} />
                                    </Form.Item>
                                )
                            }
                            return null;
                        }}
                    </Form.Item>
                    <Form.Item name="reason" label="变更原因说明" rules={[{ required: true, message: '请输入申请变更的原因' }]}>
                        <Input.TextArea placeholder="请详细说明为什么要调整该渠道的分佣政策" rows={4} />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    )
}

export default ChannelDetail
