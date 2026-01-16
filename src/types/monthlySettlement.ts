import { CommissionType } from './channel'

/**
 * 结算单状态
 */
export type MonthlySettlementStatus = 'pending' | 'reviewing' | 'completed'

/**
 * 订单核销明细
 */
export interface SettlementOrderDetail {
    orderId: string
    customerName: string
    signDate: string
    amount: number
}

/**
 * 调账明细
 */
export interface AdjustmentDetail {
    id: string
    type: 'performance' | 'commission' // 业绩调账 | 分佣额调账
    amount: number
    reason: string
    auditNo?: string
}

/**
 * 月度结算单数据结构
 */
export interface MonthlySettlement {
    id: string                   // 结算单号
    cycle: string                // 结算周期 (YYYY-MM)
    channelName: string          // 渠道名称
    commissionType: CommissionType // 分佣类型
    orderCount: number           // 成交订单数
    orderAmount: number          // 成交金额 (万元)
    rate: string                 // 分佣比例 (如 "12%", "按约定")
    payableAmount: number        // 应发金额 (万元)
    adjustmentAmount: number     // 调账金额 (万元)
    actualAmount: number         // 实发金额 (万元)
    status: MonthlySettlementStatus // 状态
    details?: SettlementOrderDetail[] // 订单明细
    adjustments?: AdjustmentDetail[] // 调账明细
    isReconciled?: boolean       // 是否已轧账
}
