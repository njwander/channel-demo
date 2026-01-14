import React, { useState, useEffect } from 'react';
import { Card, Typography, Row, Col, Statistic, Button, Tabs, Form, Input, Select, Table, Tag, Modal, Space, Alert, message, Divider, Tooltip } from 'antd';
import { SearchOutlined, ReloadOutlined, CheckCircleOutlined, CloseCircleOutlined, LockOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text } = Typography;
const { Option } = Select;

// Define interfaces based on functionality
interface Order {
    id: string;
    contractNo: string;
    orderNo: string;
    channelName: string;
    customerName?: string;
    productName: string;
    orderAmount: number;
    // performanceAmount?: number; // Removed
    // calculationType?: 'Normal' | 'CommissionOnly'; // Removed
    returnDate: string;
    returnAmount: number;
    channelRate: number;
    commissionAmount: number;
    salesRep: string;
    salesStatus: 'Pending' | 'Confirmed' | 'Objection';
    channelStatus: 'Pending' | 'Confirmed' | 'Objection';
    status: 'Pending' | 'SalesConfirmed' | 'ChannelConfirmed' | 'BothConfirmed' | 'ManualReview' | 'Objection';
    objectionReason?: string;
    adjustmentReason?: string;
}

const { TextArea } = Input;

// ... imports
interface MonthlySettlement {
    id: string
    cycle: string
    channelName: string
    isReconciled?: boolean
}

