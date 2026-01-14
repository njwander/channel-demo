export type ReconciliationStatus =
    | 'Pending'           // 待核对
    | 'SalesConfirmed'    // 销售已确认
    | 'ChannelConfirmed'  // 渠道已确认
    | 'BothConfirmed'     // 双方确认通过
    | 'ManualReview'      // 需人工处理
    | 'Void';             // 已作废

export type SalesConfirmStatus = 'Pending' | 'Confirmed' | 'Objection';
export type ChannelConfirmStatus = 'Pending' | 'Confirmed' | 'Objection';

export interface ReconciliationOrder {
    id: string;
    contractNo: string;      // 合同编号
    orderNo: string;         // 订单编号
    channelName: string;     // 渠道名称
    customerName: string;    // 客户名称
    productName: string;     // 订单产品
    orderAmount: number;     // 订单金额
    returnDate: string;      // 回款日期
    returnAmount: number;    // 回款金额
    channelRate: number;     // 渠道比例 (0-100)
    commissionAmount: number; // 渠道佣金

    salesRep: string;        // 负责销售
    salesStatus: SalesConfirmStatus;

    channelContact: string;  // 渠道联系人 (UI might mock this)
    channelStatus: ChannelConfirmStatus;

    status: ReconciliationStatus;
    objectionReason?: string; // 异议原因
}
