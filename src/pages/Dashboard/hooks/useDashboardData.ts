import { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { Channel } from '../../../types/channel';
import { Reporting } from '../../../types/reporting';
import channelData from '../../../data/channel.json';
import reportingData from '../../../data/reporting.json';
// Import settlement data if available, otherwise mock it for now as it wasn't in list_dir output earlier or I missed it
// Checking list_dir output from Step 5, settlement.json exists in data.
import settlementData from '../../../data/settlement.json';

// Define return types for the hook
export interface DashboardData {
    user: {
        name: string;
    };
    today: string;
    todos: {
        expiringChannels: number;
        expiringReports: number;
        settlementChecks: number;
        rejectedApplications: number;
    };
    metrics: {
        channels: {
            total: number;
            active: number;
            expiring: number;
            newThisMonth: number;
        };
        reports: {
            total: number;
            protected: number;
            converted: number;
            newThisMonth: number;
        };
    };
    performance: {
        channelName: string;
        amount: number;
    }[];
    ruleDistribution: {
        ladder: number;
        fixed: number;
        personalized: number;
    };
    funnel: {
        total: number;
        following: number;
        linked: number;
        opportunity: number;
        deal: number;
        signed: number;
        paid: number;
    };
    activities: {
        id: string;
        type: 'approval' | 'report' | 'opportunity' | 'deal' | 'payment';
        content: string;
        time: string;
    }[];
}

export const useDashboardData = () => {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate API fetch delay
        const fetchData = async () => {
            setLoading(true);
            try {
                // In a real app, this would be an API call. 
                // Here we aggregate from local mock data (simulating DB).

                // 1. User Info (Mock)
                const user = { name: '张三' };
                const today = dayjs().format('YYYY年M月D日 dddd');

                // 2. Process Channels
                // Try getting from localStorage first, else use json
                const storedChannels = localStorage.getItem('channels');
                const channels: Channel[] = storedChannels ? JSON.parse(storedChannels) : channelData;

                const now = dayjs();
                const nextMonth = now.add(30, 'day');

                const activeChannels = channels.filter(c => c.status === 'active');
                const expiringChannels = channels.filter(c => c.status === 'active' && dayjs(c.endDate).isBefore(nextMonth) && dayjs(c.endDate).isAfter(now));
                const newChannelsThisMonth = channels.filter(c => dayjs(c.startDate).isSame(now, 'month'));

                // Commission Type Distribution
                const ruleDistribution = {
                    ladder: channels.filter(c => c.commissionType === 'custom_ladder').length,
                    fixed: channels.filter(c => c.commissionType === 'fixed').length,
                    personalized: channels.filter(c => c.commissionType === 'personalized').length,
                };

                // Performance (Mock based on cumulativePerformance field if exists, else random/mock)
                // Assuming 'cumulativePerformance' exists on Channel type, or we calculate it.
                // Looking at Channel type (inferred), let's assume we map from mock data.
                const performance = channels
                    .map(c => ({
                        channelName: c.companyName,
                        amount: c.ytdPerformance || (c as any).cumulativePerformance || Math.floor(Math.random() * 1000000), // Fallback for old data
                    }))
                    .sort((a, b) => b.amount - a.amount)
                    .slice(0, 5);


                // 3. Process Reports
                const storedReports = localStorage.getItem('reportings');
                const reports: Reporting[] = storedReports ? JSON.parse(storedReports) : reportingData;

                const protectedReports = reports.filter(r => r.status === 'protected');
                const convertedReports = reports.filter(r => r.status === 'converted');
                const newReportsThisMonth = reports.filter(r => dayjs(r.reportingTime).isSame(now, 'month'));

                const expiringReports = reports.filter(r => r.status === 'protected' && dayjs((r as any).protectDeadline || (r as any).protectionDeadline).isBefore(now.add(7, 'day')) && dayjs((r as any).protectDeadline || (r as any).protectionDeadline).isAfter(now));

                // 4. Todo Counts
                // Settlement checks mock
                const settlementChecks = 1; // Mock for now
                const rejectedApplications = 0; // Mock

                // 5. Funnel
                const funnel = {
                    total: reports.length,
                    following: reports.filter(r => r.status === 'pending').length,
                    linked: reports.filter(r => r.status === 'protected').length,
                    opportunity: reports.filter(r => r.status === 'converted').length, // Simplified for mock
                    deal: reports.filter(r => r.status === 'converted').length,
                    signed: reports.filter(r => r.status === 'converted' && (r as any).orderStatus === 'fully_paid').length,
                    paid: reports.filter(r => r.status === 'converted' && (r as any).orderStatus === 'fully_paid').length,
                };

                // 6. Activities (Mock for visual richness)
                const activities: DashboardData['activities'] = [
                    { id: '1', type: 'deal', content: '【四川都九成商贸】已签约，合同金额 50 万', time: '10:30' },
                    { id: '2', type: 'opportunity', content: '【成都米仓山电子】商机阶段更新为【商机中】', time: '09:15' },
                    { id: '3', type: 'report', content: '【成都阿晋卖料供应链】报备已生效，保护期至 2026-04-12', time: '昨天' },
                    { id: '4', type: 'approval', content: '【重庆CC科技有限公司】入驻审批通过', time: '昨天' },
                    { id: '5', type: 'payment', content: '【杭州DD信息技术】回款到账 30 万', time: '3天前' },
                ];


                setData({
                    user,
                    today,
                    todos: {
                        expiringChannels: expiringChannels.length,
                        expiringReports: expiringReports.length,
                        settlementChecks,
                        rejectedApplications
                    },
                    metrics: {
                        channels: {
                            total: channels.length,
                            active: activeChannels.length,
                            expiring: expiringChannels.length,
                            newThisMonth: newChannelsThisMonth.length,
                        },
                        reports: {
                            total: reports.length,
                            protected: protectedReports.length,
                            converted: convertedReports.length,
                            newThisMonth: newReportsThisMonth.length,
                        },
                    },
                    performance,
                    ruleDistribution,
                    funnel,
                    activities,
                });
            } catch (error) {
                console.error("Failed to fetch dashboard data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return { data, loading };
};
