import React, { useState, useEffect } from 'react'
import { Table, Card, Button, Space, Tag, Modal, Form, Input, Select, message } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'

interface DataType {
    id: string
    name: string
    status: string
    category: string
    updatedAt: string
}

const Demo1: React.FC = () => {
    const [data, setData] = useState<DataType[]>([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [form] = Form.useForm()

    useEffect(() => {
        const storedData = localStorage.getItem('demo_data1')
        if (storedData) {
            setData(JSON.parse(storedData))
        }
    }, [])

    const handleAdd = () => {
        form.resetFields()
        setIsModalOpen(true)
    }

    const handleOk = () => {
        form.validateFields().then((values) => {
            const newData = [
                ...data,
                {
                    ...values,
                    id: Math.random().toString(36).substr(2, 9),
                    updatedAt: new Date().toISOString().split('T')[0],
                },
            ]
            setData(newData)
            localStorage.setItem('demo_data1', JSON.stringify(newData))
            setIsModalOpen(false)
            message.success('添加成功')
        })
    }

    const handleDelete = (id: string) => {
        const newData = data.filter((item) => item.id !== id)
        setData(newData)
        localStorage.setItem('demo_data1', JSON.stringify(newData))
        message.success('删除成功')
    }

    const columns = [
        {
            title: '名称',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => {
                const color = status === 'success' ? 'green' : 'orange'
                return <Tag color={color}>{status.toUpperCase()}</Tag>
            },
        },
        {
            title: '分类',
            dataIndex: 'category',
            key: 'category',
        },
        {
            title: '更新时间',
            dataIndex: 'updatedAt',
            key: 'updatedAt',
        },
        {
            title: '操作',
            key: 'action',
            render: (_: any, record: DataType) => (
                <Space size="middle">
                    <Button type="link" icon={<EditOutlined />}>编辑</Button>
                    <Button type="link" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)}>删除</Button>
                </Space>
            ),
        },
    ]

    return (
        <div>
            <Card
                title="数据列表"
                extra={
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                        新建
                    </Button>
                }
                bordered={false}
            >
                <Table columns={columns} dataSource={data} rowKey="id" />
            </Card>

            <Modal title="新建数据" open={isModalOpen} onOk={handleOk} onCancel={() => setIsModalOpen(false)}>
                <Form form={form} layout="vertical">
                    <Form.Item name="name" label="名称" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="status" label="状态" rules={[{ required: true }]}>
                        <Select>
                            <Select.Option value="success">Success</Select.Option>
                            <Select.Option value="processing">Processing</Select.Option>
                        </Select>
                    </Form.Item>
                    <Form.Item name="category" label="分类" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    )
}

export default Demo1
