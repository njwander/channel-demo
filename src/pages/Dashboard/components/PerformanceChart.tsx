import { FC } from 'react';
import { Card, Col, Row, Typography, Progress, Space } from 'antd';

const { Text } = Typography;

interface PerformanceChartProps {
    performance: {
        channelName: string;
        amount: number;
    }[];
    ruleDistribution: {
        ladder: number;
        fixed: number;
        personalized: number;
    };
}

export const PerformanceChart: FC<PerformanceChartProps> = ({ performance = [], ruleDistribution = { ladder: 0, fixed: 0, personalized: 0 } }) => {
    const maxAmount = Math.max(...performance.map(p => p.amount), 1);

    // Calculate percentages for donut chart
    const totalRules = ruleDistribution.ladder + ruleDistribution.fixed + ruleDistribution.personalized;
    const ladderP = totalRules ? (ruleDistribution.ladder / totalRules) * 100 : 0;
    const fixedP = totalRules ? (ruleDistribution.fixed / totalRules) * 100 : 0;

    const donutStyle = {
        width: '160px',
        height: '160px',
        borderRadius: '50%',
        background: totalRules === 0
            ? '#f0f0f0'
            : `conic-gradient(
            #ff4d4f 0% ${ladderP}%,
            #1890ff ${ladderP}% ${ladderP + fixedP}%,
            #b37feb ${ladderP + fixedP}% 100%
        )`,
        position: 'relative' as const,
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    };

    const holeStyle = {
        width: '100px',
        height: '100px',
        borderRadius: '50%',
        background: '#fff',
        position: 'absolute' as const,
    };

    return (
        <Row gutter={24} style={{ marginBottom: 24 }}>
            <Col span={14}>
                <Card title="渠道业绩概览 (Top 5)" variant="borderless" styles={{ body: { height: 300, overflowY: 'auto' } }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {performance.map(item => (
                            <div key={item.channelName}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                    <Text strong>{item.channelName}</Text>
                                    <Text>{(item.amount / 10000).toFixed(1)}万</Text>
                                </div>
                                <Progress percent={(item.amount / maxAmount) * 100} showInfo={false} strokeColor="#ff5050" />
                            </div>
                        ))}
                        {performance.length === 0 && <Text type="secondary">暂无业绩数据</Text>}
                    </div>
                </Card>
            </Col>
            <Col span={10}>
                <Card title="分佣规则分布" variant="borderless" styles={{ body: { height: 300, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' } }}>
                    <div style={donutStyle}>
                        <div style={holeStyle} />
                    </div>
                    <Space direction="vertical" style={{ marginTop: 16 }}>
                        <Space><div style={{ width: 8, height: 8, background: '#ff4d4f', borderRadius: '50%' }} /> 阶梯分佣 {ruleDistribution.ladder}</Space>
                        <Space><div style={{ width: 8, height: 8, background: '#1890ff', borderRadius: '50%' }} /> 固定分佣 {ruleDistribution.fixed}</Space>
                        <Space><div style={{ width: 8, height: 8, background: '#b37feb', borderRadius: '50%' }} /> 协议分佣 {ruleDistribution.personalized}</Space>
                    </Space>
                </Card>
            </Col>
        </Row>
    );
};
