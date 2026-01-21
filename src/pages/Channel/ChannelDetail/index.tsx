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
    Divider,
    Upload,
    Radio,
    InputNumber,
    DatePicker
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
    PlusOutlined,
    UploadOutlined,
    DeleteOutlined,
    SettingOutlined,
    CheckCircleFilled,
    InfoCircleOutlined,
    CalendarOutlined
} from '@ant-design/icons'
import { useNavigate, useParams } from 'react-router-dom'
import dayjs from 'dayjs'
import type { Channel, ChannelStatus, CommissionType } from '../../../types/channel'
import type { Reporting } from '../../../types/reporting'

const { Title, Text } = Typography
const { Option } = Select

// 标准规则
const DEFAULT_SYSTEM_RULE = {
    id: 'RULE_DEFAULT',
    name: '系统默认规则',
    tiers: [
        { min: 0, max: 50, rate: 20 },
        { min: 50, max: 100, rate: 25 },
        { min: 100, max: null, rate: 30 }
    ]
};

/**
 * 渠道详情页
 */
const ChannelDetail: FC = () => {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const [data, setData] = useState<Channel | null>(null)
    const [loading, setLoading] = useState(true)
    const [reportings, setReportings] = useState<Reporting[]>([])

    // 弹窗状态
    const [isCommissionModalVisible, setIsCommissionModalVisible] = useState(false)
    const [commissionForm] = Form.useForm()
    const [isSpecialMode, setIsSpecialMode] = useState(false)

    // 变更负责人相关状态
    const [isOwnerModalVisible, setIsOwnerModalVisible] = useState(false)
    const [ownerForm] = Form.useForm()

    // 解约相关状态
    const [terminateModalVisible, setTerminateModalVisible] = useState(false)
    const [terminateForm] = Form.useForm()

    // 业绩周期变更状态
    const [isCycleModalVisible, setIsCycleModalVisible] = useState(false)
    const [cycleForm] = Form.useForm()

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

            // 校验区间合理性
            if (isSpecialMode && values.commissionType === 'custom_ladder') {
                const tiers = values.commissionTiers;
                const sortedTiers = [...tiers].sort((a, b) => a.min - b.min);
                for (let i = 0; i < sortedTiers.length; i++) {
                    if (sortedTiers[i].max !== null && sortedTiers[i].max !== undefined && sortedTiers[i].min >= sortedTiers[i].max!) {
                        message.error(`特殊分佣梯度 ${i + 1} 的最小值必须小于最大值`);
                        return;
                    }
                    if (i > 0 && sortedTiers[i].min !== sortedTiers[i - 1].max) {
                        message.error(`特殊分佣梯度 ${i + 1} 的起始值必须等于上一个梯度的截止值`);
                        return;
                    }
                }
                if (sortedTiers[0].min !== 0) {
                    message.error('第一个梯度的起始值必须为 0');
                    return;
                }
            }

            message.loading({ content: '正在发起变更申请...', key: 'changing' })

            setTimeout(() => {
                const storedData = localStorage.getItem('channel_data')
                if (storedData && data) {
                    const channels: Channel[] = JSON.parse(storedData)
                    const updatedChannels = channels.map(c => {
                        if (c.id === data.id) {
                            return {
                                ...c,
                                commissionType: isSpecialMode ? values.commissionType : 'custom_ladder',
                                commissionRate: isSpecialMode && values.commissionType === 'fixed' ? `${values.commissionRate}%` : undefined,
                                commissionTiers: isSpecialMode ? (values.commissionType === 'custom_ladder' ? values.commissionTiers : undefined) : DEFAULT_SYSTEM_RULE.tiers,
                                ruleId: isSpecialMode ? undefined : DEFAULT_SYSTEM_RULE.id
                            }
                        }
                        return c
                    })
                    localStorage.setItem('channel_data', JSON.stringify(updatedChannels))
                    message.success({ content: '分佣配置变更成功', key: 'changing' })
                    setIsCommissionModalVisible(false)
                    fetchData()
                }
            }, 1000)
        } catch (error) {
            console.error('Validation Failed:', error)
        }
    }

    // 提交变更负责人
    const handleOwnerSubmit = async () => {
        try {
            const values = await ownerForm.validateFields()
            if (!data) return

            message.loading({ content: '正在变更负责人...', key: 'owner_changing' })

            setTimeout(() => {
                const storedData = localStorage.getItem('channel_data')
                if (storedData) {
                    const channels: Channel[] = JSON.parse(storedData)
                    const updatedChannels = channels.map(c => {
                        if (c.id === data.id) {
                            return { ...c, owner: values.newOwner }
                        }
                        return c
                    })
                    localStorage.setItem('channel_data', JSON.stringify(updatedChannels))
                    message.success({ content: `负责人已成功变更为：${values.newOwner}`, key: 'owner_changing' })
                    setIsOwnerModalVisible(false)
                    ownerForm.resetFields()
                    fetchData()
                }
            }, 800)
        } catch (error) {
            console.error('Validation Failed:', error)
        }
    }

    // 处理解约
    const handleTerminate = () => {
        if (!data) return

        // 1. 清算检查
        const reportingData = localStorage.getItem('reporting_data')
        if (reportingData) {
            const reportings = JSON.parse(reportingData)
            const activeReportings = reportings.filter((r: any) =>
                r.channelId === data.id &&
                ['pending', 'protected'].includes(r.status)
            )

            const unPaidReportings = reportings.filter((r: any) =>
                r.channelId === data.id &&
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

        setTerminateModalVisible(true)
    }

    // 提交解约
    const submitTerminate = async () => {
        try {
            const values = await terminateForm.validateFields()
            if (!data) return

            const storedData = localStorage.getItem('channel_data')
            if (storedData) {
                const channels: Channel[] = JSON.parse(storedData)
                const updatedChannels = channels.map(c => {
                    if (c.id === data.id) {
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


    // 提交业绩周期变更
    const handleCycleSubmit = async () => {
        try {
            const values = await cycleForm.validateFields()
            if (!data) return

            message.loading({ content: '正在调整业绩周期...', key: 'cycle_changing' })

            setTimeout(() => {
                const storedData = localStorage.getItem('channel_data')
                if (storedData) {
                    const channels: Channel[] = JSON.parse(storedData)
                    const updatedChannels = channels.map(c => {
                        if (c.id === data.id) {
                            return {
                                ...c,
                                startDate: values.startDate.format('YYYY-MM-DD'),
                                endDate: values.endDate.format('YYYY-MM-DD')
                            }
                        }
                        return c
                    })
                    localStorage.setItem('channel_data', JSON.stringify(updatedChannels))
                    message.success({ content: '业绩周期调整成功', key: 'cycle_changing' })
                    setIsCycleModalVisible(false)
                    fetchData()
                }
            }, 800)
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
                                {
                                    key: '1', label: '变更负责人', icon: <UserOutlined />, onClick: () => {
                                        ownerForm.setFieldsValue({ currentOwner: data?.owner })
                                        setIsOwnerModalVisible(true)
                                    }
                                },
                                {
                                    key: '2', label: '分佣配置变更', icon: <SafetyCertificateOutlined />, onClick: () => {
                                        if (data) {
                                            const isSpecial = data.ruleId !== DEFAULT_SYSTEM_RULE.id;
                                            setIsSpecialMode(isSpecial);
                                            commissionForm.setFieldsValue({
                                                commissionType: data.commissionType === 'fixed' ? 'fixed' : 'custom_ladder',
                                                commissionRate: data.commissionRate ? parseFloat(data.commissionRate) : undefined,
                                                commissionTiers: data.commissionTiers || (data.ruleId === DEFAULT_SYSTEM_RULE.id ? DEFAULT_SYSTEM_RULE.tiers : [])
                                            });
                                        }
                                        setIsCommissionModalVisible(true)
                                    }
                                },
                                {
                                    key: '3', label: '调整业绩周期', icon: <CalendarOutlined />, onClick: () => {
                                        if (data) {
                                            cycleForm.setFieldsValue({
                                                startDate: dayjs(data.startDate),
                                                endDate: dayjs(data.endDate)
                                            })
                                        }
                                        setIsCycleModalVisible(true)
                                    }
                                },
                                { type: 'divider' },
                                { key: '4', label: '解约', icon: <HistoryOutlined />, danger: true, onClick: handleTerminate, disabled: data?.status === 'terminated' },
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
                                                <Descriptions.Item label="渠道负责人">{data?.owner || '未分配'}</Descriptions.Item>
                                                <Descriptions.Item label="当前配置">
                                                    {data?.commissionTiers ? (
                                                        <Space direction="vertical" style={{ width: '100%' }} size={2}>
                                                            {data.commissionTiers.map((tier: any, idx: number) => (
                                                                <div key={idx} style={{ fontSize: 12 }}>
                                                                    {tier.min}万-{tier.max ? `${tier.max}万` : '以上'}：<Text strong style={{ color: '#ff5050' }}>{tier.rate}%</Text>
                                                                </div>
                                                            ))}
                                                        </Space>
                                                    ) : data?.commissionType === 'fixed' ? `${data.commissionRate || 10}%` :
                                                        data?.commissionType === 'custom_ladder' ? '系统标准阶梯' : '按协议约定'}
                                                </Descriptions.Item>
                                                <Descriptions.Item label="业绩周期">{`${data?.startDate} 至 ${data?.endDate}`}</Descriptions.Item>
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

            {/* 变更负责人弹窗 */}
            <Modal
                title="变更渠道负责人"
                open={isOwnerModalVisible}
                onOk={handleOwnerSubmit}
                onCancel={() => {
                    setIsOwnerModalVisible(false)
                    ownerForm.resetFields()
                }}
                destroyOnClose
            >
                <Form form={ownerForm} layout="vertical" style={{ marginTop: 16 }}>
                    <Form.Item name="currentOwner" label="当前负责人">
                        <Input disabled />
                    </Form.Item>
                    <Form.Item
                        name="newOwner"
                        label="拟变更负责人"
                        rules={[{ required: true, message: '请选择新负责人' }]}
                    >
                        <Select placeholder="请选择新的内部负责人">
                            <Option value="张三">张三 (销售一部)</Option>
                            <Option value="李四">李四 (销售二部)</Option>
                            <Option value="王五">王五 (渠道合作部)</Option>
                            <Option value="赵六">赵六 (大客户部)</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item
                        name="reason"
                        label="变更原因"
                        rules={[{ required: true, message: '请输入变更原因' }]}
                    >
                        <Input.TextArea placeholder="请输入变更原因，如：人员离职、业务调整等" rows={3} />
                    </Form.Item>
                </Form>
            </Modal>

            {/* 分佣配置变更弹窗 */}
            <Modal
                title="分佣配置变更申请"
                open={isCommissionModalVisible}
                onOk={handleCommissionSubmit}
                onCancel={() => setIsCommissionModalVisible(false)}
                width={700}
                destroyOnClose
            >
                <div style={{ marginBottom: 20, padding: '12px', background: '#fff7e6', border: '1px solid #ffe58f', borderRadius: 4 }}>
                    <Text type="warning">注意：修改分佣配置建议在合同签约周期开始前进行。变更后的配置将在审批通过后生效。</Text>
                </div>

                <Form form={commissionForm} layout="vertical">
                    {!isSpecialMode ? (
                        <div style={{
                            padding: '32px 24px',
                            textAlign: 'center',
                            background: '#f8f9fb',
                            borderRadius: 12,
                            border: '1px dashed #d9d9d9'
                        }}>
                            <CheckCircleFilled style={{ fontSize: 48, color: '#52c41a', marginBottom: 16 }} />
                            <Title level={4} style={{ marginBottom: 8 }}>影刀标准分佣方案</Title>

                            <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'center', gap: 12 }}>
                                <Tag icon={<InfoCircleOutlined />} color="blue" style={{ padding: '2px 10px', borderRadius: 4 }}>
                                    业绩累计周期：每个签约周期（1年内）
                                </Tag>
                                <Tag color="cyan" style={{ padding: '2px 10px', borderRadius: 4 }}>
                                    自动计算 实时生效
                                </Tag>
                            </div>

                            <div style={{
                                background: '#fff',
                                padding: '16px',
                                borderRadius: 8,
                                maxWidth: 500,
                                margin: '0 auto 24px',
                                textAlign: 'left',
                                border: '1px solid #f0f2f5'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, padding: '0 12px', opacity: 0.6 }}>
                                    <Text strong style={{ fontSize: 12 }}>签约年度累计业绩 (万)</Text>
                                    <Text strong style={{ fontSize: 12 }}>分佣比例 (%)</Text>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {DEFAULT_SYSTEM_RULE.tiers.map((tier, idx) => (
                                        <div key={idx} style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            padding: '10px 16px',
                                            background: '#fcfcfc',
                                            borderRadius: 6,
                                            border: '1px solid #f0f0f0'
                                        }}>
                                            <Text style={{ fontSize: 14 }}>{tier.min}万 {tier.max ? `- ${tier.max}万` : '以上'}</Text>
                                            <Text strong style={{ color: '#ff5050', fontSize: 16 }}>{tier.rate}%</Text>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <Button
                                type="link"
                                icon={<SettingOutlined />}
                                onClick={() => setIsSpecialMode(true)}
                                style={{ color: '#8c8c8c' }}
                            >
                                需要特殊配置？申请特殊分佣规则
                            </Button>
                        </div>
                    ) : (
                        <div style={{ background: '#fff', borderRadius: 8, border: '1px solid #f0f0f0', padding: 24 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                                <Space>
                                    <SettingOutlined style={{ color: '#ff5050' }} />
                                    <Title level={5} style={{ margin: 0 }}>特殊分佣方案配置</Title>
                                </Space>
                                <Button type="link" onClick={() => {
                                    setIsSpecialMode(false)
                                    commissionForm.setFieldsValue({
                                        commissionType: 'custom_ladder',
                                        commissionTiers: DEFAULT_SYSTEM_RULE.tiers
                                    })
                                }}>恢复标准规则</Button>
                            </div>

                            <Form.Item name="commissionType" label="分佣形式">
                                <Radio.Group>
                                    <Radio value="custom_ladder">阶梯分佣</Radio>
                                    <Radio value="fixed">固定分佣</Radio>
                                </Radio.Group>
                            </Form.Item>

                            <Form.Item noStyle shouldUpdate={(prev, curr) => prev.commissionType !== curr.commissionType}>
                                {({ getFieldValue }) => {
                                    const type = getFieldValue('commissionType')
                                    if (type === 'fixed') {
                                        return (
                                            <Form.Item name="commissionRate" label="固定分佣比例 (%)" rules={[{ required: true, message: '请输入比例' }]}>
                                                <InputNumber min={0} max={100} style={{ width: 200 }} suffix="%" />
                                            </Form.Item>
                                        )
                                    }
                                    return (
                                        <>
                                            <Divider dashed style={{ margin: '0 0 24px' }}>阶梯明细</Divider>
                                            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-start' }}>
                                                <Tag icon={<InfoCircleOutlined />} color="blue" style={{ padding: '2px 10px', borderRadius: 4 }}>
                                                    业绩累计周期：每个签约周期（1年内）
                                                </Tag>
                                            </div>
                                            <Form.List name="commissionTiers">
                                                {(fields, { add, remove }) => (
                                                    <>
                                                        {fields.map(({ key, name, ...restField }, index) => (
                                                            <Row key={key} gutter={16} align="middle" style={{ marginBottom: 12 }}>
                                                                <Col span={7}>
                                                                    <Form.Item
                                                                        {...restField}
                                                                        name={[name, 'min']}
                                                                        label={index === 0 ? "业绩下限 (万)" : ""}
                                                                        rules={[{ required: true }]}
                                                                    >
                                                                        <InputNumber style={{ width: '100%' }} disabled={index === 0} placeholder="起点" />
                                                                    </Form.Item>
                                                                </Col>
                                                                <Col span={1} style={{ textAlign: 'center', paddingTop: index === 0 ? 30 : 0 }}>至</Col>
                                                                <Col span={7}>
                                                                    <Form.Item
                                                                        {...restField}
                                                                        name={[name, 'max']}
                                                                        label={index === 0 ? "业绩上限 (万)" : ""}
                                                                    >
                                                                        <InputNumber style={{ width: '100%' }} placeholder="无上限" />
                                                                    </Form.Item>
                                                                </Col>
                                                                <Col span={6}>
                                                                    <Form.Item
                                                                        {...restField}
                                                                        name={[name, 'rate']}
                                                                        label={index === 0 ? "分佣比例 (%)" : ""}
                                                                        rules={[{ required: true }]}
                                                                    >
                                                                        <InputNumber style={{ width: '100%' }} min={0} max={100} />
                                                                    </Form.Item>
                                                                </Col>
                                                                <Col span={3} style={{ paddingTop: index === 0 ? 30 : 0 }}>
                                                                    {fields.length > 1 && (
                                                                        <Button type="text" danger icon={<DeleteOutlined />} onClick={() => remove(name)} />
                                                                    )}
                                                                </Col>
                                                            </Row>
                                                        ))}
                                                        <Form.Item>
                                                            <Button type="dashed" onClick={() => {
                                                                const tiers = commissionForm.getFieldValue('commissionTiers');
                                                                const lastTier = tiers[tiers.length - 1];
                                                                add({
                                                                    min: lastTier?.max || 0,
                                                                    max: lastTier?.max ? lastTier.max + 50 : null,
                                                                    rate: (lastTier?.rate || 0) + 5
                                                                });
                                                            }} block icon={<PlusOutlined />}>
                                                                添加梯度
                                                            </Button>
                                                        </Form.Item>
                                                    </>
                                                )}
                                            </Form.List>
                                        </>
                                    )
                                }}
                            </Form.Item>
                        </div>
                    )}
                </Form>
            </Modal>

            {/* 业绩周期变更弹窗 */}
            <Modal
                title="调整业绩周期"
                open={isCycleModalVisible}
                onOk={handleCycleSubmit}
                onCancel={() => setIsCycleModalVisible(false)}
                destroyOnClose
            >
                <div style={{ marginBottom: 20, padding: '12px', background: '#e6f7ff', border: '1px solid #91d5ff', borderRadius: 4 }}>
                    <Text type="secondary"><InfoCircleOutlined style={{ color: '#1890ff', marginRight: 8 }} />业绩周期通常为一年。设置开始日期后，系统将自动计算截止日期。</Text>
                </div>
                <Form form={cycleForm} layout="vertical">
                    <Form.Item
                        name="startDate"
                        label="业绩开始日期"
                        rules={[{ required: true, message: '请选择开始日期' }]}
                    >
                        <DatePicker
                            style={{ width: '100%' }}
                            onChange={(date) => {
                                if (date) {
                                    cycleForm.setFieldsValue({
                                        endDate: date.add(1, 'year').subtract(1, 'day')
                                    })
                                }
                            }}
                        />
                    </Form.Item>
                    <Form.Item
                        name="endDate"
                        label="业绩截止日期"
                        tooltip="自动计算：开始日期 + 1年"
                    >
                        <DatePicker style={{ width: '100%' }} disabled />
                    </Form.Item>
                </Form>
            </Modal>

            {/* 渠道解约弹窗 */}
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
                    正在为 <span style={{ fontWeight: 'bold' }}>{data?.companyName}</span> 发起解约流程。
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


export default ChannelDetail
