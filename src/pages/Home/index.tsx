import React from 'react'
import { Typography, Card, Row, Col, Statistic, List, Tag } from 'antd'
import { InteractionOutlined, ShareAltOutlined, RocketOutlined } from '@ant-design/icons'

const { Title, Paragraph, Text } = Typography

const Home: React.FC = () => {
    const stats = [
        { title: '项目进度', value: 75, suffix: '%', icon: <RocketOutlined style={{ color: '#ff5050' }} /> },
        { title: '活跃用户', value: 1200, icon: <InteractionOutlined style={{ color: '#52c41a' }} /> },
        { title: '分享次数', value: 350, icon: <ShareAltOutlined style={{ color: '#faad14' }} /> },
    ]

    const features = [
        { title: '纯展示型', desc: '不依赖后端 API，使用 localStorage 进行数据存储' },
        { title: '数据文件化', desc: '从本地 JSON 文件加载静态数据，便于修改和维护' },
        { title: '自动初始化', desc: '服务启动时自动清理并加载数据，保证演示环境的一致性' },
        { title: '组件化', desc: '采用组件化开发模式，易于扩展' },
    ]

    return (
        <div>
            <div style={{ marginBottom: 32 }}>
                <Title level={2}>欢迎使用 OMS AntX Demo</Title>
                <Paragraph>
                    这是一个基于 React + TypeScript + Ant Design + Vite 的前端页面开发框架，主要用于快速编写和展示前端页面 Demo。
                </Paragraph>
            </div>

            <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
                {stats.map((item, index) => (
                    <Col span={8} key={index}>
                        <Card bordered={false}>
                            <Statistic
                                title={item.title}
                                value={item.value}
                                suffix={item.suffix}
                                prefix={item.icon}
                                valueStyle={{ color: '#3f3f3f' }}
                            />
                        </Card>
                    </Col>
                ))}
            </Row>

            <Card title="功能特性" bordered={false}>
                <List
                    grid={{ gutter: 16, column: 2 }}
                    dataSource={features}
                    renderItem={(item) => (
                        <List.Item>
                            <Card size="small" title={item.title}>
                                {item.desc}
                            </Card>
                        </List.Item>
                    )}
                />
            </Card>
        </div>
    )
}

export default Home
