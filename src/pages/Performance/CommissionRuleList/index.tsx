import { FC, useState, useEffect } from 'react'
import dayjs from 'dayjs'
import {
    Table,
    Card,
    Typography,
    Button,
    Space,
    Tag,
    message,
    Modal
} from 'antd'
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    CheckOutlined,
    HistoryOutlined
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import type { CommissionRule } from '../../../types/commissionRule'
import ruleData from '../../../data/commission_rules.json'

const { Title } = Typography

/**
 * 分佣规则列表页面
 */
const CommissionRuleList: FC = () => {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [data, setData] = useState<CommissionRule[]>([])

    // 获取数据
    const fetchData = () => {
        setLoading(true)
        const storedData = localStorage.getItem('commission_rules')
        if (storedData) {
            setData(JSON.parse(storedData))
        } else {
            setData(ruleData as CommissionRule[])
            localStorage.setItem('commission_rules', JSON.stringify(ruleData))
        }
        setLoading(false)
    }

    useEffect(() => {
        fetchData()
    }, [])

    // 设置默认规则
    const handleSetDefault = (id: string) => {
        const newData = data.map(item => ({
            ...item,
            isDefault: item.id === id
        }))
        setData(newData)
        localStorage.setItem('commission_rules', JSON.stringify(newData))
        message.success('默认规则设置成功')
    }

    // 恢复历史预设 (原金银铜牌)
    const handleRestoreLegacy = () => {
        const legacyRule: CommissionRule = {
            id: `RULE_LEGACY_${Date.now().toString().slice(-4)}`,
            name: "历史预设规则 (原金银铜牌)",
            type: "阶梯分佣",
            status: "enabled",
            isDefault: false,
            tiers: [
                { min: 0, max: 10, rate: 5 },
                { min: 10, max: 50, rate: 8 },
                { min: 50, max: null, rate: 12 }
            ],
            creator: "系统",
            createTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
            description: "恢复自原系统内置的金银铜牌阶梯规则"
        }
        const newData = [...data, legacyRule]
        setData(newData)
        localStorage.setItem('commission_rules', JSON.stringify(newData))
        message.success('已恢复历史预设规则')
    }

    // 处理删除
    const handleDelete = (id: string) => {
        Modal.confirm({
            title: '确认删除该规则？',
            content: '删除后将无法在入驻申请中选择此规则，已关联的渠道不受影响。',
            onOk: () => {
                const newData = data.filter(item => item.id !== id)
                setData(newData)
                localStorage.setItem('commission_rules', JSON.stringify(newData))
                message.success('规则已删除')
            }
        })
    }

    const columns = [
        {
            title: '规则名称',
            dataIndex: 'name',
            key: 'name',
            fontWeight: 'bold',
            render: (text: string, record: CommissionRule) => (
                <Space>
                    {text}
                    {record.isDefault && <Tag color="gold" icon={<CheckOutlined />}>默认</Tag>}
                </Space>
            )
        },
        {
            title: '规则类型',
            dataIndex: 'type',
            key: 'type',
            render: (type: string) => <Tag color="blue">{type}</Tag>
        },
        {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => (
                <Tag color={status === 'enabled' ? 'success' : 'default'}>
                    {status === 'enabled' ? '启用中' : '已禁用'}
                </Tag>
            )
        },
        {
            title: '应用渠道数',
            dataIndex: 'channelCount',
            key: 'channelCount',
            render: (count: number) => count || 0
        },
        {
            title: '累计分佣业绩 (万)',
            dataIndex: 'accumulatedPerformance',
            key: 'accumulatedPerformance',
            render: (val: number) => val ? `¥${val.toFixed(2)}` : '¥0.00'
        },
        {
            title: '创建人',
            dataIndex: 'creator',
            key: 'creator'
        },
        {
            title: '配置时间',
            dataIndex: 'createTime',
            key: 'createTime'
        },
        {
            title: '操作',
            key: 'action',
            render: (_: any, record: CommissionRule) => (
                <Space size="middle">
                    <Button
                        type="link"
                        icon={<EditOutlined />}
                        onClick={() => navigate(`/performance/commission-rules/config/${record.id}`)}
                    >
                        编辑
                    </Button>
                    {!record.isDefault && (
                        <Button
                            type="link"
                            onClick={() => handleSetDefault(record.id)}
                        >
                            设为默认
                        </Button>
                    )}
                    <Button
                        type="link"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleDelete(record.id)}
                        disabled={record.isDefault}
                    >
                        删除
                    </Button>
                </Space>
            )
        }
    ]

    return (
        <div style={{ padding: 24 }}>
            <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Title level={4} style={{ margin: 0 }}>分佣规则管理</Title>
                <Space>
                    <Button
                        icon={<HistoryOutlined />}
                        onClick={handleRestoreLegacy}
                    >
                        恢复历史预设
                    </Button>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => navigate('/performance/commission-rules/config/new')}
                        style={{ background: '#ff5050', borderColor: '#ff5050' }}
                    >
                        配置新规则
                    </Button>
                </Space>
            </div>

            <Card>
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
            </Card>
        </div>
    )
}

export default CommissionRuleList
