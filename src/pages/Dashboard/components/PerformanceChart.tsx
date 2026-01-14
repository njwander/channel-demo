import { FC } from 'react';
import { Card, Col, Row, Typography, Progress, Space } from 'antd';

const { Text } = Typography;

interface PerformanceChartProps {
    performance: {
        channelName: string;
        amount: number;
        level?: string;
    }[];
    channelLevels: {
        gold: number;
        silver: number;
        bronze: number;
    };
}

export const PerformanceChart: FC<PerformanceChartProps> = ({ performance, channelLevels }) => {
    const maxAmount = Math.max(...performance.map(p => p.amount), 1);

    // Calculate percentages for donut chart
    const totalLevels = channelLevels.gold + channelLevels.silver + channelLevels.bronze;
    const goldP = totalLevels ? (channelLevels.gold / totalLevels) * 100 : 0;
    const silverP = totalLevels ? (channelLevels.silver / totalLevels) * 100 : 0;

    // Create conic-gradient string for donut chart
    // Gold starts at 0
    // Silver starts at gold
    // Bronze starts at gold + silver
    const donutStyle = {
        width: '160px',
        height: '160px',
        borderRadius: '50%',
        background: totalLevels === 0
            ? '#f0f0f0'
            : `conic-gradient(
            #faad14 0% ${goldP}%,
            #d9d9d9 ${goldP}% ${goldP + silverP}%,
            #b8741a ${goldP + silverP}% 100%
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
                <Card title="渠道业绩概览 (Top 5)" bordered={false} bodyStyle={{ height: 300, overflowY: 'auto' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {performance.map(item => (
                            <div key={item.channelName}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                    <Text strong>{item.channelName}</Text>
                                    <Text>{(item.amount / 10000).toFixed(1)}万</Text>
                                </div>
                                <Progress percent={(item.amount / maxAmount) * 100} showInfo={false} strokeColor="#1890ff" />
                            </div>
                        ))}
                        {performance.length === 0 && <Text type="secondary">暂无业绩数据</Text>}
                    </div>
                </Card>
            </Col>
            <Col span={10}>
                <Card title="渠道等级分布" bordered={false} bodyStyle={{ height: 300, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={donutStyle}>
                        <div style={holeStyle} />
                    </div>
                    <Space style={{ marginTop: 24 }}>
                        <Space><div style={{ width: 8, height: 8, background: '#faad14', borderRadius: '50%' }} /> 金牌 {channelLevels.gold}</Space>
                        <Space><div style={{ width: 8, height: 8, background: '#d9d9d9', borderRadius: '50%' }} /> 银牌 {channelLevels.silver}</Space>
                        <Space><div style={{ width: 8, height: 8, background: '#b8741a', borderRadius: '50%' }} /> 铜牌 {channelLevels.bronze}</Space>
                    </Space>
                </Card>
            </Col>
        </Row>
    );
};
