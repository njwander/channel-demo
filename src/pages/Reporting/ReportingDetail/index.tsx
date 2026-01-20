import { FC, useState, useEffect } from 'react'
import {
    Card,
    Typography,
    Descriptions,
    Tag,
    Space,
    Button,
    Row,
    Col,
    Divider,
    Steps,
    Empty,
    Image,
    message
} from 'antd'
import {
    ArrowLeftOutlined,
    EditOutlined,
    FileImageOutlined,
    HistoryOutlined
} from '@ant-design/icons'
import { useNavigate, useParams } from 'react-router-dom'
import dayjs from 'dayjs'
import type {
    Reporting,
    ReportingStatus,
    FollowupStatus,
    OpportunityStage,
    OrderStatus
} from '../../../types/reporting'
import { RESPONSIVE_DESCRIPTIONS_COLUMN } from '../../../utils/descriptionsConfig'

const { Title, Text } = Typography

/**
 * 客户报备详情
 */
const ReportingDetail: FC = () => {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const [data, setData] = useState<Reporting | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        setLoading(true)
        const storedData = localStorage.getItem('reporting_data')
        if (storedData) {
            const list: Reporting[] = JSON.parse(storedData)
            const item = list.find(r => r.id === id)
            if (item) {
                setData(item)
            }
        }
        setLoading(false)
    }, [id])

    if (loading) return <div style={{ padding: 24 }}>加载中...</div>
    if (!data) return <div style={{ padding: 24 }}><Empty description="未找到报备记录" /></div>

    // 状态映射
    const statusMap: Record<ReportingStatus, { text: string; color: string }> = {
        pending: { text: '待审批', color: 'orange' },
        rejected: { text: '已驳回', color: 'red' },
        protected: { text: '保护期内', color: 'blue' },
        converted: { text: '已转化', color: 'green' },
        expired: { text: '已失效', color: 'default' },
        cancelled: { text: '已作废', color: 'default' }
    }

    const followupMap: Record<FollowupStatus, string> = {
        not_started: '未跟进',
        following: '跟进中',
        customer_associated: '关联客户'
    }

    const stageMap: Record<OpportunityStage, string> = {
        none: '无商机',
        developing: '商机中',
        closed: '已成单'
    }

    const orderMap: Record<OrderStatus, string> = {
        signed: '已签约',
        partially_paid: '已回款(部分)',
        fully_paid: '已回款(全部)'
    }

    return (
        <div style={{ padding: '0 24px 24px' }}>
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
                    <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/reporting-list')}>返回</Button>
                    <Title level={4} style={{ margin: 0 }}>报备详情: {data.customerName}</Title>
                    <Tag color={statusMap[data.status].color}>{statusMap[data.status].text}</Tag>
                </Space>
                <Space>
                    {data.status === 'rejected' && (
                        <Button type="primary" icon={<EditOutlined />} onClick={() => navigate('/reporting-new')}>
                            重新编辑
                        </Button>
                    )}
                </Space>
            </div>

            <Row gutter={24}>
                <Col span={18}>
                    {/* 报备执行信息 */}
                    <Card title="报备信息" style={{ marginBottom: 24 }}>
                        <Descriptions column={RESPONSIVE_DESCRIPTIONS_COLUMN}>
                            <Descriptions.Item label="报备编号">{data.id}</Descriptions.Item>
                            <Descriptions.Item label="负责人">{data.channelOwner}</Descriptions.Item>
                            <Descriptions.Item label="报备时间">{dayjs(data.reportingTime).format('YYYY-MM-DD HH:mm:ss')}</Descriptions.Item>
                            <Descriptions.Item label="报备状态">
                                <Tag color={statusMap[data.status].color}>{statusMap[data.status].text}</Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="保护到期日">{data.expiryDate || '--'}</Descriptions.Item>
                            <Descriptions.Item label="是否有效报备">
                                {data.isValid === undefined ? '--' : (data.isValid ? <Tag color="success">有效</Tag> : <Tag color="error">无效</Tag>)}
                            </Descriptions.Item>
                            {data.isValid === false && (
                                <Descriptions.Item label="判定无效原因" span={2}>
                                    <Text type="danger">{data.invalidReason || '未填写原因'}</Text>
                                </Descriptions.Item>
                            )}
                        </Descriptions>
                    </Card>

                    {/* 客户基本信息 */}
                    <Card title="客户基本信息" style={{ marginBottom: 24 }}>
                        <Descriptions column={RESPONSIVE_DESCRIPTIONS_COLUMN}>
                            <Descriptions.Item label="客户名称">{data.customerName}</Descriptions.Item>
                            <Descriptions.Item label="纳税人识别号">{data.taxId || '--'}</Descriptions.Item>
                            <Descriptions.Item label="所属地区">{`${data.province} / ${data.city}`}</Descriptions.Item>
                            <Descriptions.Item label="行业">{data.industry}</Descriptions.Item>
                            <Descriptions.Item label="企业规模">{data.enterpriseScale}</Descriptions.Item>
                        </Descriptions>
                    </Card>

                    {/* 联系人信息 */}
                    <Card title="联系人信息" style={{ marginBottom: 24 }}>
                        <Descriptions column={RESPONSIVE_DESCRIPTIONS_COLUMN}>
                            <Descriptions.Item label="联系人">{data.contactName}</Descriptions.Item>
                            <Descriptions.Item label="联系人岗位">{data.contactPosition}</Descriptions.Item>
                            <Descriptions.Item label="联系电话">{data.contactPhone}</Descriptions.Item>
                        </Descriptions>
                    </Card>

                    {/* 报备凭证 */}
                    <Card title="报备凭证" style={{ marginBottom: 24 }}>
                        <Typography.Paragraph type="secondary">
                            上传的报备凭证截图：
                        </Typography.Paragraph>
                        <Space wrap>
                            {data.voucherImages.map((img, index) => (
                                <div key={index} style={{ textAlign: 'center' }}>
                                    <Image
                                        width={200}
                                        src="https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png" // 演示使用公网图片
                                        fallback="/placeholder.png"
                                    />
                                    <div style={{ marginTop: 4 }}><Text style={{ fontSize: '12px' }}>凭证 {index + 1}</Text></div>
                                </div>
                            ))}
                        </Space>
                    </Card>

                    {/* 商机与同步信息 */}
                    <Card title="商机与流程同步" style={{ marginBottom: 24 }}>
                        <Divider orientation="left">CRM 同步信息</Divider>
                        <Descriptions column={RESPONSIVE_DESCRIPTIONS_COLUMN}>
                            <Descriptions.Item label="CRM 负责人">{data.crmOwner || '未关联'}</Descriptions.Item>
                            <Descriptions.Item label="跟进状态">{followupMap[data.followupStatus]}</Descriptions.Item>
                            <Descriptions.Item label="商机阶段">{stageMap[data.opportunityStage]}</Descriptions.Item>
                        </Descriptions>

                        <Divider orientation="left">OMS 订单同步信息</Divider>
                        <Descriptions column={RESPONSIVE_DESCRIPTIONS_COLUMN}>
                            <Descriptions.Item label="成交状态">{data.orderStatus ? orderMap[data.orderStatus] : '未成单'}</Descriptions.Item>
                            <Descriptions.Item label="签约金额">{data.contractAmount !== undefined ? `${data.contractAmount} 万元` : '--'}</Descriptions.Item>
                            <Descriptions.Item label="已回款金额">{data.paidAmount !== undefined ? `${data.paidAmount} 万元` : '--'}</Descriptions.Item>
                        </Descriptions>

                        {data.opportunityDesc && (
                            <>
                                <Divider orientation="left">商机描述</Divider>
                                <Typography.Paragraph>{data.opportunityDesc}</Typography.Paragraph>
                            </>
                        )}
                    </Card>
                </Col>

                <Col span={6}>
                    {/* 渠道信息卡片 */}
                    <Card title="渠道来源" style={{ marginBottom: 24 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <div>
                                <Text type="secondary">报备渠道：</Text>
                                <div><Text strong>{data.channelName}</Text></div>
                            </div>
                        </div>
                    </Card>

                    {/* 审批记录/流程动态 */}
                    <Card title="流程状态">
                        <Steps
                            direction="vertical"
                            size="small"
                            current={data.status === 'pending' ? 0 : (data.status === 'rejected' ? 1 : 2)}
                            items={[
                                {
                                    title: '提交报备',
                                    description: `由 ${data.channelOwner} 提交于 ${dayjs(data.reportingTime).format('MM-DD HH:mm')}`,
                                    status: 'finish'
                                },
                                {
                                    title: '中台审批',
                                    description: data.status === 'pending' ? '等待审批中' : (data.status === 'rejected' ? '审批被驳回：凭证信息不全' : '审批已通过'),
                                    status: data.status === 'pending' ? 'process' : (data.status === 'rejected' ? 'error' : 'finish')
                                },
                                {
                                    title: '报备生效',
                                    description: data.status === 'protected' ? '进入 90 天保护期' : (data.status === 'converted' ? '已成功转化' : '--'),
                                    status: (data.status === 'protected' || data.status === 'converted') ? 'finish' : 'wait'
                                }
                            ]}
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    )
}

export default ReportingDetail
