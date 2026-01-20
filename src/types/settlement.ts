/**
 * 阶梯梯度定义
 */
export interface LadderTier {
    min: number      // 区间最小值 (万元)
    max: number | null // 区间最大值 (万元)，null 表示无上限
    rate: number     // 对应比例 (%)
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
    commissionTiers?: any[]      // 具体的分佣阶梯配置
    qualityCheckResults?: QualityCheckItem[] // 客户资源质检结果
    contractType?: 'standard' | 'non-standard' // 合同类型
    customContractUrl?: string    // 用户的非标合同文件路径
    contractAuditStatus?: 'pending' | 'approving' | 'approved' | 'rejected' // 非标合同审批状态
    industry?: string            // 一级行业
    scale?: string               // 企业规模
}
