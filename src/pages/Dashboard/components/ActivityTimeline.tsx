import { FC } from 'react';
import { Card, Timeline, Typography } from 'antd';
import { ClockCircleOutlined, CheckCircleOutlined, DollarCircleOutlined, FileTextOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface ActivityTimelineProps {
    activities: {
        id: string;
        type: 'approval' | 'report' | 'opportunity' | 'deal' | 'payment';
        content: string;
        time: string;
    }[];
}

export const ActivityTimeline: FC<ActivityTimelineProps> = ({ activities }) => {

    const getIcon = (type: string) => {
        switch (type) {
            case 'approval': return <CheckCircleOutlined style={{ color: '#52c41a' }} />; // Green check
            case 'report': return <FileTextOutlined style={{ color: '#1890ff' }} />; // Blue file
            case 'opportunity': return <ClockCircleOutlined style={{ color: '#faad14' }} />; // Yellow clock
            case 'deal': return <CheckCircleOutlined style={{ color: '#eb2f96' }} />; // Pink check (target)
            case 'payment': return <DollarCircleOutlined style={{ color: '#faad14' }} />; // Gold money
            default: return <ClockCircleOutlined />;
        }
    };

    const getLabel = (time: string, type: string) => {
        let prefix = '';
        switch (type) {
            case 'approval': prefix = '🎉 '; break;
            case 'report': prefix = '✅ '; break;
            case 'opportunity': prefix = '📈 '; break;
            case 'deal': prefix = '🎯 '; break;
            case 'payment': prefix = '💰 '; break;
        }
        return <Text type="secondary">{prefix} {time}</Text>
    };


    return (
        <Card title="近期动态" bordered={false} bodyStyle={{ padding: '24px 24px 0 24px', maxHeight: 300, overflowY: 'auto' }}>
            <Timeline
                items={activities.map(item => ({
                    dot: getIcon(item.type),
                    children: (
                        <div>
                            <div style={{ marginBottom: 4 }}>
                                {getLabel(item.time, item.type)}
                            </div>
                            <Text>{item.content}</Text>
                        </div>
                    )
                }))}
            />
            {activities.length === 0 && <div style={{ textAlign: 'center', paddingBottom: 24, color: '#999' }}>暂无动态</div>}
        </Card>
    );
};
