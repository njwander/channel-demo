import { FC } from 'react';
import { Card, List, Tag, Typography, Button, Space } from 'antd';
import { RightOutlined, ExclamationCircleOutlined, CheckCircleOutlined, FormOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Text } = Typography;

interface ToDoListProps {
    todos: {
        expiringChannels: number;
        expiringReports: number;
        settlementChecks: number;
        rejectedApplications: number;
    };
}

export const ToDoList: FC<ToDoListProps> = ({ todos }) => {
    const navigate = useNavigate();

    // Generate mock todo items based on counts for display
    const items = [];

    if (todos.expiringChannels > 0) {
        items.push({
            type: 'warning',
            icon: <ExclamationCircleOutlined style={{ color: '#faad14' }} />,
            text: `⚠️ 有 ${todos.expiringChannels} 个渠道即将到期，请及时续约`,
            action: '去处理',
            path: '/channel/list?status=expiring'
        });
    }

    if (todos.expiringReports > 0) {
        items.push({
            type: 'warning',
            icon: <ExclamationCircleOutlined style={{ color: '#faad14' }} />,
            text: `⚠️ 有 ${todos.expiringReports} 个报备保护期即将失效`,
            action: '去处理',
            path: '/reporting/list?status=protected'
        });
    }

    if (todos.settlementChecks > 0) {
        items.push({
            type: 'info',
            icon: <FormOutlined style={{ color: '#1890ff' }} />,
            text: `📋 上月结算单已生成，请核对确认`,
            action: '去核对',
            path: '/settlement/list' // Assuming this path
        });
    }

    // Fallback if empty
    if (items.length === 0) {
        return (
            <Card title="待办事项" variant="borderless" styles={{ body: { padding: '24px' } }} style={{ marginBottom: 24 }}>
                <div style={{ textAlign: 'center', padding: '20px 0', color: '#999' }}>
                    <CheckCircleOutlined style={{ fontSize: 24, marginBottom: 8, color: '#52c41a' }} />
                    <div>🎉 暂无待办事项，继续保持！</div>
                </div>
            </Card>
        );
    }


    return (
        <Card
            title="待办事项"
            extra={<Button type="link" onClick={() => { }}>查看全部待办 ({items.length})</Button>}
            variant="borderless"
            style={{ marginBottom: 24, boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)' }}
        >
            <List
                itemLayout="horizontal"
                dataSource={items}
                renderItem={(item) => (
                    <List.Item
                        actions={[
                            <Button type="link" onClick={() => navigate(item.path)}>
                                {item.action}
                            </Button>
                        ]}
                    >
                        <List.Item.Meta
                            avatar={item.icon}
                            title={
                                <Text>{item.text}</Text>
                            }
                        />
                    </List.Item>
                )}
            />
        </Card>
    );
};
