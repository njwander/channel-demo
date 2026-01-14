import React, { useState, useEffect } from 'react';
import { Card, Typography, Row, Col, Statistic, Button, Tabs, Form, Input, Select, DatePicker, Table, Tag, Modal, Space, Checkbox, message } from 'antd';
import { SearchOutlined, ReloadOutlined, ExportOutlined, ImportOutlined, CheckCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

// Define interfaces based on functionality
interface Order {
    id: string;
    contractNo: string;
    orderNo: string;
    channelName: string;
    customerName: string;
    productName: string;
    orderAmount: number;
    returnDate: string;
    returnAmount: number;
    channelRate: number;
    commissionAmount: number;
    salesRep: string;
    salesStatus: 'Pending' | 'Confirmed' | 'Objection';
    channelContact: string;
    channelStatus: 'Pending' | 'Confirmed' | 'Objection';
    status: 'Pending' | 'SalesConfirmed' | 'ChannelConfirmed' | 'BothConfirmed' | 'ManualReview' | 'Objection';
    objectionReason?: string;
}

const OrderReconciliation: React.FC = () => {
    // State management
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('all');
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

    // Load data from localStorage or mock
    useEffect(() => {
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            const storedData = localStorage.getItem('reconciliationData');
            if (storedData) {
                setOrders(JSON.parse(storedData));
            } else {
                // Fallback to loading from json if not in localstorage (though it should be initialized)
                import('../../../data/reconciliation.json').then(data => {
                    setOrders(data.default as any); // Cast for simplicity in this demo
                });
            }
            setLoading(false);
        }, 500);
    }, []);

    // Filter logic
    const getFilteredOrders = () => {
        if (activeTab === 'all') return orders;
        if (activeTab === 'pendingSales') return orders.filter(o => o.salesStatus === 'Pending');
        if (activeTab === 'pendingChannel') return orders.filter(o => o.channelStatus === 'Pending');
        if (activeTab === 'confirmed') return orders.filter(o => o.status === 'BothConfirmed');
        if (activeTab === 'manual') return orders.filter(o => o.status === 'ManualReview');
        return orders;
    };

    // Statistics calculation
    const stats = {
        pending: orders.filter(o => o.status === 'Pending').length,
        salesConfirmed: orders.filter(o => o.salesStatus === 'Confirmed' && o.channelStatus !== 'Confirmed').length,
        channelConfirmed: orders.filter(o => o.channelStatus === 'Confirmed' && o.salesStatus !== 'Confirmed').length,
        confirmed: orders.filter(o => o.status === 'BothConfirmed').length,
        manual: orders.filter(o => o.status === 'ManualReview').length,
    };

    // Table Columns
    const columns: ColumnsType<Order> = [
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
            title: '合同/订单编号',
            key: 'nos',
            render: (_, record) => (
                <Space direction="vertical" size="small">
                    <Text>{record.contractNo}</Text>
                    <Text type="secondary">{record.orderNo}</Text>
                </Space>
            ),
        },
        {
            title: '订单产品',
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
            title: '回款金额',
            dataIndex: 'returnAmount',
            key: 'returnAmount',
            render: (val) => `¥${val.toLocaleString()}`,
        },
        {
            title: '销售确认',
            dataIndex: 'salesStatus',
            key: 'salesStatus',
            render: (status) => {
                if (status === 'Confirmed') return <Tag color="success" icon={<CheckCircleOutlined />}>已确认</Tag>;
                if (status === 'Objection') return <Tag color="error" icon={<ExclamationCircleOutlined />}>有异议</Tag>;
                return <Tag color="warning">待确认</Tag>;
            }
        },
        {
            title: '渠道确认',
            dataIndex: 'channelStatus',
            key: 'channelStatus',
            render: (status) => {
                if (status === 'Confirmed') return <Tag color="success" icon={<CheckCircleOutlined />}>已确认</Tag>;
                if (status === 'Objection') return <Tag color="error" icon={<ExclamationCircleOutlined />}>有异议</Tag>;
                return <Tag color="warning">待确认</Tag>;
            }
        },
        {
            title: '核对状态',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                const map: Record<string, JSX.Element> = {
                    'Pending': <Tag>待核对</Tag>,
                    'SalesConfirmed': <Tag color="blue">销售已确认</Tag>,
                    'ChannelConfirmed': <Tag color="cyan">渠道已确认</Tag>,
                    'BothConfirmed': <Tag color="green">双方已确认</Tag>,
                    'ManualReview': <Tag color="red">需人工处理</Tag>,
                    'Objection': <Tag color="volcano">有异议</Tag>
                };
                return map[status] || <Tag>{status}</Tag>;
            }
        },
        {
            title: '操作',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <a onClick={() => message.info('查看详情功能开发中')}>查看详情</a>
                </Space>
            ),
        },
    ];

    // Bulk Confirm Handler
    const handleBulkConfirm = () => {
        Modal.confirm({
            title: '确认批量通过?',
            content: `将自动标记选中的 ${selectedRowKeys.length} 条订单为"双方确认通过"`,
            onOk: () => {
                message.success('批量确认成功');
                setSelectedRowKeys([]);
            }
        });
    };

    return (
        <div style={{ padding: '24px' }}>
            <Card style={{ marginBottom: 24 }}>
                <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
                    <Col>
                        <Title level={4} style={{ margin: 0 }}>渠道订单核对</Title>
                    </Col>
                    <Col>
                        <Space>
                            <span>结算周期：</span>
                            <Select defaultValue="2025-12" style={{ width: 120 }}>
                                <Option value="2025-12">2025年12月</Option>
                                <Option value="2025-11">2025年11月</Option>
                            </Select>
                            <Button icon={<ExportOutlined />}>导出核对清单</Button>
                        </Space>
                    </Col>
                </Row>

                {/* Progress Overview */}
                <Card type="inner" title="📊 核对进度概览" style={{ marginBottom: 24, backgroundColor: '#f5f5f5' }}>
                    <Row gutter={16} justify="space-around">
                        <Col span={4}><Statistic title="待核对订单" value={stats.pending} suffix="单" /></Col>
                        <Col span={4}><Statistic title="销售已确认" value={stats.salesConfirmed} suffix="单" valueStyle={{ color: '#1890ff' }} /></Col>
                        <Col span={4}><Statistic title="渠道已确认" value={stats.channelConfirmed} suffix="单" valueStyle={{ color: '#13c2c2' }} /></Col>
                        <Col span={4}><Statistic title="双方确认通过" value={stats.confirmed} suffix="单" valueStyle={{ color: '#52c41a' }} /></Col>
                        <Col span={4}><Statistic title="需人工处理" value={stats.manual} suffix="单" valueStyle={{ color: '#cf1322' }} /></Col>
                    </Row>
                </Card>

                {/* Filters */}
                <Tabs
                    activeKey={activeTab}
                    onChange={setActiveTab}
                    items={[
                        { key: 'all', label: `全部订单 (${orders.length})` },
                        { key: 'pendingSales', label: '待销售确认' },
                        { key: 'pendingChannel', label: '待渠道确认' },
                        { key: 'confirmed', label: '双方已确认' },
                        { key: 'manual', label: '需人工处理' },
                    ]}
                />

                {/* Query Form */}
                <Form layout="inline" style={{ marginBottom: 24 }}>
                    <Form.Item label="渠道名称" name="channel">
                        <Input placeholder="输入渠道名称" />
                    </Form.Item>
                    <Form.Item label="销售" name="sales">
                        <Select placeholder="选择销售" style={{ width: 120 }}>
                            <Option value="all">全部</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item label="核对状态" name="status">
                        <Select placeholder="全部" style={{ width: 120 }}>
                            <Option value="all">全部</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item label="回款日期">
                        <RangePicker />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" icon={<SearchOutlined />}>查询</Button>
                        <Button style={{ marginLeft: 8 }} icon={<ReloadOutlined />}>重置</Button>
                    </Form.Item>
                </Form>

                {/* Operations */}
                <div style={{ marginBottom: 16 }}>
                    <Space>
                        <Button type="primary" disabled={selectedRowKeys.length === 0} onClick={handleBulkConfirm}>批量确认通过</Button>
                        <Button icon={<ImportOutlined />}>导入渠道确认</Button>
                    </Space>
                </div>

                {/* Table */}
                <Table
                    rowKey="id"
                    columns={columns}
                    dataSource={getFilteredOrders()}
                    loading={loading}
                    rowSelection={{
                        selectedRowKeys,
                        onChange: setSelectedRowKeys,
                    }}
                    pagination={{ pageSize: 10 }}
                />

            </Card>
        </div>
    );
};

export default OrderReconciliation;
