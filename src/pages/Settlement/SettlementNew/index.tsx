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
    Divider,
    Modal,
    Cascader
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

    const handleUploadOk = () => {
        setUploadModalVisible(false)
        setAnalyzing(true)
        message.loading({ content: '正在智能识别营业执照...', key: 'analysis' })

        setTimeout(() => {
            form.setFieldsValue({
                companyName: '成都某某科技有限公司',
                socialCreditCode: '91510100MA6XXXXXXX',
                address: ['sichuan', 'chengdu', 'wuhou'],
                scale: '51-200人',
                industry: 'software',
                owner: '王五',
                contactName: '王小二',
                contactPhone: '13888888888',
                contactPosition: '技术总监'
            })
            message.success({ content: '识别成功，已自动填充相关信息', key: 'analysis' })
            setAnalyzing(false)
        }, 1500)
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
                address: values.address ? values.address.join('/') : '', // 为了简化，存为字符串
                cooperationStartDate: values.cooperationDate[0].format('YYYY-MM-DD'),
                cooperationEndDate: values.cooperationDate[1].format('YYYY-MM-DD'),
                applyTime: dayjs().format('YYYY-MM-DD'),
                auditStatus: 'pending',
                signContractUrl: '/contracts/example.pdf',
                businessLicenseUrl: '/licenses/example.jpg',
                owner: '张三', // 默认为当前创建者
                commissionRate: values.commissionType === '固定比例' ? Number(values.commissionRate) : undefined,
                commissionDescription: values.commissionType === '个性化' ? values.commissionDescription : undefined
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
                    <Button
                        icon={<RobotOutlined />}
                        onClick={startAnalysis}
                        loading={analyzing}
                    >
                        智能解析
                    </Button>
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
            </div>

            <Form
                form={form}
                layout="vertical"
                initialValues={{ commissionType: '阶梯等级' }}
            >
                {/* 基本信息 */}
                <Card title="基本信息" style={{ marginBottom: 24 }}>
                    <Row gutter={24}>
                        <Col span={12}>
                            <Form.Item
                                name="companyName"
                                label="公司全称"
                                validateTrigger="onBlur"
                                rules={[
                                    { required: true, message: '请填写公司全称' },
                                    { validator: checkDuplicateCompanyName }
                                ]}
                            >
                                <Input placeholder="需与公章一致" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="city" label="所在城市" rules={[{ required: true }]}>
                                <Select placeholder="请选择">
                                    <Option value="上海">上海</Option>
                                    <Option value="北京">北京</Option>
                                    <Option value="杭州">杭州</Option>
                                    <Option value="成都">成都</Option>
                                    <Option value="深圳">深圳</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="scale" label="公司人数规模" rules={[{ required: true }]}>
                                <Select placeholder="请选择">
                                    <Option value="1-50人">1-50人</Option>
                                    <Option value="51-200人">51-200人</Option>
                                    <Option value="201-500人">201-500人</Option>
                                    <Option value="501-1000人">501-1000人</Option>
                                    <Option value="1000人以上">1000人以上</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="industry" label="所属行业" rules={[{ required: true }]}>
                                <Select placeholder="请选择">
                                    <Option value="software">软件服务</Option>
                                    <Option value="retail">零售业</Option>
                                    <Option value="finance">金融服务</Option>
                                    <Option value="manufacture">制造业</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>
                </Card>

                {/* 联系信息 */}
                <Card title="联系信息" style={{ marginBottom: 24 }}>
                    <Row gutter={24}>
                        <Col span={8}>
                            <Form.Item name="contactName" label="联系人" rules={[{ required: true, max: 20 }]}>
                                <Input placeholder="最大 20 字符" />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                name="contactPhone"
                                label="联系电话"
                                rules={[{ required: true, pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' }]}
                            >
                                <Input placeholder="11 位手机号" />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="contactPosition" label="联系人职位" rules={[{ required: true }]}>
                                <Select placeholder="请选择职位">
                                    <Option value="CEO">CEO</Option>
                                    <Option value="HR负责人">HR负责人</Option>
                                    <Option value="销售负责人">销售负责人</Option>
                                    <Option value="IT负责人">IT负责人</Option>
                                    <Option value="市场负责人">市场负责人</Option>
                                    <Option value="CFO">CFO</Option>
                                    <Option value="其它">其它</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="contactEmail" label="联系邮箱" rules={[{ type: 'email', message: '格式错误' }]}>
                                <Input placeholder="用于接收电子账单" />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="referrer" label="推荐人" rules={[{ max: 20 }]}>
                                <Input placeholder="最大 20 字符" />
                            </Form.Item>
                        </Col>
                    </Row>
                </Card>

                {/* 合作信息 */}
                <Card title="合作信息" style={{ marginBottom: 24 }}>
                    <Row gutter={24}>
                        <Col span={8}>
                            <Form.Item name="contract" label="签约合同">
                                <Upload
                                    listType="picture"
                                    maxCount={1}
                                    beforeUpload={(file) => beforeUpload(file, 20)}
                                >
                                    <Button icon={<UploadOutlined />}>上传 PDF/图片</Button>
                                </Upload>
                                <Text type="secondary" style={{ fontSize: 12 }}>单个文件 ≤ 20MB</Text>
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="cooperationDate" label="合作周期" rules={[{ required: true, message: '请选择合作周期' }]}>
                                <RangePicker
                                    style={{ width: '100%' }}
                                    onChange={handleDateChange}
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                </Card>

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
                                                <Option value="阶梯等级">阶梯等级</Option>
                                                <Option value="固定比例">固定比例</Option>
                                                <Option value="个性化">个性化</Option>
                                            </Select>
                                        </Form.Item>
                                    </Col>

                                    {type === '阶梯等级' && (
                                        <Col span={16}>
                                            <div style={{ background: '#fafafa', padding: '12px 16px', borderRadius: 4, border: '1px solid #f0f0f0' }}>
                                                <Text strong style={{ color: '#ff5050' }}>系统固定阶梯规则：</Text>
                                                <div style={{ marginTop: 8, fontSize: 13, color: '#666' }}>
                                                    <Space size="large">
                                                        <span>🥉 铜牌：0 - 10万 (5%)</span>
                                                        <span>🥈 银牌：10万 - 50万 (8%)</span>
                                                        <span>🥇 金牌：50万以上 (12%)</span>
                                                    </Space>
                                                </div>
                                            </div>
                                        </Col>
                                    )}

                                    {type === '固定比例' && (
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

                                    {type === '个性化' && (
                                        <Col span={16}>
                                            <Form.Item
                                                name="commissionDescription"
                                                label="个性化说明"
                                                rules={[{ required: true, message: '请填写个性化说明' }, { max: 500 }]}
                                            >
                                                <TextArea rows={1} placeholder="请描述特殊分佣规则，最大 500 字符" />
                                            </Form.Item>
                                        </Col>
                                    )}
                                </Row>
                            )
                        }}
                    </Form.Item>
                </Card>

                {/* 工商信息 */}
                <Card title="工商信息" style={{ marginBottom: 24 }}>
                    <Row gutter={24}>
                        <Col span={8}>
                            <Form.Item name="businessLicense" label="营业执照副本">
                                <Upload
                                    listType="picture"
                                    maxCount={1}
                                    beforeUpload={(file) => beforeUpload(file, 10)}
                                >
                                    <Button icon={<UploadOutlined />}>上传图片</Button>
                                </Upload>
                                <Text type="secondary" style={{ fontSize: 12 }}>支持 JPG/PNG，不超过 10MB</Text>
                            </Form.Item>
                        </Col>
                        <Col span={16}>
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item name="socialCreditCode" label="统一社会信用代码">
                                        <Input placeholder="18位信用代码" />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item name="bankInfo" label="开户行及账号">
                                        <Input placeholder="选填" />
                                    </Form.Item>
                                </Col>
                                <Col span={24}>
                                    <Form.Item name="address" label="注册地址">
                                        <Cascader options={AREA_OPTIONS} placeholder="请选择省市区" />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                </Card>

                {/* 客户资源证明 */}
                <Card title="客户资源证明" style={{ marginBottom: 24 }}>
                    <Typography.Paragraph type="secondary">
                        可提报最多 20 个客户信息，用于入驻前的资源价值评估。
                    </Typography.Paragraph>
                    <Form.Item name="customerProof" label="初期提报客户盘点">
                        <TextArea rows={4} placeholder="请输入已成交或意向客户名称（每行一个）" />
                    </Form.Item>
                </Card>
            </Form>

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
            </Modal>
        </div>
    )
}

export default SettlementNew
