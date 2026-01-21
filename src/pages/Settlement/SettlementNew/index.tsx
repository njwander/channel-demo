import { FC, useState, useEffect } from 'react'
import {
    Form,
    Input,
    Button,
    Card,
    Typography,
    Space,
    Row,
    Col,
    Upload,
    message,
    Modal,
    Cascader,
    Steps,
    Divider,
    Tag,
    InputNumber,
    Select,
    Radio,
    DatePicker
} from 'antd'
import {
    PlusOutlined,
    ArrowLeftOutlined,
    SaveOutlined,
    InboxOutlined,
    CheckCircleFilled,
    SettingOutlined,
    DeleteOutlined,
    InfoCircleOutlined,
    CalendarOutlined
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import type { SettlementApplication } from '../../../types/settlement'

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
 * 新建入驻申请页
 */
const SettlementNew: FC = () => {
    const navigate = useNavigate()
    const [form] = Form.useForm()
    const [submitting, setSubmitting] = useState(false)
    const [uploadModalVisible, setUploadModalVisible] = useState(false)
    const [currentStep, setCurrentStep] = useState(0)

    // 特殊分佣模式相关
    const [isSpecialMode, setIsSpecialMode] = useState(false)

    // 初始化表单值
    useEffect(() => {
        const start = dayjs();
        form.setFieldsValue({
            commissionType: '阶梯分佣',
            commissionTiers: DEFAULT_SYSTEM_RULE.tiers,
            cooperationStartDate: start,
            cooperationEndDate: start.add(1, 'year').subtract(1, 'day')
        })
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
                contactPosition: '技术总监',
                contactEmail: 'wang@example.com'
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

            // 校验区间合理性
            if (isSpecialMode) {
                const tiers = values.commissionTiers;
                const sortedTiers = [...tiers].sort((a, b) => a.min - b.min);
                for (let i = 0; i < sortedTiers.length; i++) {
                    if (sortedTiers[i].max !== null && sortedTiers[i].max !== undefined && sortedTiers[i].min >= sortedTiers[i].max!) {
                        message.error(`特殊分佣梯度 ${i + 1} 的最小值必须小于最大值`);
                        setSubmitting(false);
                        return;
                    }
                    if (i > 0 && sortedTiers[i].min !== sortedTiers[i - 1].max) {
                        message.error(`特殊分佣梯度 ${i + 1} 的起始值必须等于上一个梯度的截止值`);
                        setSubmitting(false);
                        return;
                    }
                }
                if (sortedTiers[0].min !== 0) {
                    message.error('第一个梯度的起始值必须为 0');
                    setSubmitting(false);
                    return;
                }
            }

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
                cooperationStartDate: values.cooperationStartDate.format('YYYY-MM-DD'),
                cooperationEndDate: values.cooperationEndDate.format('YYYY-MM-DD'),
                applyTime: dayjs().format('YYYY-MM-DD'),
                auditStatus: 'pending',
                signContractUrl: '/contracts/example.pdf',
                businessLicenseUrl: '/licenses/example.jpg',
                owner: '张三',
                commissionType: isSpecialMode ? values.commissionType : '阶梯分佣',
                commissionRate: isSpecialMode && values.commissionType === '固定分佣' ? values.commissionRate : undefined,
                commissionTiers: isSpecialMode ? (values.commissionType === '阶梯分佣' ? values.commissionTiers : undefined) : DEFAULT_SYSTEM_RULE.tiers,
                ruleId: isSpecialMode ? undefined : DEFAULT_SYSTEM_RULE.id
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

    const currentTiers = form.getFieldValue('commissionTiers') || DEFAULT_SYSTEM_RULE.tiers;

    return (
        <div style={{ padding: '0 24px 24px' }}>
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

                <Form form={form} layout="vertical">
                    {/* 第一步：基本与工商信息 */}
                    <div style={{ display: currentStep === 0 ? 'block' : 'none' }}>
                        <Card title="基本信息" style={{ marginBottom: 24 }}>
                            <Row gutter={24}>
                                <Col span={24}>
                                    <Form.Item
                                        label="渠道公司名称"
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

                        <Card title="业绩归属周期" style={{ marginBottom: 24 }}>
                            <Row gutter={24}>
                                <Col span={12}>
                                    <Form.Item
                                        name="cooperationStartDate"
                                        label="业绩计算开始日期"
                                        rules={[{ required: true, message: '请选择开始日期' }]}
                                        tooltip="该日期通常为合同签署日或合作开展首日"
                                    >
                                        <DatePicker
                                            style={{ width: '100%' }}
                                            onChange={(date) => {
                                                if (date) {
                                                    form.setFieldsValue({
                                                        cooperationEndDate: date.add(1, 'year').subtract(1, 'day')
                                                    })
                                                }
                                            }}
                                        />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        name="cooperationEndDate"
                                        label="业绩计算截止日期"
                                        tooltip="自动计算：开始日期 + 1年"
                                    >
                                        <DatePicker style={{ width: '100%' }} disabled />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Card>
                    </div>

                    {/* 第二步：分佣配置信息 */}
                    <div style={{ display: currentStep === 1 ? 'block' : 'none' }}>
                        <Card title="分佣配置" bordered={false} bodyStyle={{ padding: 0 }}>
                            {!isSpecialMode ? (
                                <div style={{
                                    padding: '48px 24px',
                                    textAlign: 'center',
                                    background: '#fff',
                                    borderRadius: 12,
                                    border: '1px dashed #d9d9d9'
                                }}>
                                    <CheckCircleFilled style={{ fontSize: 56, color: '#52c41a', marginBottom: 20 }} />
                                    <Title level={3} style={{ marginBottom: 12 }}>影刀标准分佣方案</Title>
                                    <div style={{ marginBottom: 32 }}>
                                        <div style={{ marginTop: 12, display: 'flex', justifyContent: 'center', gap: 12 }}>
                                            <Tag icon={<InfoCircleOutlined />} color="blue" style={{ padding: '4px 12px', borderRadius: 4 }}>
                                                业绩累计周期：每个签约周期（1年内）
                                            </Tag>
                                            <Tag color="cyan" style={{ padding: '4px 12px', borderRadius: 4 }}>
                                                自动计算 实时生效
                                            </Tag>
                                        </div>
                                    </div>

                                    <div style={{
                                        background: '#f8f9fb',
                                        padding: '24px',
                                        borderRadius: 12,
                                        maxWidth: 580,
                                        margin: '0 auto 32px',
                                        textAlign: 'left',
                                        border: '1px solid #f0f2f5'
                                    }}>
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            marginBottom: 16,
                                            padding: '0 16px',
                                            opacity: 0.7
                                        }}>
                                            <Text strong style={{ fontSize: 13 }}>签约年度累计业绩 (万)</Text>
                                            <Text strong style={{ fontSize: 13 }}>分佣比例 (%)</Text>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                            {DEFAULT_SYSTEM_RULE.tiers.map((tier, idx) => (
                                                <div key={idx} style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    padding: '14px 20px',
                                                    background: '#fff',
                                                    borderRadius: 10,
                                                    boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                                                    transition: 'transform 0.2s',
                                                    border: '1px solid #f0f0f0'
                                                }}>
                                                    <Text style={{ fontSize: 15, color: '#333' }}>
                                                        {tier.min}万 {tier.max ? `- ${tier.max}万` : '以上'}
                                                    </Text>
                                                    <Text strong style={{ color: '#ff5050', fontSize: 18 }}>
                                                        {tier.rate}%
                                                    </Text>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div style={{ marginTop: 24 }}>
                                        <Button
                                            type="link"
                                            icon={<SettingOutlined />}
                                            onClick={() => setIsSpecialMode(true)}
                                            style={{ color: '#8c8c8c' }}
                                        >
                                            如有特殊业务场景，可申请特殊分佣规则
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <Card style={{ background: '#fff', borderRadius: 8, border: '1px solid #ff5050' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                                        <Space>
                                            <SettingOutlined style={{ color: '#ff5050' }} />
                                            <Title level={5} style={{ margin: 0 }}>特殊分佣方案配置</Title>
                                        </Space>
                                        <Button type="link" onClick={() => {
                                            setIsSpecialMode(false)
                                            form.setFieldsValue({
                                                commissionType: '阶梯分佣',
                                                commissionTiers: DEFAULT_SYSTEM_RULE.tiers
                                            })
                                        }}>恢复标准规则</Button>
                                    </div>

                                    <Form.Item name="commissionType" label="分佣形式">
                                        <Radio.Group>
                                            <Radio value="阶梯分佣">阶梯分佣</Radio>
                                            <Radio value="固定分佣">固定分佣</Radio>
                                        </Radio.Group>
                                    </Form.Item>

                                    <Form.Item noStyle shouldUpdate={(prev, curr) => prev.commissionType !== curr.commissionType}>
                                        {({ getFieldValue }) => {
                                            const type = getFieldValue('commissionType')
                                            if (type === '固定分佣') {
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
                                                                        const tiers = form.getFieldValue('commissionTiers');
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
                                </Card>
                            )}
                        </Card>
                    </div>
                </Form>
            </div>

            <Modal
                title="营业执照智能识别"
                open={uploadModalVisible}
                onOk={handleUploadOk}
                onCancel={() => setUploadModalVisible(false)}
                okText="开始识别"
                cancelText="取消"
            >
                <div style={{ padding: '20px 0' }}>
                    <Upload.Dragger maxCount={1} beforeUpload={() => false}>
                        <p className="ant-upload-drag-icon"><InboxOutlined /></p>
                        <p className="ant-upload-text">点击或将营业执照拖拽到此区域上传</p>
                        <p className="ant-upload-hint">支持 JPG, PNG 格式，文件大小不超过 10MB</p>
                    </Upload.Dragger>
                </div>
            </Modal>
        </div >
    )
}

export default SettlementNew
