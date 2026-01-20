/**
 * 入驻审批状态
 * pending: 待审批
 * rejected: 已驳回
 * approved: 待签约 (审批通过)
 * signed: 已归档 (完成签署)
 */
export type SettlementStatus = 'pending' | 'rejected' | 'approved' | 'signed'

/**
 * 客户入驻质量检查结果
 */
export interface QualityCheckItem {
    id: string
    customerName: string
    legalPerson: string
    gsCheckResult: 'pass' | 'name_mismatch' | 'query_failed'
    crmExists: boolean
    crmId?: string
}

/**
 * 入驻申请数据结构
 */
export interface SettlementApplication {
    id: string                   // 申请单号
    companyName: string          // 公司全称
    city: string                 // 所在城市
    detailedAddress?: string     // 详细地址
    contactName: string          // 联系人
    contactPhone: string         // 联系电话
    contactPosition: string      // 联系人职位
    contactEmail?: string        // 联系邮箱
    referrer?: string            // 推荐人
    signContractUrl: string      // 签约合同链接
    cooperationStartDate: string // 合作开始日期
    cooperationEndDate: string   // 合作截止日期
    owner: string                // 内部负责人
    commissionType: string       // 分佣类型
    commissionRate?: number      // 分佣比例 (%)
    commissionDescription?: string // 个性化说明
    businessLicenseUrl: string   // 营业执照副本链接
    socialCreditCode: string     // 社会信用代码
    bankInfo?: string            // 开户行及账号
    address?: string             // 注册地址
    auditStatus: SettlementStatus// 审批状态
    applyTime: string            // 申请日期 (YYYY-MM-DD)
    approvalDate?: string        // 审批通过日期 (YYYY-MM-DD)
    ruleId?: string              // 分佣规则ID
    qualityCheckResults?: QualityCheckItem[] // 客户资源质检结果
    contractType?: 'standard' | 'non-standard' // 合同类型
    customContractUrl?: string    // 用户的非标合同文件路径
    contractAuditStatus?: 'pending' | 'approving' | 'approved' | 'rejected' // 非标合同审批状态
    industry?: string            // 一级行业
    scale?: string               // 企业规模
}
