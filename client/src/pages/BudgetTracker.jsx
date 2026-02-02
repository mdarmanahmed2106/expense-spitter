import React, { useEffect, useState } from 'react';
import { DollarSign, TrendingUp, AlertTriangle, CheckCircle, Edit2 } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import TopNav from '../components/TopNav';
import PageLoader from '../components/PageLoader';
import { budgetAPI } from '../services/api';

const BudgetTracker = () => {
    const [loading, setLoading] = useState(true);
    const [budgetData, setBudgetData] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [newBudget, setNewBudget] = useState('');

    useEffect(() => {
        fetchBudget();
    }, []);

    const fetchBudget = async () => {
        try {
            const res = await budgetAPI.getStatus();
            setBudgetData(res.data.budget);
            setNewBudget(res.data.budget?.monthlyBudget || 0);
        } catch (error) {
            console.error('Error fetching budget:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateBudget = async (e) => {
        e.preventDefault();
        try {
            await budgetAPI.update(parseFloat(newBudget));
            await fetchBudget();
            setIsEditing(false);
        } catch (error) {
            console.error('Error updating budget:', error);
            alert('Failed to update budget');
        }
    };

    if (loading) {
        return <PageLoader />;
    }

    const percentage = budgetData?.monthlyBudget > 0
        ? (budgetData.totalSpent / budgetData.monthlyBudget) * 100
        : 0;

    const getStatusColor = () => {
        if (percentage >= 100) return 'red';
        if (percentage >= 90) return 'neon-orange';
        if (percentage >= 70) return 'yellow';
        return 'neon-lime';
    };

    const getStatusIcon = () => {
        if (percentage >= 100) return AlertTriangle;
        if (percentage >= 70) return AlertTriangle;
        return CheckCircle;
    };

    const StatusIcon = getStatusIcon();
    const statusColor = getStatusColor();

    return (
        <div className="min-h-screen bg-dark-950">
            <Sidebar />
            <TopNav title="Budget Tracker" />

            <main className="md:ml-20 ml-0 pt-16 p-4 md:p-8 pb-24 md:pb-8">
                <div className="max-w-4xl mx-auto">
                    {/* Main Budget Card */}
                    <div className="premium-card mb-8">
                        <div className="flex items-start justify-between mb-8">
                            <div>
                                <h1 className="text-3xl font-bold text-white mb-2">Monthly Budget</h1>
                                <p className="text-gray-400">Track your spending against your budget</p>
                            </div>
                            <button
                                onClick={() => setIsEditing(!isEditing)}
                                className="icon-btn"
                            >
                                <Edit2 size={20} />
                            </button>
                        </div>

                        {/* Edit Budget Form */}
                        {isEditing && (
                            <form onSubmit={handleUpdateBudget} className="mb-8 p-6 bg-dark-850 rounded-2xl border border-white/10">
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Set Monthly Budget (₹)
                                </label>
                                <div className="flex gap-3">
                                    <input
                                        type="number"
                                        value={newBudget}
                                        onChange={(e) => setNewBudget(e.target.value)}
                                        required
                                        min="0"
                                        className="flex-1 px-4 py-3 bg-dark-900 border border-white/10 rounded-xl text-white focus:border-neon-lime/50 focus:outline-none"
                                        placeholder="Enter amount"
                                    />
                                    <button
                                        type="submit"
                                        className="px-6 py-3 gradient-lime text-black font-semibold rounded-xl hover:shadow-neon-lime transition-all"
                                    >
                                        Update
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* Budget Overview */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <div className="p-6 bg-dark-850 rounded-2xl">
                                <div className="flex items-center gap-3 mb-2">
                                    <DollarSign className="text-neon-lime" size={24} />
                                    <p className="text-gray-400 text-sm">Monthly Budget</p>
                                </div>
                                <h3 className="text-3xl font-bold text-white">₹{budgetData?.monthlyBudget?.toLocaleString() || 0}</h3>
                            </div>

                            <div className="p-6 bg-dark-850 rounded-2xl">
                                <div className="flex items-center gap-3 mb-2">
                                    <TrendingUp className="text-neon-orange" size={24} />
                                    <p className="text-gray-400 text-sm">Total Spent</p>
                                </div>
                                <h3 className="text-3xl font-bold text-white">₹{budgetData?.totalSpent?.toLocaleString() || 0}</h3>
                            </div>

                            <div className="p-6 bg-dark-850 rounded-2xl">
                                <div className="flex items-center gap-3 mb-2">
                                    <StatusIcon className={`text-${statusColor}`} size={24} />
                                    <p className="text-gray-400 text-sm">Remaining</p>
                                </div>
                                <h3 className="text-3xl font-bold text-white">₹{budgetData?.remaining?.toLocaleString() || 0}</h3>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="mb-6">
                            <div className="flex justify-between items-center mb-3">
                                <span className="text-gray-300 font-medium">Budget Usage</span>
                                <span className={`text-${statusColor} font-bold text-lg`}>{percentage.toFixed(1)}%</span>
                            </div>
                            <div className="h-6 bg-dark-800 rounded-full overflow-hidden relative">
                                <div
                                    className={`h-full rounded-full transition-all duration-500 ${percentage >= 100 ? 'bg-gradient-to-r from-red-500 to-red-600' :
                                        percentage >= 90 ? 'bg-gradient-to-r from-orange-500 to-red-500' :
                                            percentage >= 70 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                                                'gradient-lime'
                                        }`}
                                    style={{ width: `${Math.min(percentage, 100)}%` }}
                                />
                                {/* Warning markers */}
                                <div className="absolute top-0 left-[70%] w-0.5 h-full bg-white/20"></div>
                                <div className="absolute top-0 left-[90%] w-0.5 h-full bg-white/30"></div>
                            </div>
                            <div className="flex justify-between mt-2 text-xs text-gray-500">
                                <span>0%</span>
                                <span>70%</span>
                                <span>90%</span>
                                <span>100%</span>
                            </div>
                        </div>

                        {/* Status Messages */}
                        {percentage >= 100 && (
                            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-start gap-3">
                                <AlertTriangle className="text-red-400 flex-shrink-0 mt-0.5" size={20} />
                                <div>
                                    <p className="text-red-400 font-semibold">Budget Exceeded!</p>
                                    <p className="text-red-300 text-sm">You've spent more than your monthly budget. Consider reducing expenses.</p>
                                </div>
                            </div>
                        )}

                        {percentage >= 90 && percentage < 100 && (
                            <div className="p-4 bg-orange-500/10 border border-orange-500/30 rounded-2xl flex items-start gap-3">
                                <AlertTriangle className="text-orange-400 flex-shrink-0 mt-0.5" size={20} />
                                <div>
                                    <p className="text-orange-400 font-semibold">Critical Warning!</p>
                                    <p className="text-orange-300 text-sm">You've used 90% of your budget. Be careful with spending.</p>
                                </div>
                            </div>
                        )}

                        {percentage >= 70 && percentage < 90 && (
                            <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-2xl flex items-start gap-3">
                                <AlertTriangle className="text-yellow-400 flex-shrink-0 mt-0.5" size={20} />
                                <div>
                                    <p className="text-yellow-400 font-semibold">Warning!</p>
                                    <p className="text-yellow-300 text-sm">You've used 70% of your budget. Monitor your spending closely.</p>
                                </div>
                            </div>
                        )}

                        {percentage < 70 && (
                            <div className="p-4 bg-neon-lime/10 border border-neon-lime/30 rounded-2xl flex items-start gap-3">
                                <CheckCircle className="text-neon-lime flex-shrink-0 mt-0.5" size={20} />
                                <div>
                                    <p className="text-neon-lime font-semibold">On Track!</p>
                                    <p className="text-gray-300 text-sm">You're managing your budget well. Keep it up!</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Tips Card */}
                    <div className="premium-card">
                        <h2 className="text-xl font-bold text-white mb-4">💡 Budget Tips</h2>
                        <div className="space-y-3">
                            <div className="flex items-start gap-3">
                                <div className="w-2 h-2 rounded-full bg-neon-lime mt-2"></div>
                                <p className="text-gray-300">Set realistic budgets based on your income and expenses</p>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-2 h-2 rounded-full bg-neon-orange mt-2"></div>
                                <p className="text-gray-300">Review your spending weekly to stay on track</p>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-2 h-2 rounded-full bg-neon-pink mt-2"></div>
                                <p className="text-gray-300">Use the 50/30/20 rule: 50% needs, 30% wants, 20% savings</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default BudgetTracker;

