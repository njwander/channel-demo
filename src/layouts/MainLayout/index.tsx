import React, { useState, useEffect } from 'react'
import { Layout, Menu, Button, theme } from 'antd'
import {
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    HomeOutlined,
    AppstoreOutlined,
    SettingOutlined,
} from '@ant-design/icons'
import { useNavigate, useLocation, Outlet } from 'react-router-dom'
import { menuItems } from '../../routes/menuConfig'

const { Header, Sider, Content } = Layout

const MainLayout: React.FC = () => {
    const [collapsed, setCollapsed] = useState(false)
    const navigate = useNavigate()
    const location = useLocation()
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken()

    // 处理菜单点击
    const onMenuClick = ({ key }: { key: string }) => {
        const item = findMenuItemPath(menuItems, key)
        if (item?.path) {
            navigate(item.path)
        }
    }

    // 递归寻找路径
    const findMenuItemPath = (items: any[], key: string): any => {
        for (const item of items) {
            if (item.key === key) return item
            if (item.children) {
                const found = findMenuItemPath(item.children, key)
                if (found) return found
            }
        }
        return null
    }

    // 获取当前选中的菜单项
    const getSelectedKeys = () => {
        const path = location.pathname
        const findKeyByPath = (items: any[]): string | null => {
            for (const item of items) {
                if (item.path === path) return item.key
                if (item.children) {
                    const key = findKeyByPath(item.children)
                    if (key) return key
                }
            }
            return null
        }
        const activeKey = findKeyByPath(menuItems)
        return activeKey ? [activeKey] : []
    }

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider trigger={null} collapsible collapsed={collapsed} theme="light">
                <div style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: collapsed ? 0 : '0 16px' }}>
                    <img src="/vite.svg" alt="Logo" style={{ width: 32, height: 32 }} />
                    {!collapsed && <span style={{ marginLeft: 12, fontWeight: 'bold', fontSize: 18, color: '#ff5050', whiteSpace: 'nowrap' }}>渠道管理系统</span>}
                </div>
                <Menu
                    theme="light"
                    mode="inline"
                    selectedKeys={getSelectedKeys()}
                    defaultOpenKeys={['performance']}
                    items={menuItems}
                    onClick={onMenuClick}
                />
            </Sider>
            <Layout>
                <Header style={{ padding: 0, background: colorBgContainer, display: 'flex', alignItems: 'center' }}>
                    <Button
                        type="text"
                        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                        onClick={() => setCollapsed(!collapsed)}
                        style={{
                            fontSize: '16px',
                            width: 64,
                            height: 64,
                        }}
                    />
                    <div style={{ flex: 1 }}></div>
                    <div style={{ paddingRight: 24, display: 'flex', alignItems: 'center' }}>
                        <span style={{ marginRight: 16 }}>欢迎使用</span>
                        <SettingOutlined style={{ fontSize: 18, cursor: 'pointer' }} />
                    </div>
                </Header>
                <Content
                    style={{
                        margin: '24px 16px',
                        padding: 24,
                        minHeight: 280,
                        background: colorBgContainer,
                        borderRadius: borderRadiusLG,
                        overflow: 'auto',
                    }}
                >
                    <Outlet />
                </Content>
            </Layout>
        </Layout>
    )
}

export default MainLayout
