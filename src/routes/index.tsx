import { Routes, Route, Navigate } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'
import Dashboard from '../pages/Dashboard'
import SettlementList from '../pages/Settlement/SettlementList'
import SettlementNew from '../pages/Settlement/SettlementNew'
import SettlementDetail from '../pages/Settlement/SettlementDetail'
import ChannelList from '../pages/Channel/ChannelList'
import ChannelDetail from '../pages/Channel/ChannelDetail'
import ReportingList from '../pages/Reporting/ReportingList'
import ReportingNew from '../pages/Reporting/ReportingNew'
import ReportingDetail from '../pages/Reporting/ReportingDetail'
import MonthlySettlement from '../pages/Performance/MonthlySettlement'
import AdjustmentManagement from '../pages/Performance/AdjustmentManagement'
import OrderReconciliation from '../pages/Performance/OrderReconciliation'
import Termination from '../pages/Termination/Termination'
import CommissionRuleList from '../pages/Performance/CommissionRuleList'
import CommissionRuleConfig from '../pages/Performance/CommissionRuleConfig'
import BusinessRules from '../pages/BusinessRules'
import NotFound from '../pages/NotFound'
import { useEffect } from 'react'
import { initData } from '../utils/dataInitializer'

const AppRoutes = () => {
    // 初始化数据
    useEffect(() => {
        initData()
    }, [])

    return (
        <Routes>
            <Route path="/" element={<MainLayout />}>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />

                {/* 入驻申请 */}
                <Route path="settlement-list" element={<SettlementList />} />
                <Route path="settlement-new" element={<SettlementNew />} />
                <Route path="settlement-detail/:id" element={<SettlementDetail />} />

                {/* 渠道管理 */}
                <Route path="channel-list" element={<ChannelList />} />
                <Route path="channel-detail/:id" element={<ChannelDetail />} />

                {/* 客户报备 */}
                <Route path="reporting-list" element={<ReportingList />} />
                <Route path="reporting-new" element={<ReportingNew />} />
                <Route path="reporting-detail/:id" element={<ReportingDetail />} />


                {/* 业绩管理 */}
                <Route path="monthly-settlement" element={<MonthlySettlement />} />
                <Route path="adjustment-management" element={<AdjustmentManagement />} />
                <Route path="order-reconciliation" element={<OrderReconciliation />} />
                <Route path="performance/commission-rules" element={<CommissionRuleList />} />
                <Route path="performance/commission-rules/config/:id" element={<CommissionRuleConfig />} />

                {/* 渠道解约 */}
                <Route path="termination" element={<Termination />} />

                {/* 业务规则 */}
                <Route path="business-rules" element={<BusinessRules />} />

                <Route path="*" element={<Navigate to="/404" replace />} />
            </Route>
            <Route path="/404" element={<NotFound />} />
        </Routes>
    )
}

export default AppRoutes
