import { FC } from 'react';
import { Card, Typography, Tooltip } from 'antd';

const { Text } = Typography;

interface ReportingFunnelProps {
    funnel: {
        total: number;
        following: number;
        linked: number;
        opportunity: number;
        deal: number;
        signed: number;
        paid: number;
    };
}

export const ReportingFunnel: FC<ReportingFunnelProps> = ({ funnel }) => {
    const maxVal = Math.max(funnel.total, 1);

    const stages = [
        { label: '总报备', value: funnel.total, color: '#5b8ff9' },
        { label: '跟进中', value: funnel.following, color: '#5ad8a6' },
        { label: '关联客户', value: funnel.linked, color: '#5d7092' },
        { label: '商机中', value: funnel.opportunity, color: '#f6bd16' },
        { label: '已成单', value: funnel.deal, color: '#e8684a' },
        { label: '已签约', value: funnel.signed, color: '#6dc8ec' },
        { label: '已回款', value: funnel.paid, color: '#9270ca' },
    ];

    const conversionRate = funnel.total > 0 ? ((funnel.signed / funnel.total) * 100).toFixed(1) : '0.0';

    return (
        <Card title="报备转化漏斗" extra={<Text type="secondary">整体转化率: {conversionRate}%</Text>} bordered={false} bodyStyle={{ height: 300, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                {stages.map((stage, index) => {
                    const widthPercent = (stage.value / maxVal) * 100;
                    // Ensure a minimum width for visibility even if value is small but non-zero, or just for design
                    const displayWidth = Math.max(widthPercent, 10);

                    return (
                        <div key={stage.label} style={{ width: '80%', marginBottom: 12, display: 'flex', alignItems: 'center' }}>
                            <div style={{ width: 80, textAlign: 'right', marginRight: 12 }}>
                                <Text>{stage.label}</Text>
                            </div>
                            <Tooltip title={`${stage.label}: ${stage.value}`}>
                                <div
                                    style={{
                                        width: `${displayWidth}%`,
                                        height: 24,
                                        background: stage.color,
                                        borderRadius: 4,
                                        transition: 'width 0.5s ease',
                                        display: 'flex',
                                        alignItems: 'center',
                                        paddingLeft: 8,
                                        color: '#fff',
                                        textShadow: '0 1px 2px rgba(0,0,0,0.2)',
                                        fontSize: 12
                                    }}
                                >
                                    {stage.value}
                                </div>
                            </Tooltip>
                        </div>
                    )
                })}
            </div>
        </Card>
    );
};
