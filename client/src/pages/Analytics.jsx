import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, IndianRupee, Calendar, ArrowUpRight } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import TopNav from '../components/TopNav';
import PageLoader from '../components/PageLoader';
import { analyticsAPI } from '../services/api';

const Analytics = () => {
    const [loading, setLoading] = useState(true);
    const [analyticsData, setAnalyticsData] = useState(null);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            const res = await analyticsAPI.getData();
            setAnalyticsData(res.data.analytics);
        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    const COLORS = {
        Food: '#a3e635',
        Travel: '#fb923c',
        Fun: '#ec4899',
        Misc: '#3b82f6'
    };

    if (loading) {
        return <PageLoader />;
    }

    return (
        <div className="min-h-screen bg-dark-950">
            <Sidebar />
            <TopNav title="Analytics" />

            <main className="md:ml-20 ml-0 pt-16 p-4 md:p-8 pb-24 md:pb-8">
                <div className="max-w-[1600px] mx-auto">
                    {/* Header Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="premium-card">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 rounded-2xl bg-neon-lime/10 flex items-center justify-center">
                                    <IndianRupee className="text-neon-lime" size={24} />
                                </div>
                                <ArrowUpRight className="text-neon-lime" size={20} />
                            </div>
                            <p className="text-gray-400 text-sm mb-1">Total Spending</p>
                            <h3 className="text-3xl font-bold text-white">
                                ₹{analyticsData?.totalSpent?.toLocaleString() || 0}
                            </h3>
                        </div>

                        <div className="premium-card">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 rounded-2xl bg-neon-orange/10 flex items-center justify-center">
                                    <TrendingUp className="text-neon-orange" size={24} />
                                </div>
                            </div>
                            <p className="text-gray-400 text-sm mb-1">Avg Daily Spend</p>
                            <h3 className="text-3xl font-bold text-white">
                                ₹{analyticsData?.avgDailySpend?.toFixed(0) || 0}
                            </h3>
                        </div>

                        <div className="premium-card">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 rounded-2xl bg-neon-pink/10 flex items-center justify-center">
                                    <Calendar className="text-neon-pink" size={24} />
                                </div>
                            </div>
                            <p className="text-gray-400 text-sm mb-1">This Month</p>
                            <h3 className="text-3xl font-bold text-white">
                                {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                            </h3>
                        </div>
                    </div>

                    {/* Charts Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Category Breakdown Pie Chart */}
                        <div className="premium-card">
                            <h2 className="text-xl font-bold text-white mb-6">CATEGORY BREAKDOWN</h2>
                            <div className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={analyticsData?.categoryBreakdown || []}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                            outerRadius={100}
                                            fill="#8884d8"
                                            dataKey="total"
                                            nameKey="category"
                                        >
                                            {(analyticsData?.categoryBreakdown || []).map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[entry.category] || '#3b82f6'} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: '#1a1a1a',
                                                border: '1px solid #3a3a3a',
                                                borderRadius: '12px',
                                                color: '#fff'
                                            }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Category Legend */}
                            <div className="mt-6 space-y-3">
                                {(analyticsData?.categoryBreakdown || []).map((cat, idx) => (
                                    <div key={idx} className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="w-4 h-4 rounded-full"
                                                style={{ backgroundColor: COLORS[cat.category] }}
                                            />
                                            <span className="text-gray-300">{cat.category}</span>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-white font-semibold">₹{cat.total.toLocaleString()}</p>
                                            <p className="text-gray-500 text-xs">{cat.percentage}%</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Weekly Spending Bar Chart */}
                        <div className="premium-card">
                            <h2 className="text-xl font-bold text-white mb-6">WEEKLY SPENDING</h2>
                            <div className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={analyticsData?.weeklyTrend || []}>
                                        <XAxis
                                            dataKey="day"
                                            stroke="#3a3a3a"
                                            style={{ fontSize: '12px', fill: '#71717a' }}
                                        />
                                        <YAxis
                                            stroke="#3a3a3a"
                                            style={{ fontSize: '12px', fill: '#71717a' }}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: '#1a1a1a',
                                                border: '1px solid #3a3a3a',
                                                borderRadius: '12px',
                                                color: '#fff'
                                            }}
                                        />
                                        <Bar dataKey="amount" fill="#a3e635" radius={[8, 8, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Monthly Trend Line Chart */}
                        <div className="lg:col-span-2 premium-card">
                            <h2 className="text-xl font-bold text-white mb-6">6-MONTH TREND</h2>
                            <div className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={analyticsData?.monthlyTrend || []}>
                                        <XAxis
                                            dataKey="month"
                                            stroke="#3a3a3a"
                                            style={{ fontSize: '12px', fill: '#71717a' }}
                                        />
                                        <YAxis
                                            stroke="#3a3a3a"
                                            style={{ fontSize: '12px', fill: '#71717a' }}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: '#1a1a1a',
                                                border: '1px solid #3a3a3a',
                                                borderRadius: '12px',
                                                color: '#fff'
                                            }}
                                        />
                                        <Legend />
                                        <Line
                                            type="monotone"
                                            dataKey="total"
                                            stroke="#a3e635"
                                            strokeWidth={3}
                                            dot={{ fill: '#a3e635', r: 5 }}
                                            activeDot={{ r: 7 }}
                                            name="Total Spending"
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Analytics;
