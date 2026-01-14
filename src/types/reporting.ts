/**
 * 报备状态
 */
export type ReportingStatus = 'pending' | 'rejected' | 'protected' | 'converted' | 'expired' | 'cancelled'

/**
 * 跟进状态
 */
export type FollowupStatus = 'not_started' | 'following' | 'customer_associated'

/**
 * 商机阶段
 */
export type OpportunityStage = 'none' | 'developing' | 'closed'

/**
 * 成交状态
 */
export type OrderStatus = 'signed' | 'partially_paid' | 'fully_paid'

/**
 * 客户报备基本信息
 */
export interface Reporting {
    id: string              // 报备编号 (BB+年月日+4位流水号)
    customerName: string    // 客户名称
    channelId: string       // 所属渠道ID
    channelName: string     // 所属渠道名称
    channelOwner: string    // 渠道负责人
    taxId: string           // 纳税人识别号
    reportingTime: string   // 报备时间 (YYYY-MM-DD HH:mm:ss)
    status: ReportingStatus // 报备状态
    expiryDate?: string     // 保护到期日

    // CRM 同步信息
    crmOwner?: string       // CRM 当前负责人
    followupStatus: FollowupStatus // 跟进状态
    opportunityStage: OpportunityStage // 商机阶段

    // OMS 同步信息
    orderStatus?: OrderStatus // 成交状态
    contractAmount?: number   // 签约金额 (万元)
    paidAmount?: number       // 已回款金额 (万元)

    // 详细信息
    province: string        // 省份
    city: string            // 城市
    industry: string        // 行业
    enterpriseScale: string // 企业规模
    contactName: string     // 联系人
    contactPosition: string // 联系人岗位
    contactPhone: string    // 联系电话
    voucherImages: string[] // 报备凭证截图 (URL/path)

    // 商机详细信息
    expectedAmount?: number // 预计成交金额
    expectedDate?: string   // 预计成交日期
    opportunityDesc?: string // 商机描述
    progressImages?: string[] // 对接推进截图
}
