import React, { useState, useEffect } from 'react'
import { Card, Steps, Descriptions, Progress, Row, Col, List, Typography } from 'antd'
import { RESPONSIVE_DESCRIPTIONS_COLUMN } from '../../utils/descriptionsConfig'

const { Title } = Typography

const Demo2: React.FC = () => {
    const [data, setData] = useState<any[]>([])

    useEffect(() => {
        const storedData = localStorage.getItem('demo_data2')
        if (storedData) {
            setData(JSON.parse(storedData))
        }
    }, [])

    return (
        <Space direction="vertical" size="large" style={{ display: 'flex' }}>
            <Card title="进展示例" bordered={false}>
                <Steps
                    current={1}
                    items={[
                        { title: '已完成', description: '项目启动' },
                        { title: '进行中', description: '基础框架搭建' },
                        { title: '待处理', description: '业务逻辑实现' },
                    ]}
                />
            </Card>

            <Row gutter={16}>
                <Col span={12}>
                    <Card title="项目详情" bordered={false}>
                        <Descriptions bordered={false} column={RESPONSIVE_DESCRIPTIONS_COLUMN} size="small">
                            <Descriptions.Item label="项目名称">OMS AntX Demo</Descriptions.Item>
                            <Descriptions.Item label="负责人">Admin</Descriptions.Item>
                            <Descriptions.Item label="创建时间">2024-01-01</Descriptions.Item>
                            <Descriptions.Item label="当前版本">v1.0.0</Descriptions.Item>
                            <Descriptions.Item label="状态">运行中</Descriptions.Item>
                            <Descriptions.Item label="备注">无</Descriptions.Item>
                        </Descriptions>
                    </Card>
                </Col>
                <Col span={12}>
                    <Card title="资源占用" bordered={false}>
                        <div style={{ padding: '20px 0' }}>
                            <div style={{ marginBottom: 16 }}>
                                <span>CPU 使用率</span>
                                <Progress percent={30} status="active" strokeColor="#ff5050" />
                            </div>
                            <div>
                                <span>内存 使用率</span>
                                <Progress percent={70} status="active" strokeColor="#faad14" />
                            </div>
                        </div>
                    </Card>
                </Col>
            </Row>

            <Card title="任务列表" bordered={false}>
                <List
                    itemLayout="horizontal"
                    dataSource={data}
                    renderItem={(item) => (
                        <List.Item
                            extra={<Progress type="circle" percent={item.progress} width={40} strokeColor={item.priority === 'high' ? '#ff5050' : '#1890ff'} />}
                        >
                            <List.Item.Meta
                                title={item.title}
                                description={`优先级: ${item.priority.toUpperCase()}`}
                            />
                        </List.Item>
                    )}
                />
            </Card>
        </Space>
    )
}

// Fixed missing import
import { Space } from 'antd'

export default Demo2
