/**
 * 调账类型
 */
export type AdjustmentType = 'performance' | 'commission' | 'order_level' // 业绩额调账 | 分佣额调账 | 订单级调整

/**
 * 调账审批状态
 */
export type AdjustmentStatus = 'pending' | 'approved' | 'rejected'

/**
 * 调账记录数据结构
 */
export interface Adjustment {
    id: string              // 调账单号 (格式: ADJ+YYYYMMDD+4位流水)
    channelId: string       // 渠道ID
    channelName: string     // 渠道名称
    type: AdjustmentType    // 调账类型
    amount: number          // 调账金额 (业绩额为万元，分佣额为元/万元，PRD中业绩区间单位是万，这里统一用万元)
    cycle: string           // 归属账期 (YYYY-MM)
    reason: string          // 调账原因/说明
    status: AdjustmentStatus // 审批状态
    creator: string         // 操作人
    applyTime: string       // 申请时间 (YYYY-MM-DD HH:mm:ss)
    auditNo?: string        // 关联审批单号

    // 订单级调整特有字段
    relatedOrderIds?: string[]      // 关联订单ID列表
    performanceMode?: 'include' | 'exclude' // 业绩计算模式: 计入/不计入
    commissionMode?: 'standard' | 'custom_rate' | 'none' // 提成计算模式: 标准/自定义/无
    commissionRate?: number         // 提成比例 (0-100)，仅 custom_rate 时有效
    reasonCategory?: string         // 调整原因分类

    // 业绩额调整特有字段
    effectiveTime?: string          // 生效时间 (YYYY-MM-DD HH:mm:ss)
}