const SalesOrderReconciliation: React.FC = () => {
    // State management
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('all');
    const [detailVisible, setDetailVisible] = useState(false);
    const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
    const [reconciledChannels, setReconciledChannels] = useState<Set<string>>(new Set());
    const [currentCycle, setCurrentCycle] = useState('2026-01');

    // Objection Modal State
    const [objectionVisible, setObjectionVisible] = useState(false);
    const [objectionForm] = Form.useForm();


    // Load data from localStorage or mock
    useEffect(() => {
        setLoading(true);
        // Simulate API call and filter for current sales rep (simulated)
        setTimeout(() => {
            const storedData = localStorage.getItem('reconciliationData');
            let allOrders: Order[] = [];
            if (storedData) {
                allOrders = JSON.parse(storedData);
            } else {
                import('../../../data/reconciliation.json').then(data => {
                    // Cast and load
                    allOrders = data.default as any;
                    setOrders(allOrders);
                });
            }
            if (storedData) { // If loaded from local storage we set it here
                setOrders(allOrders);
            }

            // Load settlement data to check for reconciled channels
            const settlementData = localStorage.getItem('monthly_settlements');
            if (settlementData) {
                const settlements: MonthlySettlement[] = JSON.parse(settlementData);
                const locked = new Set(
                    settlements
                        .filter(s => s.cycle === currentCycle && s.isReconciled)
                        .map(s => s.channelName)
                );
                setReconciledChannels(locked);
            }

            setLoading(false);
        }, 500);
    }, [currentCycle]);

    // Filter logic
    const getFilteredOrders = () => {
        let filtered = orders;
        // In a real app, we would filter by the logged-in sales rep here.

        if (activeTab === 'pending') filtered = filtered.filter(o => o.salesStatus === 'Pending');
        if (activeTab === 'confirmed') filtered = filtered.filter(o => o.salesStatus === 'Confirmed');
        if (activeTab === 'objection') filtered = filtered.filter(o => o.salesStatus === 'Objection');

        return filtered;
    };

    const filteredOrders = getFilteredOrders();

    // Statistics calculation
    const stats = {
        pendingCount: orders.filter(o => o.salesStatus === 'Pending').length,
        confirmedCount: orders.filter(o => o.salesStatus === 'Confirmed').length,
        objectionCount: orders.filter(o => o.salesStatus === 'Objection').length,
        totalAmount: orders.reduce((sum, o) => sum + o.orderAmount, 0),
        // performanceAmount and commissionAmount removed as per requirement
    };

    // Actions
    const handleConfirm = (order: Order) => {
        Modal.confirm({
            title: '确认订单无误?',
            content: `订单 ${order.orderNo} 将被标记为已确认`,
            onOk: () => {
                const newOrders = orders.map(o => o.id === order.id ? { ...o, salesStatus: 'Confirmed' as const } : o);
                setOrders(newOrders);
                message.success('已确认');
                // typically update backend/localstorage here
                if (detailVisible) setDetailVisible(false);
            }
        })
    };

    const handleObjectionClick = (order: Order) => {
        setCurrentOrder(order);
        setObjectionVisible(true);
        objectionForm.resetFields();
    };

    const handleObjectionSubmit = () => {
        objectionForm.validateFields().then(values => {
            if (!currentOrder) return;

            const newOrders = orders.map(o => o.id === currentOrder.id ? {
                ...o,
                salesStatus: 'Objection' as const,
                objectionReason: `${values.reason}: ${values.description}`
            } : o);

            setOrders(newOrders);
            message.success('已提交异议');
            setObjectionVisible(false);
            if (detailVisible) setDetailVisible(false);
        });
    };


    const handleBatchConfirm = () => {
        Modal.confirm({
            title: '一键全部确认?',
            content: `当前待核对的 ${stats.pendingCount} 条订单将被确认为无误`,
            onOk: () => {
                const newOrders = orders.map(o => o.salesStatus === 'Pending' ? { ...o, salesStatus: 'Confirmed' as const } : o);
                setOrders(newOrders);
                message.success('批量确认成功');
            }
        });
    }

    // Table Columns
    const columns: ColumnsType<Order> = [
        {
            title: '序号',
            render: (_text, _record, index) => index + 1,
            width: 60,
        },
        {
            title: '渠道名称',
            dataIndex: 'channelName',
            key: 'channelName',
        },
        {
            title: '客户名称',
            dataIndex: 'customerName',
            key: 'customerName',
        },
        {
            title: '订单编号',
            dataIndex: 'orderNo',
            key: 'orderNo',
        },
        {
            title: '商品名称',
            dataIndex: 'productName',
            key: 'productName',
        },
        {
            title: '订单金额',
            dataIndex: 'orderAmount',
            key: 'orderAmount',
            render: (val) => `¥${val.toLocaleString()}`,
        },
        {
            title: '回款日期',
            dataIndex: 'returnDate',
            key: 'returnDate',
        },
        {
            title: '周期回款金额',
            dataIndex: 'returnAmount',
            key: 'returnAmount',
            render: (val) => `¥${val.toLocaleString()}`,
        },
        {
            title: '核对状态',
            dataIndex: 'salesStatus',
            key: 'salesStatus',
            render: (status, record) => {
                if (status === 'Confirmed') return <Tag color="success">✅ 已确认</Tag>;
                if (status === 'Objection') return <Tag color="error">❌ 有异议</Tag>;
                if (reconciledChannels.has(record.channelName)) return <Tag color="purple" icon={<LockOutlined />}>已锁定</Tag>;
                return <Tag color="warning">⏳ 待核对</Tag>;
            }
        },
        {
            title: '操作',
            key: 'action',
            render: (_, record) => (
                <Space size="small">
                    <a onClick={() => { setCurrentOrder(record); setDetailVisible(true); }}>详情</a>
                    {record.salesStatus === 'Pending' && (
                        reconciledChannels.has(record.channelName) ? (
                            <Tooltip title="该渠道本月已锁定结算，无法变更">
                                <span style={{ color: '#ccc', cursor: 'not-allowed' }}>已锁定</span>
                            </Tooltip>
                        ) : (
                            <>
                                <Divider type="vertical" />
                                <a onClick={() => handleConfirm(record)}>确认</a>
                                <Divider type="vertical" />
                                <a onClick={() => handleObjectionClick(record)} style={{ color: '#ff4d4f' }}>有异议</a>
                            </>
                        )
                    )}
                </Space>
            ),
        },
    ];

    return (
        <div style={{ padding: '24px' }}>
            <Card style={{ marginBottom: 24 }}>
                <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
                    <Col>
                        <Title level={4} style={{ margin: 0 }}>销售订单核对</Title>
                    </Col>
                    <Col>
                        <Space>
                            <span>结算周期：</span>
                            <Select defaultValue="2026-01" style={{ width: 120 }} onChange={setCurrentCycle}>
                                <Option value="2026-01">2026年01月</Option>
                            </Select>
                        </Space>
                    </Col>
                </Row>

                {/* Summary Stats */}
                <Card type="inner" title="📊 本月核对汇总" style={{ marginBottom: 24, backgroundColor: '#f9f9f9' }}>
                    <Row gutter={24} justify="space-around" style={{ textAlign: 'center' }}>
                        <Col span={4}>
                            <Statistic title="待核对" value={stats.pendingCount} suffix="单" valueStyle={{ color: '#faad14' }} />
                        </Col>
                        <Col span={4}>
                            <Statistic title="已确认" value={stats.confirmedCount} suffix="单" valueStyle={{ color: '#52c41a' }} />
                        </Col>
                        <Col span={4}>
                            <Statistic title="有异议" value={stats.objectionCount} suffix="单" valueStyle={{ color: '#ff4d4f' }} />
                        </Col>
                    </Row>
                </Card>

                <Alert
                    message="请核对以下订单信息，确认无误后点击'确认'，如有异议请点击'异议'并填写原因"
                    type="warning"
                    showIcon
                    style={{ marginBottom: 24 }}
                />

                {/* Filter Tabs & Quick Actions */}
                <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
                    <Col>
                        <Tabs
                            activeKey={activeTab}
                            onChange={setActiveTab}
                            items={[
                                { key: 'all', label: `全部 ${orders.length}` },
                                { key: 'pending', label: `待核对 ${stats.pendingCount}` },
                                { key: 'confirmed', label: `已确认 ${stats.confirmedCount}` },
                                { key: 'objection', label: `有异议 ${stats.objectionCount}` },
                            ]}
                        />
                    </Col>
                    <Col>
                        <Button type="primary" onClick={handleBatchConfirm} disabled={stats.pendingCount === 0}>一键全部确认</Button>
                    </Col>
                </Row>

                {/* Query Form */}
                <Form layout="inline" style={{ marginBottom: 24, padding: '16px', background: '#f5f5f5', borderRadius: '4px' }}>
                    <Form.Item label="渠道名称" name="channel">
                        <Input placeholder="输入渠道名称" />
                    </Form.Item>
                    <Form.Item label="客户名称" name="customer">
                        <Input placeholder="输入客户名称" />
                    </Form.Item>
                    <Form.Item label="计算类型" name="type">
                        <Select placeholder="全部" style={{ width: 120 }}>
                            <Option value="all">全部</Option>
                            <Option value="normal">正常计算</Option>
                            <Option value="commission">仅计提成</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item>
                        <Space>
                            <Button type="primary" icon={<SearchOutlined />}>查询</Button>
                            <Button icon={<ReloadOutlined />}>重置</Button>
                        </Space>
                    </Form.Item>
                </Form>

                {/* Table */}
                <Table
                    rowKey="id"
                    columns={columns}
                    dataSource={filteredOrders}
                    loading={loading}
                    pagination={{ pageSize: 10, showTotal: total => `共 ${total} 条` }}
                />
            </Card>

            {/* Detail Modal */}
            <Modal
                title="订单详情"
                open={detailVisible}
                onCancel={() => setDetailVisible(false)}
                footer={null}
                width={700}
            >
                {currentOrder && (
                    <div style={{ padding: '0 12px' }}>
                        <Title level={5} style={{ marginTop: 0 }}>订单基本信息</Title>
                        <Card size="small" style={{ marginBottom: 16 }}>
                            <Row gutter={[24, 12]}>
                                <Col span={12}><Text type="secondary">订单编号：</Text>{currentOrder.orderNo}</Col>
                                <Col span={12}><Text type="secondary">合同编号：</Text>{currentOrder.contractNo}</Col>
                                <Col span={12}><Text type="secondary">渠道名称：</Text>{currentOrder.channelName}</Col>
                                <Col span={12}><Text type="secondary">客户名称：</Text>{currentOrder.customerName || '-'}</Col>
                                <Col span={12}><Text type="secondary">订单产品：</Text>{currentOrder.productName}</Col>
                                <Col span={12}><Text type="secondary">订单金额：</Text>¥{currentOrder.orderAmount.toLocaleString()}</Col>
                                <Col span={12}><Text type="secondary">回款日期：</Text>{currentOrder.returnDate}</Col>
                                <Col span={12}><Text type="secondary">回款金额：</Text>¥{currentOrder.returnAmount.toLocaleString()}</Col>
                            </Row>
                        </Card>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Title level={5}>销售核对信息</Title>
                        </div>
                        <Card size="small" style={{ marginBottom: 16 }}>
                            <Row gutter={[24, 12]}>
                                <Col span={12}><Text type="secondary">订单金额：</Text>¥{currentOrder.orderAmount.toLocaleString()}</Col>
                                <Col span={12}><Text type="secondary">周期回款金额：</Text>¥{currentOrder.returnAmount.toLocaleString()}</Col>
                            </Row>
                        </Card>

                        <Title level={5}>核对操作</Title>
                        <Card size="small" style={{ backgroundColor: '#f9f9f9' }}>
                            <Row align="middle" justify="space-between">
                                <Col>
                                    当前状态：
                                    {currentOrder.salesStatus === 'Pending' ? <Tag color="warning">⏳ 待核对</Tag> :
                                        currentOrder.salesStatus === 'Confirmed' ? <Tag color="success">✅ 已确认</Tag> :
                                            <Tag color="error">❌ 有异议</Tag>}
                                </Col>
                                <Col>
                                    {currentOrder.salesStatus === 'Pending' && (
                                        reconciledChannels.has(currentOrder.channelName) ? (
                                            <Alert message="该渠道已锁定结算，无法操作" type="warning" showIcon style={{ marginBottom: 0 }} />
                                        ) : (
                                            <Space>
                                                <Button type="primary" icon={<CheckCircleOutlined />} onClick={() => handleConfirm(currentOrder)}>确认无误</Button>
                                                <Button danger icon={<CloseCircleOutlined />} onClick={() => handleObjectionClick(currentOrder)}>有异议</Button>
                                            </Space>
                                        )
                                    )}
                                </Col>
                            </Row>
                        </Card>
                    </div>
                )}
            </Modal>

            {/* Objection Modal */}
            <Modal
                title="提起异议"
                open={objectionVisible}
                onOk={handleObjectionSubmit}
                onCancel={() => setObjectionVisible(false)}
                okText="提交异议"
                cancelText="取消"
            >
                <Form form={objectionForm} layout="vertical">
                    <Alert
                        message="提交异议后，该订单将进入'需人工处理'状态，由渠道负责人进行核实。"
                        type="info"
                        showIcon
                        style={{ marginBottom: 16 }}
                    />
                    <Form.Item name="reason" label="异议类型" rules={[{ required: true, message: '请选择异议类型' }]}>
                        <Select placeholder="请选择">
                            <Option value="订单金额有误">订单金额有误</Option>
                            <Option value="回款金额有误">回款金额有误</Option>
                            <Option value="渠道归属有误">渠道归属有误</Option>
                            <Option value="计算类型有误">计算类型有误</Option>
                            <Option value="分佣比例有误">分佣比例有误</Option>
                            <Option value="其他">其他</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item name="description" label="异议说明" rules={[{ required: true, message: '请填写异议说明' }]}>
                        <TextArea rows={4} placeholder="请详细说明异议原因，以便快速核实" maxLength={500} showCount />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default SalesOrderReconciliation;
