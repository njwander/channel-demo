import { FC, useState, useEffect } from 'react'
import {
    Card,
    Typography,
    Row,
    Col,
    Descriptions,
    Steps,
    Tag,
    Button,
    Space,
    Table,
    Statistic,
    message,
    Modal,
    Upload,
    Divider,
    Result,
    Alert
} from 'antd'
import {
    SyncOutlined,
    ArrowLeftOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    ExclamationCircleOutlined,
    DownloadOutlined,
    UploadOutlined,
    GlobalOutlined,
    CheckOutlined,
    CloseOutlined,
    DeleteOutlined,
    FileTextOutlined,
    FileWordOutlined,
    EyeOutlined
} from '@ant-design/icons'
import { useNavigate, useParams } from 'react-router-dom'
import dayjs from 'dayjs'
import type { SettlementApplication, QualityCheckItem, SettlementStatus } from '../../../types/settlement'

const { Title, Text, Paragraph } = Typography

/**
 * 入驻申请详情页
 */
const SettlementDetail: FC = () => {
    const navigate = useNavigate()
    const { id } = useParams<{ id: string }>()

    const [loading, setLoading] = useState(false)
    const [data, setData] = useState<SettlementApplication | null>(null)
    const [qcLoading, setQcLoading] = useState(false)
    const [qcResults, setQcResults] = useState<QualityCheckItem[]>([])

    // 获取数据
    const fetchData = () => {
        setLoading(true)
        const storedData = localStorage.getItem('settlement_data')
        if (storedData) {
            const allRecords: SettlementApplication[] = JSON.parse(storedData)
            const record = allRecords.find(r => r.id === id)
            if (record) {
                setData(record)
                if (record.qualityCheckResults) {
                    setQcResults(record.qualityCheckResults)
                }
            }
        }
        setLoading(false)
    }

    useEffect(() => {
        fetchData()
    }, [id])

    // 执行质检逻辑
    const runQualityCheck = () => {
        setQcLoading(true)
        message.loading({ content: '正在执行工商校验与 CRM 冲突检查...', key: 'checking' })

        setTimeout(() => {
            const mockResults: QualityCheckItem[] = [
                { id: '1', customerName: '成都市某某某某贸易有限公司', legalPerson: '张三', gsCheckResult: 'pass', crmExists: false },
                { id: '2', customerName: '四川省宏达电子设备厂', legalPerson: '李四', gsCheckResult: 'pass', crmExists: true, crmId: 'CRM-20230045' },
                { id: '3', customerName: '成都九成商贸（已注销）', legalPerson: '王五', gsCheckResult: 'name_mismatch', crmExists: false },
                { id: '4', customerName: '某不明身份工作室', legalPerson: '赵六', gsCheckResult: 'query_failed', crmExists: false },
                { id: '5', customerName: '腾讯云计算（北京）有限公司', legalPerson: '马化腾', gsCheckResult: 'pass', crmExists: true, crmId: 'CRM-00000001' },
            ]
            setQcResults(mockResults)

            // 同步回 localStorage
            const storedData = localStorage.getItem('settlement_data')
            if (storedData) {
                const allRecords: SettlementApplication[] = JSON.parse(storedData)
                const index = allRecords.findIndex(r => r.id === id)
                if (index > -1) {
                    allRecords[index].qualityCheckResults = mockResults
                    localStorage.setItem('settlement_data', JSON.stringify(allRecords))
                }
            }

            message.success({ content: '质检完成', key: 'checking' })
            setQcLoading(false)
        }, 1500)
    }

    // 处理审批
    const handleAudit = (status: SettlementStatus) => {
        Modal.confirm({
            title: status === 'approved' ? '确认通过审批？' : '确认驳回申请？',
            content: status === 'approved' ? '通过后将进入待签约阶段。' : '请输入驳回理由：',
            okText: '确定',
            cancelText: '取消',
            onOk: () => {
                const storedData = localStorage.getItem('settlement_data')
                if (storedData) {
                    const allRecords: SettlementApplication[] = JSON.parse(storedData)
                    const index = allRecords.findIndex(r => r.id === id)
                    if (index > -1) {
                        allRecords[index].auditStatus = status
                        if (status === 'approved') {
                            allRecords[index].approvalDate = dayjs().format('YYYY-MM-DD')
                            // 初始化合同状态，标准合同不需要额外审批
                            allRecords[index].contractType = allRecords[index].contractType || 'standard'
                            allRecords[index].contractAuditStatus = allRecords[index].contractType === 'standard' ? 'approved' : 'pending'
                        }
                        localStorage.setItem('settlement_data', JSON.stringify(allRecords))
                        setData({ ...allRecords[index] })
                        message.success(status === 'approved' ? '业务审批已通过，进入待签约阶段' : '申请已驳回')
                    }
                }
            }
        })
    }

    // 处理签约跳转
    const handleGoToSigning = () => {
        window.open('https://example.com/signing-platform', '_blank')
    }

    // 处理合同上传
    const handleContractUpload = (file: any) => {
        message.loading({ content: '正在上传...', key: 'upload' })
        setTimeout(() => {
            const storedData = localStorage.getItem('settlement_data')
            if (storedData) {
                const allRecords: SettlementApplication[] = JSON.parse(storedData)
                const index = allRecords.findIndex(r => r.id === id)
                if (index > -1) {
                    allRecords[index].contractType = 'non-standard'
                    allRecords[index].customContractUrl = `/contracts/custom_${file.name}`
                    allRecords[index].contractAuditStatus = 'pending' // 重置为待提交
                    localStorage.setItem('settlement_data', JSON.stringify(allRecords))
                    setData({ ...allRecords[index] })
                    message.success({ content: '非标合同文件已就绪，请提交审批', key: 'upload' })
                }
            }
        }, 800)
        return false
    }

    // 提交飞书审批
    const handleSubmitContractAudit = () => {
        setLoading(true)
        message.loading({ content: '正在发起飞书审批流...', key: 'feishu' })
        setTimeout(() => {
            const storedData = localStorage.getItem('settlement_data')
            if (storedData) {
                const allRecords: SettlementApplication[] = JSON.parse(storedData)
                const index = allRecords.findIndex(r => r.id === id)
                if (index > -1) {
                    allRecords[index].contractAuditStatus = 'approving'
                    localStorage.setItem('settlement_data', JSON.stringify(allRecords))
                    setData({ ...allRecords[index] })
                    message.success({ content: '飞书审批发起成功，流水号：FS_2026_001', key: 'feishu' })
                }
            }
            setLoading(false)
        }, 1200)
    }

    // 模拟飞书回调（仅用于演示）
    const simulateFeishuCallback = (isPassed: boolean) => {
        const storedData = localStorage.getItem('settlement_data')
        if (storedData) {
            const allRecords: SettlementApplication[] = JSON.parse(storedData)
            const index = allRecords.findIndex(r => r.id === id)
            if (index > -1) {
                allRecords[index].contractAuditStatus = isPassed ? 'approved' : 'rejected'
                localStorage.setItem('settlement_data', JSON.stringify(allRecords))
                setData({ ...allRecords[index] })
                message.info(isPassed ? '收到飞书回调：合同审批通过' : '收到飞书回调：合同审批驳回')
            }
        }
    }

    // 移除非标合同，恢复标准
    const handleRemoveCustomContract = () => {
        Modal.confirm({
            title: '确认移除非标合同？',
            content: '移除后将恢复使用系统默认的标准合同模板。',
            onOk: () => {
                const storedData = localStorage.getItem('settlement_data')
                if (storedData) {
                    const allRecords: SettlementApplication[] = JSON.parse(storedData)
                    const index = allRecords.findIndex(r => r.id === id)
                    if (index > -1) {
                        allRecords[index].contractType = 'standard'
                        allRecords[index].customContractUrl = undefined
                        allRecords[index].contractAuditStatus = undefined
                        localStorage.setItem('settlement_data', JSON.stringify(allRecords))
                        setData({ ...allRecords[index] })
                        message.success('已恢复为标准合同')
                    }
                }
            }
        })
    }

    // 处理归档
    const handleArchive = () => {
        Modal.confirm({
            title: '确认完成签约并归档？',
            content: '归档后将正式开通渠道权限。',
            onOk: () => {
                const storedData = localStorage.getItem('settlement_data')
                if (storedData) {
                    const allRecords: SettlementApplication[] = JSON.parse(storedData)
                    const index = allRecords.findIndex(r => r.id === id)
                    if (index > -1) {
                        allRecords[index].auditStatus = 'signed'
                        localStorage.setItem('settlement_data', JSON.stringify(allRecords))
                        setData({ ...allRecords[index] })
                        message.success('归档成功')
                    }
                }
            }
        })
    }

    if (!data) {
        return <div style={{ padding: 40 }}><Result status="404" title="未找到申请记录" /></div>
    }

    // 状态步骤映射
    const statusMap: Record<SettlementStatus, number> = {
        'pending': 0,
        'approved': 1,
        'signed': 2,
        'rejected': 0
    }

    const stats = {
        total: qcResults.length,
        fail: qcResults.filter(i => i.gsCheckResult !== 'pass').length,
        crmExists: qcResults.filter(i => i.crmExists).length,
    }

    const qcColumns = [
        { title: '客户名称', dataIndex: 'customerName', key: 'customerName' },
        {
            title: '工商校验结果',
            dataIndex: 'gsCheckResult',
            key: 'gsCheckResult',
            render: (res: string) => {
                if (res === 'pass') return <Tag icon={<CheckCircleOutlined />} color="success">通过</Tag>
                if (res === 'name_mismatch') return <Tag icon={<CloseCircleOutlined />} color="error">名称不符</Tag>
                return <Tag icon={<ExclamationCircleOutlined />} color="warning">查询失败</Tag>
            }
        },
        {
            title: 'CRM查重',
            key: 'crmStatus',
            render: (_: any, record: QualityCheckItem) => (
                record.crmExists ? <Tag color="warning">已有客户</Tag> : <Tag color="success">新客户</Tag>
            )
        }
    ]

    return (
        <div style={{ padding: '0 24px 24px' }}>
            {/* 头部 */}
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
                    <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/settlement-list')}>返回列表</Button>
                    <Title level={4} style={{ margin: 0 }}>入驻申请详情 - {data.companyName}</Title>
                    {data.auditStatus === 'rejected' && <Tag color="error">已驳回</Tag>}
                    {data.auditStatus === 'signed' && <Tag color="success">已入驻</Tag>}
                </Space>
                <Space>
                    {data.auditStatus === 'pending' && (
                        <>
                            <Button danger icon={<CloseOutlined />} onClick={() => handleAudit('rejected')}>业务驳回</Button>
                            <Button type="primary" icon={<CheckOutlined />} onClick={() => handleAudit('approved')} style={{ background: '#52c41a', borderColor: '#52c41a' }}>业务通过</Button>
                        </>
                    )}
                    {data.auditStatus === 'approved' && (
                        <>
                            {(data.contractType === 'standard' || data.contractAuditStatus === 'approved') ? (
                                <Button icon={<GlobalOutlined />} onClick={handleGoToSigning} type="primary" size="large">前往签约平台</Button>
                            ) : (
                                <Tag color="warning" style={{ padding: '4px 12px' }}>合同待审批通过后可签约</Tag>
                            )}
                        </>
                    )}
                </Space>
            </div>

            <Row gutter={24} style={{ marginTop: 20 }}>
                <Col span={24}>
                    <Card style={{ marginBottom: 24 }}>
                        <Steps
                            current={statusMap[data.auditStatus]}
                            status={data.auditStatus === 'rejected' ? 'error' : 'process'}
                            items={[
                                { title: '待审批', description: '提交于 ' + data.applyTime },
                                { title: '待签约', description: data.auditStatus === 'pending' ? '业务审核中' : (data.approvalDate ? '通过于 ' + data.approvalDate : '审核完成') },
                                { title: '已入驻', description: data.auditStatus === 'signed' ? '合作中' : '签署中' }
                            ]}
                        />
                    </Card>
                </Col>

                <Col span={16}>
                    {/* 基础信息 */}
                    <Card title="基本资料" style={{ marginBottom: 24 }}>
                        <Descriptions column={2}>
                            <Descriptions.Item label="公司全称">{data.companyName}</Descriptions.Item>
                            <Descriptions.Item label="统一社会信用代码">{data.socialCreditCode || '-'}</Descriptions.Item>
                            <Descriptions.Item label="所在城市">{data.city}</Descriptions.Item>
                            <Descriptions.Item label="详细地址">{data.detailedAddress || '-'}</Descriptions.Item>
                            <Descriptions.Item label="联系人">{data.contactName}</Descriptions.Item>
                            <Descriptions.Item label="联系电话">{data.contactPhone}</Descriptions.Item>
                            <Descriptions.Item label="联系邮箱">{data.contactEmail || '-'}</Descriptions.Item>
                            <Descriptions.Item label="联系人职位">{data.contactPosition}</Descriptions.Item>
                        </Descriptions>
                    </Card>

                    {/* 质检区 */}
                    <Card
                        title="客户资源质检"
                        extra={<Button size="small" icon={<SyncOutlined />} onClick={runQualityCheck} loading={qcLoading}>重新检查</Button>}
                        style={{ marginBottom: 24 }}
                    >
                        <Row gutter={16} style={{ marginBottom: 16 }}>
                            <Col span={8}><Statistic title="提交客户数" value={stats.total} /></Col>
                            <Col span={8}><Statistic title="工商校验失败" value={stats.fail} valueStyle={{ color: '#cf1322' }} /></Col>
                            <Col span={8}><Statistic title="CRM 已存在" value={stats.crmExists} valueStyle={{ color: '#d48806' }} /></Col>
                        </Row>
                        <Table
                            size="small"
                            columns={qcColumns}
                            dataSource={qcResults}
                            rowKey="id"
                            pagination={false}
                            loading={qcLoading}
                        />
                    </Card>
                </Col>

                <Col span={8}>
                    {/* 分佣配置 */}
                    <Card title="分佣配置" style={{ marginBottom: 24 }}>
                        <Descriptions column={1}>
                            <Descriptions.Item label="分佣类型">{data.commissionType}</Descriptions.Item>
                            {data.commissionRate && (
                                <Descriptions.Item label="固定分佣比例">{data.commissionRate}%</Descriptions.Item>
                            )}
                            {data.commissionDescription && (
                                <Descriptions.Item label="特殊说明">{data.commissionDescription}</Descriptions.Item>
                            )}
                            {data.ruleId && (
                                <Descriptions.Item label="阶梯规则 ID">{data.ruleId}</Descriptions.Item>
                            )}
                        </Descriptions>
                        {data.ruleId && (
                            <div style={{ marginTop: 8, padding: 8, background: '#fafafa', fontSize: 12 }}>
                                提示：详情查阅对应的分佣规则库
                            </div>
                        )}
                    </Card>

                    {/* 合同管理 */}
                    <Card
                        title="合同管理"
                        extra={
                            <Tag color={data.contractType === 'non-standard' ? 'orange' : 'blue'}>
                                {data.contractType === 'non-standard' ? '非标合同' : '标准合同'}
                            </Tag>
                        }
                    >
                        <div style={{ padding: '8px 0' }}>
                            <Space direction="vertical" style={{ width: '100%' }} size="middle">
                                <div style={{ border: '1px solid #f0f0f0', padding: 12, borderRadius: 4, background: '#fafafa' }}>
                                    <Space align="start">
                                        {data.contractType === 'non-standard' ? <FileTextOutlined style={{ fontSize: 24, color: '#fa8c16' }} /> : <FileWordOutlined style={{ fontSize: 24, color: '#1890ff' }} />}
                                        <div style={{ flex: 1 }}>
                                            <Text strong>{data.contractType === 'non-standard' ? data.customContractUrl?.split('/').pop() : '标准入驻合作协议.docx'}</Text><br />
                                            {data.contractType === 'non-standard' ? (
                                                <Space style={{ marginTop: 4 }}>
                                                    {data.contractAuditStatus === 'pending' && <Tag color="default">待提交审批</Tag>}
                                                    {data.contractAuditStatus === 'approving' && <Tag icon={<SyncOutlined spin />} color="processing">飞书审批中</Tag>}
                                                    {data.contractAuditStatus === 'approved' && <Tag icon={<CheckCircleOutlined />} color="success">审批已通过</Tag>}
                                                    {data.contractAuditStatus === 'rejected' && <Tag icon={<CloseCircleOutlined />} color="error">审批被驳回</Tag>}
                                                </Space>
                                            ) : (
                                                <Text type="secondary" style={{ fontSize: 12 }}>标准合同</Text>
                                            )}
                                        </div>
                                    </Space>
                                    {data.contractType === 'non-standard' && data.contractAuditStatus !== 'approving' && (
                                        <div style={{ textAlign: 'right', marginTop: -20 }}>
                                            <Button type="text" danger icon={<DeleteOutlined />} onClick={handleRemoveCustomContract} />
                                        </div>
                                    )}
                                </div>

                                <Space wrap>
                                    {data.contractType !== 'non-standard' && (
                                        <Button icon={<DownloadOutlined />}>下载标准模板 (docx)</Button>
                                    )}
                                    <Button icon={<EyeOutlined />}>预览</Button>
                                </Space>

                                <Divider style={{ margin: '4px 0' }} />

                                {data.contractType === 'non-standard' && data.contractAuditStatus === 'pending' && (
                                    <Button type="primary" block onClick={handleSubmitContractAudit}>提交合同审批 (飞书)</Button>
                                )}

                                {data.contractType === 'non-standard' && data.contractAuditStatus === 'rejected' && (
                                    <Space direction="vertical" style={{ width: '100%' }}>
                                        <Alert message="驳回理由：合同条款需调整" type="error" showIcon style={{ marginBottom: 8 }} />
                                        <Button icon={<SyncOutlined />} block onClick={handleSubmitContractAudit}>重新提交审批</Button>
                                    </Space>
                                )}

                                {data.contractType === 'non-standard' && data.contractAuditStatus === 'approving' && (
                                    <Space direction="vertical" style={{ width: '100%' }}>
                                        <Button block disabled>飞书审批流转中 (锁定修改)</Button>
                                        <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                                            <Button size="small" onClick={() => simulateFeishuCallback(true)}>模拟通过</Button>
                                            <Button size="small" onClick={() => simulateFeishuCallback(false)}>模拟驳回</Button>
                                        </div>
                                    </Space>
                                )}

                                {(!data.contractAuditStatus || data.contractAuditStatus === 'pending' || data.contractAuditStatus === 'rejected') && (
                                    <Upload showUploadList={false} beforeUpload={handleContractUpload}>
                                        <Button icon={<UploadOutlined />} block type={data.contractType === 'non-standard' ? 'default' : 'dashed'}>
                                            {data.contractType === 'non-standard' ? '更换非标合同' : '上传非标合同'}
                                        </Button>
                                    </Upload>
                                )}

                                <Paragraph type="secondary" style={{ fontSize: 12, marginTop: 4 }}>
                                    {data.contractType === 'non-standard'
                                        ? '非标合同需通过飞书法务审批后方可发起签约。'
                                        : '标准合同可直接发起签约，无需额外审批。'
                                    }
                                </Paragraph>
                            </Space>
                        </div>
                    </Card>
                </Col>
            </Row>
        </div>
    )
}

export default SettlementDetail
