/**
 * 阶梯梯度定义
 */
export interface LadderTier {
    min: number      // 区间最小值 (万元)
    max: number | null // 区间最大值 (万元)，null 表示无上限
    rate: number     // 对应比例 (%)
}

/**
 * 分佣规则定义
 */
export interface CommissionRule {
    id: string
    name: string
    type: string     // '阶梯分层' etc.
    tiers: LadderTier[]
    status: 'enabled' | 'disabled'
    isDefault?: boolean
    description?: string
    channelCount?: number
    accumulatedPerformance?: number
    creator?: string
    createTime?: string
}
