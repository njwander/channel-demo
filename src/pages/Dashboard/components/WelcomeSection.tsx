import { FC } from 'react';
import { Typography, theme } from 'antd';

const { Title, Text } = Typography;

interface WelcomeSectionProps {
    userName?: string;
    today: string;
}

export const WelcomeSection: FC<WelcomeSectionProps> = ({ userName = 'User', today }) => {
    const { token } = theme.useToken();

    return (
        <div style={{
            marginBottom: 24,
            background: token.colorBgContainer,
            padding: '24px 32px',
            borderRadius: token.borderRadiusLG,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)'
        }}>
            <Title level={4} style={{ margin: 0 }}>
                👋 你好，{userName}！
            </Title>
            <Text type="secondary">{today}</Text>
        </div>
    );
};
