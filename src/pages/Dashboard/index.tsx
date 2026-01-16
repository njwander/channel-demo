import { FC } from 'react';
import { Row, Col, Spin, theme } from 'antd';
import { useDashboardData } from './hooks/useDashboardData';
import { WelcomeSection } from './components/WelcomeSection';
import { ToDoList } from './components/ToDoList';
import { MetricsCards } from './components/MetricsCards';
import { PerformanceChart } from './components/PerformanceChart';
import { ReportingFunnel } from './components/ReportingFunnel';
import { ActivityTimeline } from './components/ActivityTimeline';

/**
 * 工作台 Dashboard
 */
const Dashboard: FC = () => {
    const { data, loading } = useDashboardData();
    const { token } = theme.useToken();

    if (loading || !data) {
        return (
            <div style={{ padding: 48, textAlign: 'center' }}>
                <Spin size="large">
                    <div style={{ marginTop: 16 }}>加载中...</div>
                </Spin>
            </div>
        );
    }

    return (
        <div>
            <ToDoList todos={data.todos} />

            <MetricsCards metrics={data.metrics} />

            <Row gutter={24}>
                <Col span={12}>
                    <PerformanceChart
                        performance={data.performance}
                        ruleDistribution={data.ruleDistribution}
                    />
                </Col>
                <Col span={12}>
                    <ReportingFunnel funnel={data.funnel} />
                </Col>
            </Row>

            <ActivityTimeline activities={data.activities} />
        </div>
    );
}

export default Dashboard;
