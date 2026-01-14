import { FC, useState, useEffect } from 'react'
import {
    Card,
    Typography,
    Row,
    Col,
    Statistic,
    Table,
    Tag,
    Button,
    Space,
    message,
    Breadcrumb,
    Empty
} from 'antd'
import {
    SyncOutlined,
    ArrowLeftOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    ExclamationCircleOutlined
} from '@ant-design/icons'
import { useNavigate, useSearchParams } from 'react-router-dom'
import type { QualityCheckItem } from '../../../types/settlement'

const { Title, Text } = Typography

/**
 * 客户资源质量检查页
 */
const SettlementQualityCheck: FC = () => {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const settlementId = searchParams.get('id')

    const [loading, setLoading] = useState(false)
    const [results, setResults] = useState<QualityCheckItem[]>([])

    // 模拟执行质检任务
    const runQualityCheck = () => {
        setLoading(true)
        message.loading({ content: '正在执行工商校验与 CRM 冲突检查...', key: 'checking' })

        setTimeout(() => {
            const mockResults: QualityCheckItem[] = [
                { id: '1', customerName: '成都市某某某某贸易有限公司', legalPerson: '张三', gsCheckResult: 'pass', crmExists: false },
                { id: '2', customerName: '四川省宏达电子设备厂', legalPerson: '李四', gsCheckResult: 'pass', crmExists: true, crmId: 'CRM-20230045' },
                { id: '3', customerName: '成都九成商贸（已注销）', legalPerson: '王五', gsCheckResult: 'name_mismatch', crmExists: false },
                { id: '4', customerName: '某不明身份工作室', legalPerson: '赵六', gsCheckResult: 'query_failed', crmExists: false },
                { id: '5', customerName: '腾讯云计算（北京）有限公司', legalPerson: '马化腾', gsCheckResult: 'pass', crmExists: true, crmId: 'CRM-00000001' },
            ]
            setResults(mockResults)
            message.success({ content: '质检完成', key: 'checking' })
            setLoading(false)
        }, 2000)
    }

    useEffect(() => {
        if (settlementId) {
            runQualityCheck()
        }
    }, [settlementId])

    // 计算统计数据
    const stats = {
        total: results.length,
        pass: results.filter(i => i.gsCheckResult === 'pass').length,
        fail: results.filter(i => i.gsCheckResult === 'name_mismatch' || i.gsCheckResult === 'query_failed').length,
        crmExists: results.filter(i => i.crmExists).length,
        crmNew: results.filter(i => !i.crmExists).length,
    }

    const columns = [
        {
            title: '序号',
            dataIndex: 'id',
            key: 'id',
            width: 80
        },
        {
            title: '客户名称',
            dataIndex: 'customerName',
            key: 'customerName',
        },
        {
            title: '公司法人',
            dataIndex: 'legalPerson',
            key: 'legalPerson',
            width: 120
        },
        {
            title: '工商校验结果',
            dataIndex: 'gsCheckResult',
            key: 'gsCheckResult',
            width: 160,
            render: (res: string) => {
                if (res === 'pass') return <Tag icon={<CheckCircleOutlined />} color="success">通过</Tag>
                if (res === 'name_mismatch') return <Tag icon={<CloseCircleOutlined />} color="error">名称不符</Tag>
                return <Tag icon={<ExclamationCircleOutlined />} color="warning">查询失败</Tag>
            }
        },
        {
            title: 'CRM 存在状态',
            key: 'crmStatus',
            width: 180,
            render: (_: any, record: QualityCheckItem) => (
                record.crmExists ? (
                    <Tag color="warning">已存在 (ID: {record.crmId})</Tag>
                ) : (
                    <Tag color="success">不存在 (新客户)</Tag>
                )
            )
        }
    ]

    if (!settlementId) {
        return (
            <div style={{ padding: 24 }}>
                <Empty description="未提供申请单 ID" />
            </div>
        )
    }

    return (
        <div style={{ padding: 24 }}>
            <Breadcrumb style={{ marginBottom: 16 }}>
                <Breadcrumb.Item onClick={() => navigate('/settlement-list')}>
                    <span style={{ cursor: 'pointer' }}>入驻申请列表</span>
                </Breadcrumb.Item>
                <Breadcrumb.Item>客户资源质检</Breadcrumb.Item>
            </Breadcrumb>

            <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography.Title level={4} style={{ margin: 0 }}>
                    <Space>
                        <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} />
                        客户资源质检 - {settlementId}
                    </Space>
                </Typography.Title>
                <Button icon={<SyncOutlined />} onClick={runQualityCheck} loading={loading}>重新检查</Button>
            </div>

            {/* 汇总统计区 */}
            <Row gutter={16} style={{ marginBottom: 24 }}>
                <Col span={4.8} style={{ width: '20%' }}>
                    <Card size="small">
                        <Statistic title="提交客户数" value={stats.total} />
                    </Card>
                </Col>
                <Col span={4.8} style={{ width: '20%' }}>
                    <Card size="small">
                        <Statistic title="工商校验通过" value={stats.pass} valueStyle={{ color: '#52c41a' }} />
                    </Card>
                </Col>
                <Col span={4.8} style={{ width: '20%' }}>
                    <Card size="small">
                        <Statistic title="工商校验失败" value={stats.fail} valueStyle={{ color: '#ff4d4f' }} />
                    </Card>
                </Col>
                <Col span={4.8} style={{ width: '20%' }}>
                    <Card size="small">
                        <Statistic title="CRM 已存在" value={stats.crmExists} valueStyle={{ color: '#faad14' }} />
                    </Card>
                </Col>
                <Col span={4.8} style={{ width: '20%' }}>
                    <Card size="small">
                        <Statistic title="CRM 不存在" value={stats.crmNew} valueStyle={{ color: '#52c41a' }} />
                    </Card>
                </Col>
            </Row>

            {/* 客户明细列表 */}
            <Card title="客户明细质检结果">
                <Table
                    columns={columns}
                    dataSource={results}
                    rowKey="id"
                    loading={loading}
                    pagination={false}
                />

                <div style={{ marginTop: 24, background: '#fafafa', padding: 16, borderRadius: 8 }}>
                    <Title level={5}>质检结论参考说明</Title>
                    <ul>
                        <li><Text type="secondary">工商校验失败：说明渠道提交的客户名称可能不真实或有误，需要渠道重新确认。</Text></li>
                        <li><Text type="secondary">CRM 已存在：说明该客户已在公司客户库中，需评估渠道的增量价值。</Text></li>
                        <li><Text strong type="success">理想情况：工商校验全部通过 + CRM 不存在比例高 = 渠道掌握的是真实且有增量价值的客户资源。</Text></li>
                    </ul>
                </div>
            </Card>
        </div>
    )
}

export default SettlementQualityCheck
