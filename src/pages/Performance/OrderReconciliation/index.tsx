import React, { useState, useEffect } from 'react';
import { Card, Typography, Row, Col, Button, Tabs, Form, Input, Select, DatePicker, Table, Tag, Modal, Space, message } from 'antd';
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
            title: '订单产品',
            dataIndex: 'productName',
            key: 'productName',
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
