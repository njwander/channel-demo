import { FC } from 'react';
import { Card, Col, Row, Statistic, theme } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';

interface MetricsCardsProps {
    metrics: {
        channels: {
            total: number;
            active: number;
            expiring: number;
            newThisMonth: number;
        };
        reports: {
            total: number;
            protected: number;
            converted: number;
            newThisMonth: number;
        };
    };
}

export const MetricsCards: FC<MetricsCardsProps> = ({ metrics }) => {
    const { token } = theme.useToken();

    const cardStyle = {
        borderRadius: token.borderRadiusLG,
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)'
    };

    return (
        <div style={{ marginBottom: 24 }}>
            <Row gutter={[16, 16]}>
                {/* Channel Metrics */}
                <Col span={6}>
                    <Card bordered={false} style={cardStyle}>
                        <Statistic title="负责渠道数" value={metrics.channels.total} />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card bordered={false} style={cardStyle}>
                        <Statistic title="合作中渠道" value={metrics.channels.active} />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card bordered={false} style={cardStyle}>
                        <Statistic
                            title="即将到期"
                            value={metrics.channels.expiring}
                            valueStyle={{ color: metrics.channels.expiring > 0 ? '#cf1322' : 'inherit' }}
                            prefix={metrics.channels.expiring > 0 ? <ArrowDownOutlined /> : null}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card bordered={false} style={cardStyle}>
                        <Statistic title="本月新入驻" value={metrics.channels.newThisMonth} prefix={<ArrowUpOutlined style={{ color: '#52c41a' }} />} />
                    </Card>
                </Col>

                {/* Reporting Metrics */}
                <Col span={6}>
                    <Card bordered={false} style={cardStyle}>
                        <Statistic title="报备客户总数" value={metrics.reports.total} />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card bordered={false} style={cardStyle}>
                        <Statistic title="保护期内" value={metrics.reports.protected} />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card bordered={false} style={cardStyle}>
                        <Statistic
                            title="已转化"
                            value={metrics.reports.converted}
                            valueStyle={{ color: '#3f8600' }}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card bordered={false} style={cardStyle}>
                        <Statistic title="本月新增报备" value={metrics.reports.newThisMonth} prefix={<ArrowUpOutlined style={{ color: '#52c41a' }} />} />
                    </Card>
                </Col>
            </Row>
        </div>
    );
};
