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
    Divider,
    Modal,
    Cascader,
    Steps,
    ConfigProvider
} from 'antd'
import {
    RobotOutlined,
    UploadOutlined,
    ArrowLeftOutlined,
    SaveOutlined,
    SyncOutlined,
    InboxOutlined
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import type { SettlementApplication } from '../../../types/settlement'
import type { CommissionRule } from '../../../types/commissionRule'
import ruleData from '../../../data/commission_rules.json'

const { RangePicker } = DatePicker
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
    const [analyzing, setAnalyzing] = useState(false)
    const [uploadModalVisible, setUploadModalVisible] = useState(false)
    const [rules, setRules] = useState<CommissionRule[]>([])
    const [currentStep, setCurrentStep] = useState(0)

    // 获取规则数据
    useEffect(() => {
        const storedRules = localStorage.getItem('commission_rules')
        if (storedRules) {
            const parsedRules: CommissionRule[] = JSON.parse(storedRules)
            setRules(parsedRules)
            // 预选默认规则
            const defaultRule = parsedRules.find(r => r.isDefault)
            if (defaultRule) {
                form.setFieldsValue({ ruleId: defaultRule.id })
            }
        } else {
            const initialRules = ruleData as CommissionRule[]
            setRules(initialRules)
            const defaultRule = initialRules.find(r => r.isDefault)
            if (defaultRule) {
                form.setFieldsValue({ ruleId: defaultRule.id })
            }
        }
    }, [])

    // 校验公司名称唯一性
    const checkDuplicateCompanyName = async (_: any, value: string) => {
        if (!value) return Promise.resolve()

        const storedData = localStorage.getItem('settlement_data')
        const allRecords: SettlementApplication[] = storedData ? JSON.parse(storedData) : []

        const exists = allRecords.some(r => r.companyName === value)
        if (exists) {
            return Promise.reject(new Error('该公司已存在入驻记录'))
        }
        return Promise.resolve()
    }

    // 模拟智能解析流程
    const startAnalysis = () => {
        setUploadModalVisible(true)
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
        setAnalyzing(true)
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
            setAnalyzing(false)
        }, 1500)
    }

    // 处理下一步
    const handleNext = async () => {
        try {
            // 第一步校验字段：基本信息、联系信息、工商信息、客户资源证明
            await form.validateFields([
                'companyName', 'city', 'detailedAddress',
                'contactName', 'contactPhone', 'contactPosition', 'contactEmail', 'referrer',
                'socialCreditCode', 'bankInfo', 'address',
                'customerProof', 'industry', 'scale'
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

            // 生成顺序单号: SQ + yyyyMMdd + 4位顺序号
            const todayStr = dayjs().format('YYYYMMDD')
            const storedData = localStorage.getItem('settlement_data')
            const allRecords: SettlementApplication[] = storedData ? JSON.parse(storedData) : []

            // 找出今天已有的单号，取最大的序号
            const todayRecords = allRecords.filter(r => r.id.startsWith(`SQ${todayStr}`))
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
                cooperationStartDate: values.cooperationDate[0].format('YYYY-MM-DD'),
                cooperationEndDate: values.cooperationDate[1].format('YYYY-MM-DD'),
                applyTime: dayjs().format('YYYY-MM-DD'),
                auditStatus: 'pending',
                signContractUrl: '/contracts/example.pdf',
                businessLicenseUrl: '/licenses/example.jpg',
                owner: '张三', // 默认为当前创建者
                commissionType: values.commissionType === '阶梯分佣' ? 'custom_ladder' : (values.commissionType === '固定分佣' ? 'fixed' : 'personalized'),
                commissionRate: values.commissionType === '固定分佣' ? Number(values.commissionRate) : undefined,
                commissionDescription: values.commissionType === '协议分佣' ? values.commissionDescription : undefined,
                ruleId: values.commissionType === '阶梯分佣' ? values.ruleId : undefined,
            }

            // 保存
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

    // 自动推算合作截止日期
    const handleDateChange = (dates: any) => {
        if (dates && dates[0] && !dates[1]) {
            form.setFieldsValue({
                cooperationDate: [dates[0], dates[0].add(1, 'year')]
            })
        }
    }

    // 文件校验
    const beforeUpload = (file: any, maxSizeMB: number) => {
        const isLtSize = file.size / 1024 / 1024 < maxSizeMB
        if (!isLtSize) {
            message.error(`文件大小不能超过 ${maxSizeMB}MB!`)
        }
        return isLtSize || Upload.LIST_IGNORE
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
                    <Title level={4} style={{ margin: 0 }}>新建入驻申请</Title>
                </Space>
                <Space>
                    {currentStep === 0 ? (
                        <Button
                            type="primary"
                            onClick={handleNext}
                            style={{ background: '#ff5050', borderColor: '#ff5050' }}
                        >
                            下一步：录入合作信息
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
                        { title: '商务合作录入' }
                    ]}
                    style={{ marginBottom: 40 }}
                />

                <Form
                    form={form}
                    layout="vertical"
                    initialValues={{
                        commissionType: '阶梯分佣'
                    }}
                >
                    {/* 第一步：基本与工商信息 */}
                    <div style={{ display: currentStep === 0 ? 'block' : 'none' }}>
                        {/* 基本信息 */}
                        <Card title="基本信息" style={{ marginBottom: 24 }}>
                            <Row gutter={24}>
                                <Col span={12}>
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
                                        validateTrigger="onBlur"
                                        rules={[
                                            { required: true, message: '请填写纳税人识别号/代码' }
                                        ]}
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
                                <Col span={12}>
                                    <Form.Item name="detailedAddress" label="详细地址">
                                        <Input placeholder="请填写详细地址" />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Card>

                        {/* 联系信息 */}
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
                                    <Form.Item name="contactEmail" label="对接邮箱" rules={[{ required: true, type: 'email', message: '请输入正确的邮箱' }]}>
                                        <Input placeholder="用于接收电子账单" />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item name="contactPosition" label="担任职位" rules={[{ required: true }]}>
                                        <Select placeholder="请选择职位">
                                            <Option value="CEO">CEO</Option>
                                            <Option value="运营负责人">运营负责人</Option>
                                            <Option value="销售负责人">销售负责人</Option>
                                            <Option value="IT负责人">IT负责人</Option>
                                            <Option value="市场负责人">市场负责人</Option>
                                            <Option value="CFO">CFO</Option>
                                            <Option value="其它">其它</Option>
                                        </Select>
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Card>

                        {/* 客户资源证明 */}
                        <Card title="客户资源证明" style={{ marginBottom: 24 }}>
                            <Typography.Paragraph type="secondary">
                                客户清单用于入驻前的资源价值评估。
                            </Typography.Paragraph>
                            <Form.Item name="customerProof" label="初期提报客户盘点">
                                <TextArea rows={4} placeholder="请输入意向客户工商名称（每行一个）" />
                            </Form.Item>
                        </Card>
                    </div>

                    {/* 第二步：商务合作信息 */}
                    <div style={{ display: currentStep === 1 ? 'block' : 'none' }}>
                        {/* 分佣配置 */}
                        <Card title="分佣配置" style={{ marginBottom: 24 }}>
                            <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => prevValues.commissionType !== currentValues.commissionType}>
                                {({ getFieldValue }) => {
                                    const type = getFieldValue('commissionType')
                                    return (
                                        <Row gutter={24}>
                                            <Col span={8}>
                                                <Form.Item name="commissionType" label="分佣类型" rules={[{ required: true }]}>
                                                    <Select>
                                                        <Option value="阶梯分佣">阶梯分佣</Option>
                                                        <Option value="固定分佣">固定分佣</Option>
                                                        <Option value="协议分佣">协议分佣</Option>
                                                    </Select>
                                                </Form.Item>
                                            </Col>

                                            {type === '阶梯分佣' && (
                                                <>
                                                    <Col span={8}>
                                                        <Form.Item
                                                            name="ruleId"
                                                            label="分佣规则"
                                                            rules={[{ required: true, message: '请选择分佣规则' }]}
                                                        >
                                                            <Select placeholder="请选择规则">
                                                                {rules.filter(r => r.status === 'enabled').map(rule => (
                                                                    <Option key={rule.id} value={rule.id}>{rule.name}</Option>
                                                                ))}
                                                            </Select>
                                                        </Form.Item>
                                                    </Col>
                                                    <Col span={24}>
                                                        <Form.Item shouldUpdate={(prev, curr) => prev.ruleId !== curr.ruleId}>
                                                            {({ getFieldValue }) => {
                                                                const selectedRuleId = getFieldValue('ruleId');
                                                                const rule = rules.find(r => r.id === selectedRuleId);
                                                                if (!rule) return null;
                                                                return (
                                                                    <Card size="small" style={{ background: '#fafafa', border: '1px solid #f0f0f0' }}>
                                                                        <div style={{ marginBottom: 8 }}><Text strong style={{ color: '#ff5050' }}>规则明细：{rule.name}</Text></div>
                                                                        <Space wrap size={[24, 8]}>
                                                                            {rule.tiers.map((tier, idx) => (
                                                                                <div key={idx} style={{ fontSize: 13, color: '#666' }}>
                                                                                    {tier.min}万 - {tier.max ? `${tier.max}万` : '以上'} ({tier.rate}%)
                                                                                </div>
                                                                            ))}
                                                                        </Space>
                                                                        {rule.description && <div style={{ marginTop: 8, fontSize: 12, color: '#999' }}>备注：{rule.description}</div>}
                                                                    </Card>
                                                                );
                                                            }}
                                                        </Form.Item>
                                                    </Col>
                                                </>
                                            )}

                                            {type === '固定分佣' && (
                                                <Col span={8}>
                                                    <Form.Item
                                                        name="commissionRate"
                                                        label="固定分佣比例 (%)"
                                                        rules={[{ required: true, message: '请填写比例' }]}
                                                    >
                                                        <Input type="number" suffix="%" placeholder="0-100" />
                                                    </Form.Item>
                                                </Col>
                                            )}

                                            {type === '协议分佣' && (
                                                <Col span={16}>
                                                    <Form.Item
                                                        name="commissionDescription"
                                                        label="协议分佣说明"
                                                        rules={[{ required: true, message: '请填写说明' }, { max: 500 }]}
                                                    >
                                                        <TextArea rows={1} placeholder="请描述特殊分佣建议，最大 500 字符" />
                                                    </Form.Item>
                                                </Col>
                                            )}
                                        </Row>
                                    )
                                }}
                            </Form.Item>
                        </Card>
                    </div>
                </Form >
            </div>

            {/* 智能解析上传弹窗 */}
            < Modal
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
        </div >
    )
}

export default SettlementNew
