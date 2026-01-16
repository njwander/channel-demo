import { FC, useState } from 'react'
import {
    Form,
    Input,
    Button,
    Card,
    Typography,
    Space,
    Select,
    Row,
    Col,
    DatePicker,
    Upload,
    message,
    Modal,
    Divider,
    InputNumber,
    Cascader,
    Alert,
    Tooltip
} from 'antd'
import {
    ArrowLeftOutlined,
    SaveOutlined,
    UploadOutlined,
    InfoCircleOutlined
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import type { Reporting } from '../../../types/reporting'

const { Title, Text } = Typography
const { Option } = Select
const { TextArea } = Input

/**
 * 新建客户报备
 */
const ReportingNew: FC = () => {
    const navigate = useNavigate()
    const [form] = Form.useForm()
    const [submitting, setSubmitting] = useState(false)
    const [checking, setChecking] = useState(false)

    const [verifying, setVerifying] = useState(false)
    const [isSourceChange, setIsSourceChange] = useState(false)

    // 校验工商信息按钮逻辑
    const handleVerify = async () => {
        try {
            const customerName = form.getFieldValue('customerName')
            if (!customerName) {
                message.warning('请先输入客户名称')
                return
            }

            setVerifying(true)
            message.loading({ content: '正在调用工商接口校验...', key: 'verify' })

            // 模拟接口调用延迟
            setTimeout(() => {
                if (customerName.toLowerCase() === 'invalid co') {
                    message.error({ content: '未查询到该企业，请核实客户名称', key: 'verify' })
                    setVerifying(false)
                    return
                }

                // 模拟获取到的工商数据
                const mockData = {
                    taxId: `91${Math.floor(Math.random() * 10000000000000000).toString().padStart(16, '0')}`,
                    area: ['四川省', '成都市'],
                    industry: '制造业',
                    enterpriseScale: '51-200人'
                }

                form.setFieldsValue(mockData)
                message.success({ content: '工商信息校验通过，已自动填充', key: 'verify' })
                setVerifying(false)
            }, 1000)
        } catch (error) {
            console.error('Verify Failed:', error)
            setVerifying(false)
        }
    }

    // 提交时的逻辑校验 (基于新 PRD 流程)
    const validateCustomer = async (_: any, value: string) => {
        if (!value) return Promise.resolve()

        // 1. 已被其他渠道报备且保护期内
        if (value.toLowerCase().includes('duplicate')) {
            return Promise.reject(new Error('该客户已被其他渠道报备，保护期至 2026-05-20'))
        }

        // 2. 属于直销保护
        if (value.toLowerCase().includes('protect')) {
            return Promise.reject(new Error('该客户属于直销保护客户'))
        }

        return Promise.resolve()
    }

    // 处理提交
    const handleSubmit = async () => {
        try {
            const values = await form.validateFields()
            setChecking(true)

            // 模拟 CRM 查重逻辑
            message.loading({ content: '正在进行 CRM 查重...', key: 'reporting_submit' })

            setTimeout(() => {
                // 3. CRM 已存在且来源非渠道报备 -> 引导走来源更改
                if (values.customerName.toLowerCase().includes('exists') && !isSourceChange) {
                    message.destroy('reporting_submit')
                    Modal.confirm({
                        title: '客户已存在',
                        content: `该客户在 CRM 中已存在（负责人：${values.customerName.includes('inactive') ? '已失效，可重新报备' : '张三'}），需走“来源更改”流程。是否继续？`,
                        okText: '确认走来源更改',
                        cancelText: '取消',
                        onOk: () => {
                            setIsSourceChange(true)
                            setChecking(false)
                            message.info('请补充 KP 信息和对接推进截图后重新提交')
                        },
                        onCancel: () => setChecking(false)
                    })
                    return
                }

                setSubmitting(true)
                message.loading({ content: '正在提交审批...', key: 'reporting_submit' })

                setTimeout(() => {
                    // 生成报备编号: BB + yyyyMMdd + 4位流水
                    const todayStr = dayjs().format('YYYYMMDD')
                    const storedData = localStorage.getItem('reporting_data')
                    const allRecords: Reporting[] = storedData ? JSON.parse(storedData) : []

                    const todayRecords = allRecords.filter(r => r.id.startsWith(`BB${todayStr}`))
                    let nextSeq = 1
                    if (todayRecords.length > 0) {
                        const maxSeq = Math.max(...todayRecords.map(r => parseInt(r.id.slice(-4))))
                        nextSeq = maxSeq + 1
                    }
                    const reportingId = `BB${todayStr}${nextSeq.toString().padStart(4, '0')}`

                    // 构造新报备数据
                    const newReporting: Reporting = {
                        id: reportingId,
                        customerName: values.customerName,
                        channelId: 'CH2024001',
                        channelName: '上海某某科技有限公司',
                        channelOwner: '张三',
                        taxId: values.taxId,
                        reportingTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
                        status: 'pending',
                        followupStatus: 'not_started',
                        opportunityStage: 'none',
                        province: values.area[0],
                        city: values.area[1],
                        industry: values.industry,
                        enterpriseScale: values.enterpriseScale,
                        contactName: values.contactName,
                        contactPosition: values.contactPosition,
                        contactPhone: values.contactPhone,
                        voucherImages: ['/temp/voucher_new.png'],
                        expectedAmount: values.expectedAmount,
                        expectedDate: values.expectedDate?.format('YYYY-MM-DD'),
                        opportunityDesc: values.opportunityDesc
                    }

                    // 保存到 localStorage
                    localStorage.setItem('reporting_data', JSON.stringify([newReporting, ...allRecords]))

                    message.success({ content: isSourceChange ? '来源更改申请已提交' : '报备提交成功，等待审批', key: 'reporting_submit' })
                    setSubmitting(false)
                    setChecking(false)
                    setTimeout(() => navigate('/reporting-list'), 1000)
                }, 1000)
            }, 800)

        } catch (error) {
            console.error('Validate Failed:', error)
            setSubmitting(false)
            setChecking(false)
        }
    }

    const handleCancel = () => {
        Modal.confirm({
            title: '确定放弃编辑？',
            content: '未保存内容将丢失',
            okText: '确定',
            cancelText: '取消',
            onOk: () => navigate('/reporting-list')
        })
    }

    return (
        <div style={{ padding: '0 24px 24px' }}>
            {/* 顶部工具栏 */}
            <div style={{
                padding: '16px 0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                position: 'sticky',
                top: 0,
                zIndex: 10,
                background: '#f5f5f5'
            }}>
                <Space size="middle">
                    <Button icon={<ArrowLeftOutlined />} onClick={handleCancel}>返回</Button>
                    <Title level={4} style={{ margin: 0 }}>新建客户报备</Title>
                </Space>
                <Button
                    type="primary"
                    icon={<SaveOutlined />}
                    onClick={handleSubmit}
                    loading={submitting || checking}
                    style={{ background: '#ff5050', borderColor: '#ff5050' }}
                >
                    提交报备
                </Button>
            </div>

            <Form
                form={form}
                layout="vertical"
                initialValues={{ industry: '制造业', enterpriseScale: '1-50人' }}
            >
                {isSourceChange && (
                    <Alert
                        message="来源更改模式"
                        description="该客户已在 CRM 中存在，请确保下方上传了最准确的报备凭证和对接推进截图。"
                        type="info"
                        showIcon
                        style={{ marginBottom: 24 }}
                    />
                )}

                {/* 客户信息 */}
                <Card title="客户信息" style={{ marginBottom: 24 }}>
                    <Row gutter={24}>
                        <Col span={12}>
                            <Form.Item
                                name="customerName"
                                label="客户名称"
                                validateTrigger="onBlur"
                                rules={[
                                    { required: true, message: '请填写客户公司全称' },
                                    { validator: validateCustomer }
                                ]}
                            >
                                <Input
                                    placeholder="请输入客户公司全称"
                                    suffix={
                                        <Button
                                            type="link"
                                            size="small"
                                            onClick={handleVerify}
                                            loading={verifying}
                                        >
                                            校验工商信息
                                        </Button>
                                    }
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="taxId"
                                label="纳税人识别号"
                                rules={[{ required: true, message: '请填写纳税人识别号' }, { len: 18, message: '识别号需为 18 位' }]}
                            >
                                <Input placeholder="18 位统一社会信用代码" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="area" label="省份/城市" rules={[{ required: true, message: '请选择地区' }]}>
                                <Cascader
                                    options={[
                                        { value: '浙江省', label: '浙江省', children: [{ value: '杭州市', label: '杭州市' }] },
                                        { value: '四川省', label: '四川省', children: [{ value: '成都市', label: '成都市' }] },
                                        { value: '重庆市', label: '重庆市', children: [{ value: '重庆市', label: '重庆市' }] }
                                    ]}
                                    placeholder="请选择省市"
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="industry" label="一级行业" rules={[{ required: true }]}>
                                <Select placeholder="请选择">
                                    <Option value="制造业">制造业</Option>
                                    <Option value="零售业">零售业</Option>
                                    <Option value="服务业">服务业</Option>
                                    <Option value="金融">金融</Option>
                                    <Option value="教育">教育</Option>
                                    <Option value="医疗">医疗</Option>
                                    <Option value="其他">其他</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="enterpriseScale" label="企业规模" rules={[{ required: true }]}>
                                <Select placeholder="请选择">
                                    <Option value="1-50人">1-50人</Option>
                                    <Option value="51-200人">51-200人</Option>
                                    <Option value="201-500人">201-500人</Option>
                                    <Option value="501-1000人">501-1000人</Option>
                                    <Option value="1000人以上">1000人以上</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>
                </Card>

                {/* 联系信息 */}
                <Card
                    title={
                        <Space>
                            <span>对接人信息</span>
                            <Text style={{ color: '#ff4d4f', fontWeight: 'normal', fontSize: 14, marginLeft: 8 }}>
                                信息仅用于报备查重与权益锁定，我们会严格保护您的客户资源。
                            </Text>
                        </Space>
                    }
                    style={{ marginBottom: 24 }}
                >
                    <Row gutter={24}>
                        <Col span={8}>
                            <Form.Item name="contactName" label="联系人姓名" rules={[{ required: true, max: 20 }]}>
                                <Input placeholder="客户方对接人姓名" />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                name="contactPhone"
                                label="客户方对接人联系电话"
                                rules={[{ required: true, pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' }]}
                            >
                                <Input placeholder="11 位手机号" />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="contactPosition" label="岗位" rules={[{ required: true, max: 20 }]}>
                                <Input placeholder="客户方对接人职位" />
                            </Form.Item>
                        </Col>

                    </Row>
                </Card>

                {/* 报备凭证 */}
                <Card
                    title={
                        <Space>
                            <span>报备凭证</span>
                            <Tooltip title="报备凭证必须包含：客户名称、对接人姓名、岗位、联系方式">
                                <InfoCircleOutlined style={{ color: '#1890ff' }} />
                            </Tooltip>
                        </Space>
                    }
                    style={{ marginBottom: 24 }}
                >
                    <Form.Item
                        name="vouchers"
                        label="报备凭证截图"
                        valuePropName="fileList"
                        getValueFromEvent={(e) => Array.isArray(e) ? e : e?.fileList}
                        rules={[{ required: true, message: '请上传报备凭证' }]}
                    >
                        <Upload
                            listType="picture-card"
                            action="/api/upload" // 模拟
                            beforeUpload={() => false} // 演示中不实际上传
                        >
                            <div style={{ padding: 8 }}>
                                <UploadOutlined />
                                <div style={{ marginTop: 8 }}>上传截图</div>
                            </div>
                        </Upload>
                    </Form.Item>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                        请上传能证明客户归属的聊天截图，单个文件 ≤ 10MB，支持多张
                    </Text>
                </Card>
            </Form>

            <Alert
                message="重要提示"
                description="为了保障您的佣金顺利结算，请务必提供真实有效的客户对接凭证。 注意： 凭证不实将导致报备失效及佣金无法发放，请您仔细核对。"
                type="warning"
                showIcon
                style={{ marginBottom: 24 }}
            />
        </div>
    )
}


export default ReportingNew
