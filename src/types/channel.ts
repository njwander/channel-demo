/**
 * 渠道等级
 */
export type ChannelLevel = 'gold' | 'silver' | 'bronze'

/**
 * 渠道状态
 */
export type ChannelStatus = 'active' | 'expiring' | 'terminated'

/**
 * 分佣类型
 */
export type CommissionType = 'ladder' | 'fixed' | 'personalized'

/**
 * 渠道基本信息
 */
export interface Channel {
    id: string              // 渠道ID
    companyName: string     // 渠道名称（公司全称）
    status: ChannelStatus   // 状态
    level?: ChannelLevel    // 等级 (仅阶梯等级类型有效)
    commissionType: CommissionType // 分佣类型
    commissionRate?: string // 分佣比例 (如 "12%", "按约定")
    startDate: string       // 合作开始日 (YYYY-MM-DD)
    endDate: string         // 合作周期截止日期
    ytdPerformance: number  // 本周期累计业绩 (万元)
    owner: string           // 内部负责人
    totalReportings?: number        // 累计推荐客户数
    totalConverted?: number         // 累计成交客户数
    lastConversionTime?: string     // 最近成交时间
    terminationReason?: string      // 解约原因
    terminationDescription?: string // 解约说明
    terminationVoucher?: string    // 解约协议/沟通确认截图
    terminationDate?: string       // 解约日期 (YYYY-MM-DD)
}
