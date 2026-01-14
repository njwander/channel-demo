import { FC } from 'react'
import { Card, Typography } from 'antd'

/**
 * 渠道详情
 */
const ChannelDetail: FC = () => {
    return (
        <div style={{ padding: 24 }}>
            <Typography.Title level={2}>渠道详情</Typography.Title>
            <Card>
                <Typography.Paragraph>渠道详情页面内容。</Typography.Paragraph>
            </Card>
        </div>
    )
}

export default ChannelDetail
