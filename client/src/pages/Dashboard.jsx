import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Users, Calendar, ArrowRight } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import TopNav from '../components/TopNav';
import PageLoader from '../components/PageLoader';
import { expenseAPI, budgetAPI, groupAPI, friendSplitAPI, analyticsAPI } from '../services/api';

const Dashboard = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState({
        totalSpent: 0,
        budget: 0,
        remaining: 0,
        expenses: [],
        categoryData: [],
        groups: [],
        weeklyTrend: []
    });

    useEffect(() => {
        fetchDashboardData();
        const interval = setInterval(() => {
            fetchDashboardData();
        }, 5000); // Poll every 5 seconds for live updates

        return () => clearInterval(interval);
    }, []);

    const fetchDashboardData = async () => {
        try {
            // Fetch limited recent expenses (Pagination optimized)
            const [expensesRes, budgetRes, groupsRes, analyticsRes] = await Promise.all([
                expenseAPI.getAll({ limit: 5 }), // Only fetch 5 recent
                budgetAPI.getStatus(),
                groupAPI.getAll(),
                analyticsAPI.getData()
            ]);

            const expenses = expensesRes.data.expenses || [];
            const budgetData = budgetRes.data.budget || {};
            const analytics = analyticsRes.data.analytics || {};

            // Map Analytics Data for Dashboard Charts
            const categoryData = (analytics.categoryBreakdown || []).map(cat => ({
                name: cat.category,
                value: cat.total,
                percentage: cat.percentage
            }));

            // Use Weekly Spending (Last 4 Weeks) instead of daily calculation
            // to avoid processing 1000s of records on client
            const weeklyTrend = (analytics.weeklySpending || []).map(w => ({
                date: w.week,
                amount: w.amount
            }));
            // Actually analyticsController sends Week 4, Week 3, Week 2, Week 1 (Current).
            // Let's check analyticsController loop: for i=3 downto 0. push.
            // So it pushes Week 4 (oldest) first. So order is correct.

            setDashboardData({
                totalSpent: budgetData.totalSpent || 0,
                budget: budgetData.monthlyBudget || 0,
                remaining: budgetData.remaining || 0,
                expenses: expenses, // Only 5
                categoryData,
                groups: groupsRes.data.groups || [],
                weeklyTrend
            });
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
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

    const budgetPercentage = dashboardData.budget > 0
        ? (dashboardData.totalSpent / dashboardData.budget) * 100
        : 0;

    if (loading) {
        return <PageLoader />;
    }

    return (
        <div className="min-h-screen bg-dark-900 text-white relative overflow-hidden">
            <Sidebar />
            <TopNav title={
                <div className="flex items-center gap-2">
                    Dashboard
                    <span className="flex items-center gap-1 text-xs bg-green-500/10 text-green-400 px-2 py-1 rounded-full border border-green-500/20">
                        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse shadow-[0_0_10px_rgba(74,222,128,0.5)]"></span>
                        LIVE
                    </span>
                </div>
            } />

            <main className="md:ml-20 ml-0 pt-20 px-4 md:px-8 pb-24 md:pb-8 relative z-10 transition-all duration-300">
                <div className="max-w-[1600px] mx-auto">
                    {/* Top Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {/* Total Spent Card */}
                        <div className="premium-card group cursor-pointer">
                            <div className="flex items-start justify-between mb-4">
                                <div className="w-12 h-12 rounded-2xl bg-neon-lime/10 flex items-center justify-center group-hover:bg-neon-lime/20 transition-all">
                                    <DollarSign className="text-neon-lime" size={24} />
                                </div>
                                <TrendingUp className="text-neon-lime" size={20} />
                            </div>
                            <p className="text-gray-400 text-sm mb-1">Total Spent</p>
                            <h3 className="text-3xl font-bold text-white">₹{dashboardData.totalSpent.toLocaleString()}</h3>
                            <p className="text-xs text-gray-500 mt-2">This month</p>
                        </div>

                        {/* Budget Remaining */}
                        <div
                            className="premium-card group cursor-pointer"
                            onClick={() => navigate('/budget')}
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="w-12 h-12 rounded-2xl bg-neon-orange/10 flex items-center justify-center group-hover:bg-neon-orange/20 transition-all">
                                    <TrendingDown className="text-neon-orange" size={24} />
                                </div>
                                <span className={`text-xs px-2 py-1 rounded-full ${budgetPercentage > 90 ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                                    {budgetPercentage.toFixed(0)}%
                                </span>
                            </div>
                            <p className="text-gray-400 text-sm mb-1">Remaining</p>
                            <h3 className="text-3xl font-bold text-white">₹{dashboardData.remaining.toLocaleString()}</h3>
                            <p className="text-xs text-gray-500 mt-2">of ₹{dashboardData.budget.toLocaleString()}</p>
                        </div>

                        {/* Active Groups */}
                        <div className="premium-card group cursor-pointer" onClick={() => navigate('/groups')}>
                            <div className="flex items-start justify-between mb-4">
                                <div className="w-12 h-12 rounded-2xl bg-neon-pink/10 flex items-center justify-center group-hover:bg-neon-pink/20 transition-all">
                                    <Users className="text-neon-pink" size={24} />
                                </div>
                                <ArrowRight className="text-gray-600 group-hover:text-neon-pink transition-colors" size={20} />
                            </div>
                            <p className="text-gray-400 text-sm mb-1">Active Groups</p>
                            <h3 className="text-3xl font-bold text-white">{dashboardData.groups.length}</h3>
                            <p className="text-xs text-gray-500 mt-2">Click to manage</p>
                        </div>

                        {/* Transactions */}
                        <div className="premium-card group cursor-pointer">
                            <div className="flex items-start justify-between mb-4">
                                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-all">
                                    <Calendar className="text-blue-400" size={24} />
                                </div>
                            </div>
                            <p className="text-gray-400 text-sm mb-1">Transactions</p>
                            <h3 className="text-3xl font-bold text-white">{dashboardData.expenses.length}</h3>
                            <p className="text-xs text-gray-500 mt-2">Last 5 shown</p>
                        </div>
                    </div>

                    {/* Main Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Monthly Summary - Large Card */}
                        <div className="lg:col-span-2 premium-card">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-white">MONTHLY SUMMARY</h2>
                                <button
                                    onClick={() => navigate('/budget')}
                                    className="text-gray-400 hover:text-neon-lime transition-colors text-xs font-medium border border-gray-700 px-3 py-1 rounded-full hover:border-neon-lime"
                                >
                                    Edit Budget
                                </button>
                            </div>

                            {/* Budget Progress */}
                            <div className="mb-8">
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-gray-400 text-sm">Budget Usage</span>
                                    <span className="text-white font-semibold">{budgetPercentage.toFixed(1)}%</span>
                                </div>
                                <div className="h-3 bg-dark-800 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-500 ${budgetPercentage > 90 ? 'bg-gradient-to-r from-red-500 to-red-600' :
                                            budgetPercentage > 70 ? 'bg-gradient-to-r from-neon-orange to-orange-600' :
                                                'gradient-lime'
                                            }`}
                                        style={{ width: `${Math.min(budgetPercentage, 100)}%` }}
                                    />
                                </div>
                            </div>

                            {/* Weekly Trend Chart */}
                            <div className="h-48">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={dashboardData.weeklyTrend}>
                                        <XAxis
                                            dataKey="date"
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
                                        <Line
                                            type="monotone"
                                            dataKey="amount"
                                            stroke="#a3e635"
                                            strokeWidth={3}
                                            dot={{ fill: '#a3e635', r: 4 }}
                                            activeDot={{ r: 6, fill: '#84cc16' }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Category Breakdown */}
                        <div className="premium-card">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-white">CATEGORIES</h2>
                                <button className="text-gray-400 hover:text-neon-lime transition-colors">•••</button>
                            </div>

                            {/* Pie Chart */}
                            <div className="h-48 mb-6">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={dashboardData.categoryData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={50}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {dashboardData.categoryData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[entry.name] || '#3b82f6'} />
                                            ))}
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Category List */}
                            <div className="space-y-3">
                                {dashboardData.categoryData.map((cat, idx) => (
                                    <div key={idx} className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="w-3 h-3 rounded-full"
                                                style={{ backgroundColor: COLORS[cat.name] }}
                                            />
                                            <span className="text-gray-300 text-sm">{cat.name}</span>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-white font-semibold text-sm">₹{cat.value.toLocaleString()}</p>
                                            <p className="text-gray-500 text-xs">{cat.percentage}%</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Recent Expenses Timeline */}
                    <div className="premium-card mt-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-white">RECENT EXPENSES</h2>
                            <button
                                onClick={() => navigate('/analytics')}
                                className="text-neon-lime hover:text-neon-lime-dark transition-colors text-sm flex items-center gap-2"
                            >
                                View All <ArrowRight size={16} />
                            </button>
                        </div>

                        <div className="space-y-3">
                            {dashboardData.expenses.map((expense, idx) => (
                                <div
                                    key={expense._id || idx}
                                    className="pill bg-dark-850 hover:bg-dark-800 transition-all cursor-pointer border border-white/5 hover:border-neon-lime/30"
                                >
                                    <div
                                        className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
                                        style={{ backgroundColor: `${COLORS[expense.category]}20`, color: COLORS[expense.category] }}
                                    >
                                        {expense.category?.[0]}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-white font-medium">{expense.title}</p>
                                        <p className="text-gray-500 text-xs">
                                            {expense.type === 'friend' && expense.friendName
                                                ? <span className="text-purple-400">With {expense.friendName} • </span>
                                                : ''}
                                            {expense.category} • {new Date(expense.date).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-white font-bold">₹{expense.amount}</p>
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${expense.type === 'group' ? 'bg-neon-pink/20 text-neon-pink' :
                                            expense.type === 'friend' ? 'bg-purple-500/20 text-purple-400' :
                                                'bg-neon-lime/20 text-neon-lime'
                                            }`}>
                                            {expense.type}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {dashboardData.expenses.length === 0 && (
                            <div className="text-center py-12">
                                <p className="text-gray-500">No expenses yet. Add your first expense!</p>
                                <button
                                    onClick={() => navigate('/add-expense')}
                                    className="mt-4 px-6 py-2 gradient-lime text-black font-semibold rounded-full hover:shadow-neon-lime transition-all"
                                >
                                    Add Expense
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </main >
        </div >
    );
};

export default Dashboard;

