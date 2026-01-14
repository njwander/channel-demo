import { FC } from 'react'
import { Card, Typography } from 'antd'

/**
 * 渠道解约
 */
const Termination: FC = () => {
    return (
        <div style={{ padding: 24 }}>
            <Typography.Title level={2}>渠道解约</Typography.Title>
            <Card>
                <Typography.Paragraph>渠道解约页面内容。</Typography.Paragraph>
            </Card>
        </div>
    )
}

export default Termination
