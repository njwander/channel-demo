import React from 'react'
import {
    HomeOutlined,
    FormOutlined,
    UnorderedListOutlined,
    SolutionOutlined,
    SettingOutlined,
    BarChartOutlined,
    FileTextOutlined,
    EditOutlined
} from '@ant-design/icons'

import type { MenuProps } from 'antd'

type MenuItemType = Required<MenuProps>['items'][number]

export type MenuItem = MenuItemType & {
    path?: string
    children?: MenuItem[]
}

export const menuItems: MenuItem[] = [
    {
        key: 'dashboard',
        label: '工作台',
        icon: <HomeOutlined />,
        path: '/dashboard',
    } as MenuItem,
    {
        key: 'channel',
        label: '渠道列表',
        icon: <UnorderedListOutlined />,
        path: '/channel-list',
    } as MenuItem,
    {
        key: 'settlement',
        label: '入驻申请',
        icon: <FormOutlined />,
        path: '/settlement-list',
    } as MenuItem,

    {
        key: 'reporting',
        label: '客户报备',
        icon: <SolutionOutlined />,
        path: '/reporting-list',
    } as MenuItem,
    {
        key: 'performance',
        label: '业绩管理',
        icon: <BarChartOutlined />,
        children: [
            {
                key: 'monthly-settlement',
                label: '月度结算单',
                icon: <FileTextOutlined />,
                path: '/monthly-settlement',
            },
            {
                key: 'order-reconciliation',
                label: '渠道订单核对',
                icon: <FileTextOutlined />,
                path: '/order-reconciliation',
            },
            {
                key: 'adjustment-management',
                label: '调账管理',
                icon: <EditOutlined />,
                path: '/adjustment-management',
            },
            {
                key: 'commission-rules',
                label: '分佣规则管理',
                icon: <SettingOutlined />,
                path: '/performance/commission-rules',
            },
        ],
    } as MenuItem,
]

