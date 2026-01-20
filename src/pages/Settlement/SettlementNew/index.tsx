import { FC, useState, useEffect } from 'react'
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
    Cascader,
    Steps,
    Divider,
    Tag
} from 'antd'
import {
    PlusOutlined,
    ArrowLeftOutlined,
    SaveOutlined,
    InboxOutlined,
    CheckCircleFilled,
    SettingOutlined
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import type { SettlementApplication } from '../../../types/settlement'
import type { CommissionRule } from '../../../types/commissionRule'
import ruleData from '../../../data/commission_rules.json'
import NewRuleForm from './components/NewRuleForm'

const { Title, Text } = Typography
const { Option } = Select
const { TextArea } = Input

// 模拟省市区数据
const AREA_OPTIONS = [
    {
        value: 'zhejiang',
        label: '浙江',
        children: [
            { value: 'hangzhou', label: '杭州', children: [{ value: 'xihu', label: '西湖区' }] },
            { value: 'ningbo', label: '宁波', children: [{ value: 'haishu', label: '海曙区' }] }
        ]
    },
    {
        value: 'sichuan',
        label: '四川',
        children: [
            { value: 'chengdu', label: '成都', children: [{ value: 'wuhou', label: '武侯区' }] }
        ]
    },
    {
        value: 'shanghai',
        label: '上海',
        children: [{ value: 'pudong', label: '浦东新区' }, { value: 'jingan', label: '静安区' }]
    }
]

/**
 * 新建入驻申请页
 */
const SettlementNew: FC = () => {
    const navigate = useNavigate()
    const [form] = Form.useForm()
    const [submitting, setSubmitting] = useState(false)
    const [uploadModalVisible, setUploadModalVisible] = useState(false)
    const [rules, setRules] = useState<CommissionRule[]>([])
    const [currentStep, setCurrentStep] = useState(0)

    // 特殊分佣模式相关
    const [isSpecialMode, setIsSpecialMode] = useState(false)
    const [isNewRuleModalOpen, setIsNewRuleModalOpen] = useState(false)
    const [selectedRuleId, setSelectedRuleId] = useState<string>('RULE_DEFAULT')

    // 获取规则数据
    useEffect(() => {
        const storedRules = localStorage.getItem('commission_rules')
        const initialRules: CommissionRule[] = storedRules ? JSON.parse(storedRules) : (ruleData as CommissionRule[])
        setRules(initialRules)

        // 默认规则
        const defaultRule = initialRules.find(r => r.isDefault) || initialRules[0]
        if (defaultRule) {
            setSelectedRuleId(defaultRule.id)
            form.setFieldsValue({ ruleId: defaultRule.id })
        }
    }, [form])

    // 校验公司名称唯一性
    const checkDuplicateCompanyName = async (_: any, value: string) => {
        if (!value) return Promise.resolve()

        const storedData = localStorage.getItem('settlement_data')
        const allRecords: SettlementApplication[] = storedData ? JSON.parse(storedData) : []

        const exists = allRecords.some((r: SettlementApplication) => r.companyName === value)
        if (exists) {
            return Promise.reject(new Error('该公司已存在入驻记录'))
        }
        return Promise.resolve()
    }

    // 模拟工商校验
    const handleVerifyCompany = () => {
        const companyName = form.getFieldValue('companyName');
        if (!companyName) {
            message.warning('请先输入公司全称');
            return;
        }
        message.loading({ content: '正在校验工商信息...', key: 'verify' });
        setTimeout(() => {
            message.success({ content: '工商信息校验成功，信息已同步', key: 'verify' });
            form.setFieldsValue({
                socialCreditCode: '91510100MA6XXXXXXX',
                city: ['sichuan', 'chengdu'],
                industry: '制造行业',
                scale: '100-500人'
            });
        }, 1000);
    }

    const handleUploadOk = () => {
        setUploadModalVisible(false)
        message.loading({ content: '正在智能识别营业执照...', key: 'analysis' })

        setTimeout(() => {
            form.setFieldsValue({
                companyName: '成都某某科技有限公司',
                socialCreditCode: '91510100MA6XXXXXXX',
                address: ['sichuan', 'chengdu', 'wuhou'],
                detailedAddress: '科华北路65号',
                owner: '王五',
                contactName: '王小二',
                contactPhone: '13888888888',
                contactPosition: '技术总监'
            })
            message.success({ content: '识别成功，已自动填充相关信息', key: 'analysis' })
        }, 1500)
    }

    // 处理下一步
    const handleNext = async () => {
        try {
            await form.validateFields([
                'companyName', 'city', 'detailedAddress',
                'contactName', 'contactPhone', 'contactPosition', 'contactEmail',
                'socialCreditCode', 'address',
                'customerProof'
            ])
            setCurrentStep(1)
            window.scrollTo(0, 0)
        } catch (error) {
            console.error('Validate Step 1 Failed:', error)
        }
    }

    // 处理上一步
    const handlePrev = () => {
        setCurrentStep(0)
        window.scrollTo(0, 0)
    }

    // 处理提交
    const handleSubmit = async () => {
        try {
            const values = await form.validateFields()
            setSubmitting(true)

            const todayStr = dayjs().format('YYYYMMDD')
            const storedData = localStorage.getItem('settlement_data')
            const allRecords: SettlementApplication[] = storedData ? JSON.parse(storedData) : []

            const todayRecords = allRecords.filter((r: SettlementApplication) => r.id.startsWith(`SQ${todayStr}`))
            let nextSeq = 1
            if (todayRecords.length > 0) {
                const maxSeq = Math.max(...todayRecords.map(r => parseInt(r.id.slice(-4))))
                nextSeq = maxSeq + 1
            }
            const orderId = `SQ${todayStr}${nextSeq.toString().padStart(4, '0')}`

            // 构造新数据
            const newApp: SettlementApplication = {
                id: orderId,
                ...values,
                city: Array.isArray(values.city) ? values.city.join('/') : values.city,
                address: values.address ? (Array.isArray(values.address) ? values.address.join('/') : values.address) : '',
                cooperationStartDate: dayjs().format('YYYY-MM-DD'),
                cooperationEndDate: dayjs().add(1, 'year').format('YYYY-MM-DD'),
                applyTime: dayjs().format('YYYY-MM-DD'),
                auditStatus: 'pending',
                signContractUrl: '/contracts/example.pdf',
                businessLicenseUrl: '/licenses/example.jpg',
                owner: '张三',
                commissionType: '阶梯分佣',
                ruleId: selectedRuleId,
            }

            localStorage.setItem('settlement_data', JSON.stringify([newApp, ...allRecords]))

            message.success('提交成功，等待审批')
            setTimeout(() => navigate('/settlement-list'), 1000)
        } catch (error) {
            console.error('Validate Failed:', error)
        } finally {
            setSubmitting(false)
        }
    }

    // 处理返回
    const handleCancel = () => {
        Modal.confirm({
            title: '确定放弃编辑？',
            content: '未保存的内容将丢失',
            okText: '确定',
            cancelText: '取消',
            onOk: () => navigate('/settlement-list')
        })
    }

    const handleRuleSelect = (value: string) => {
        setSelectedRuleId(value)
        form.setFieldsValue({ ruleId: value })
    }

    const handleNewRuleSuccess = (newRule: CommissionRule) => {
        const updatedRules = [...rules, newRule]
        setRules(updatedRules)
        localStorage.setItem('commission_rules', JSON.stringify(updatedRules))
        setSelectedRuleId(newRule.id)
        form.setFieldsValue({ ruleId: newRule.id })
        setIsNewRuleModalOpen(false)
        message.success('新规则已配置并应用')
    }

    const currentRule = rules.find(r => r.id === selectedRuleId)

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
                    <Title level={4} style={{ margin: 0 }}>新建入驻申请</Title>
                </Space>
                <Space>
                    {currentStep === 0 ? (
                        <Button
                            type="primary"
                            onClick={handleNext}
                            style={{ background: '#ff5050', borderColor: '#ff5050' }}
                        >
                            下一步：录入分佣配置
                        </Button>
                    ) : (
                        <Space>
                            <Button onClick={handlePrev}>上一步</Button>
                            <Button
                                type="primary"
                                icon={<SaveOutlined />}
                                onClick={handleSubmit}
                                loading={submitting}
                                style={{ background: '#ff5050', borderColor: '#ff5050' }}
                            >
                                提交申请
                            </Button>
                        </Space>
                    )}
                </Space>
            </div>

            <div style={{ maxWidth: 800, margin: '20px auto' }}>
                <Steps
                    current={currentStep}
                    items={[
                        { title: '基本信息填写' },
                        { title: '分佣配置录入' }
                    ]}
                    style={{ marginBottom: 40 }}
                />

                <Form
                    form={form}
                    layout="vertical"
                >
                    {/* 第一步：基本与工商信息 */}
                    <div style={{ display: currentStep === 0 ? 'block' : 'none' }}>
                        <Card title="基本信息" style={{ marginBottom: 24 }} extra={
                            <Button type="link" icon={<InboxOutlined />} onClick={() => setUploadModalVisible(true)}>智能解析营业执照</Button>
                        }>
                            <Row gutter={24}>
                                <Col span={24}>
                                    <Form.Item
                                        label="渠道公司全称"
                                        required
                                        tooltip="需要与签订合同的公司名称一致"
                                    >
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <Form.Item
                                                name="companyName"
                                                noStyle
                                                validateTrigger="onBlur"
                                                rules={[
                                                    { required: true, message: '请填写公司全称' },
                                                    { validator: checkDuplicateCompanyName }
                                                ]}
                                            >
                                                <Input placeholder="请输入公司全称" style={{ flex: 1 }} />
                                            </Form.Item>
                                            <Button
                                                type="link"
                                                onClick={handleVerifyCompany}
                                                style={{ padding: '4px 0', height: 'auto' }}
                                            >
                                                校验工商信息
                                            </Button>
                                        </div>
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item name="socialCreditCode" label="纳税人识别号"
                                        rules={[{ required: true, message: '请填写纳税人识别号/代码' }]}
                                    >
                                        <Input placeholder="18位信用代码" />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item name="city" label="省份/城市" rules={[{ required: true }]}>
                                        <Cascader
                                            options={AREA_OPTIONS}
                                            placeholder="请选择省份/城市"
                                        />
                                    </Form.Item>
                                </Col>
                                <Col span={24}>
                                    <Form.Item name="detailedAddress" label="详细地址">
                                        <Input placeholder="请填写详细地址" />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Card>

                        <Card title="联系信息" style={{ marginBottom: 24 }}>
                            <Row gutter={24}>
                                <Col span={12}>
                                    <Form.Item name="contactName" label="联系人" rules={[{ required: true, max: 20 }]}>
                                        <Input placeholder="最大 20 字符" />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        name="contactPhone"
                                        label="手机号码"
                                        rules={[{ required: true, message: '请输入正确的手机号码' }]}
                                    >
                                        <Input placeholder="11 位手机号" />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item name="contactEmail" label="联系邮箱" rules={[{ required: true, message: '请输入正确的邮箱' }]}>
                                        <Input placeholder="用于接收电子账单" />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item name="contactPosition" label="担任职位" rules={[{ required: true }]}>
                                        <Select placeholder="请选择职位">
                                            <Option value="CEO">CEO</Option>
                                            <Option value="负责人">负责人</Option>
                                            <Option value="其它">其它</Option>
                                        </Select>
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Card>

                        <Card title="客户资源证明" style={{ marginBottom: 24 }}>
                            <Form.Item name="customerProof" label="初期提报客户盘点">
                                <TextArea rows={4} placeholder="请输入意向客户工商名称（每行一个）" />
                            </Form.Item>
                        </Card>
                    </div>

                    {/* 第二步：分佣配置信息 */}
                    <div style={{ display: currentStep === 1 ? 'block' : 'none' }}>
                        <Card title="分佣配置" bordered={false} bodyStyle={{ padding: 0 }}>
                            {!isSpecialMode ? (
                                <div style={{
                                    padding: '40px 24px',
                                    textAlign: 'center',
                                    background: '#fff',
                                    borderRadius: 8,
                                    border: '1px solid #f0f0f0'
                                }}>
                                    <CheckCircleFilled style={{ fontSize: 48, color: '#52c41a', marginBottom: 16 }} />
                                    <Title level={4}>影刀标准分佣规则</Title>
                                    <Text type="secondary" style={{ display: 'block', marginBottom: 24 }}>
                                        当前默认应用系统标准分佣规则，无需手动选择。
                                    </Text>

                                    {currentRule && (
                                        <div style={{
                                            background: '#fafafa',
                                            padding: '16px',
                                            borderRadius: 8,
                                            maxWidth: 500,
                                            margin: '0 auto 32px',
                                            textAlign: 'left'
                                        }}>
                                            <div style={{ marginBottom: 12 }}>
                                                <Tag color="red">标准规则</Tag>
                                                <Text strong>{currentRule.name}</Text>
                                            </div>
                                            <Space wrap size={[16, 8]}>
                                                {currentRule.tiers.map((tier, idx) => (
                                                    <div key={idx} style={{ fontSize: 13, color: '#666' }}>
                                                        {tier.min}万 - {tier.max ? `${tier.max}万` : '以上'}：<Text strong style={{ color: '#ff5050' }}>{tier.rate}%</Text>
                                                    </div>
                                                ))}
                                            </Space>
                                        </div>
                                    )}

                                    <Divider />
                                    <Button
                                        icon={<SettingOutlined />}
                                        onClick={() => setIsSpecialMode(true)}
                                    >
                                        申请特殊分佣规则
                                    </Button>
                                </div>
                            ) : (
                                <Card style={{ background: '#fff', borderRadius: 8, border: '1px solid #ff5050' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                                        <Title level={5} style={{ margin: 0 }}>特殊分佣规则配置</Title>
                                        <Button type="link" onClick={() => {
                                            setIsSpecialMode(false)
                                            setSelectedRuleId('RULE_DEFAULT')
                                            form.setFieldsValue({ ruleId: 'RULE_DEFAULT' })
                                        }}>恢复标准规则</Button>
                                    </div>

                                    <Form.Item label="选择已有规则" name="ruleId">
                                        <div style={{ display: 'flex', gap: 12 }}>
                                            <Select
                                                style={{ flex: 1 }}
                                                value={selectedRuleId}
                                                onChange={handleRuleSelect}
                                                placeholder="请选择规则"
                                            >
                                                {rules.map(rule => (
                                                    <Option key={rule.id} value={rule.id}>
                                                        {rule.name} {rule.isDefault && '(默认)'}
                                                    </Option>
                                                ))}
                                            </Select>
                                            <Button
                                                type="primary"
                                                icon={<PlusOutlined />}
                                                onClick={() => setIsNewRuleModalOpen(true)}
                                                style={{ background: '#ff5050', borderColor: '#ff5050' }}
                                            >
                                                配置新规则
                                            </Button>
                                        </div>
                                    </Form.Item>

                                    {currentRule && (
                                        <div style={{ background: '#fafafa', padding: 20, borderRadius: 8 }}>
                                            <div style={{ marginBottom: 16 }}>
                                                <Text strong>规则明细：{currentRule.name}</Text>
                                                {currentRule.description && (
                                                    <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>{currentRule.description}</div>
                                                )}
                                            </div>
                                            <Row gutter={[16, 16]}>
                                                {currentRule.tiers.map((tier, idx) => (
                                                    <Col key={idx} span={8}>
                                                        <div style={{
                                                            background: '#fff',
                                                            padding: '12px',
                                                            borderRadius: 4,
                                                            border: '1px solid #eee',
                                                            textAlign: 'center'
                                                        }}>
                                                            <div style={{ fontSize: 12, color: '#999', marginBottom: 4 }}>
                                                                {tier.min} {tier.max ? `- ${tier.max}` : '+'} 万
                                                            </div>
                                                            <div style={{ fontSize: 18, fontWeight: 'bold', color: '#ff5050' }}>
                                                                {tier.rate}%
                                                            </div>
                                                        </div>
                                                    </Col>
                                                ))}
                                            </Row>
                                        </div>
                                    )}
                                </Card>
                            )}
                        </Card>
                    </div>
                </Form >
            </div>

            {/* 智能解析上传弹窗 */}
            <Modal
                title="营业执照智能识别"
                open={uploadModalVisible}
                onOk={handleUploadOk}
                onCancel={() => setUploadModalVisible(false)}
                okText="开始识别"
                cancelText="取消"
            >
                <div style={{ padding: '20px 0' }}>
                    <Upload.Dragger
                        maxCount={1}
                        beforeUpload={() => false}
                    >
                        <p className="ant-upload-drag-icon">
                            <InboxOutlined />
                        </p>
                        <p className="ant-upload-text">点击或将营业执照拖拽到此区域上传</p>
                        <p className="ant-upload-hint">支持 JPG, PNG 格式，文件大小不超过 10MB</p>
                    </Upload.Dragger>
                </div>
            </Modal >

            {/* 配置新规则弹窗 */}
            <Modal
                title="配置新分佣规则"
                open={isNewRuleModalOpen}
                footer={null}
                onCancel={() => setIsNewRuleModalOpen(false)}
                width={600}
                destroyOnClose
            >
                <NewRuleForm
                    onCancel={() => setIsNewRuleModalOpen(false)}
                    onSuccess={handleNewRuleSuccess}
                />
            </Modal>
        </div >
    )
}

export default SettlementNew
