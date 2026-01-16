import settlementData from '../data/settlement.json'
import channelData from '../data/channel.json'
import reportingData from '../data/reporting.json'

const STORAGE_KEYS = {
    SETTLEMENT: 'settlement_data',
    CHANNEL: 'channel_data',
    REPORTING: 'reporting_data',
    ADJUSTMENT: 'adjustment_data',
    RECONCILIATION: 'reconciliation_data',
} as const

/**
 * 初始化 localStorage 数据
 */
export const initData = async () => {
    try {
        // 1. 如果没有数据，或者需要强制刷新（演示需要），则初始化
        if (!localStorage.getItem(STORAGE_KEYS.SETTLEMENT)) {
            localStorage.setItem(STORAGE_KEYS.SETTLEMENT, JSON.stringify(settlementData))
            console.log('[数据初始化] ✅ Settlement data loaded')
        }

        const storedChannelData = localStorage.getItem(STORAGE_KEYS.CHANNEL)
        let shouldInitChannel = !storedChannelData

        // 检查数据完整性（是否存在 commissionType 字段）
        if (storedChannelData) {
            try {
                const parsed = JSON.parse(storedChannelData)
                if (Array.isArray(parsed) && parsed.length > 0 && (!parsed[0].commissionType || !parsed[0].detailedAddress)) {
                    console.log('[数据初始化] ⚠️ Channel data is outdated (missing commissionType or detailedAddress), reloading...')
                    shouldInitChannel = true
                }
            } catch (e) {
                shouldInitChannel = true
            }
        }

        if (shouldInitChannel) {
            localStorage.setItem(STORAGE_KEYS.CHANNEL, JSON.stringify(channelData))
            console.log('[数据初始化] ✅ Channel data loaded')
        }

        if (!localStorage.getItem(STORAGE_KEYS.REPORTING)) {
            localStorage.setItem(STORAGE_KEYS.REPORTING, JSON.stringify(reportingData))
            console.log('[数据初始化] ✅ Reporting data loaded')
        }
        if (!localStorage.getItem(STORAGE_KEYS.ADJUSTMENT)) {
            const adjustmentData = await import('../data/adjustment.json')
            localStorage.setItem(STORAGE_KEYS.ADJUSTMENT, JSON.stringify(adjustmentData.default))
            console.log('[数据初始化] ✅ Adjustment data loaded')
        }
        if (!localStorage.getItem(STORAGE_KEYS.RECONCILIATION)) {
            const reconciliationData = await import('../data/reconciliation.json')
            localStorage.setItem(STORAGE_KEYS.RECONCILIATION, JSON.stringify(reconciliationData.default))
            console.log('[数据初始化] ✅ Reconciliation data loaded')
        }
    } catch (error) {
        console.error('[数据初始化] ❌ Failed to load data:', error)
    }
}

/**
 * 重置 localStorage 数据
 */
export const resetLocalStorage = () => {
    Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key)
    })
    window.location.reload()
}

// 暴露到 window 方便调试
if (typeof window !== 'undefined') {
    ; (window as any).resetLocalStorage = resetLocalStorage
}
