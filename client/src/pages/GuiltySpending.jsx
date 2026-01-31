import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { analyticsAPI } from '../services/api';
import Card from '../components/ui/Card';
import PageLoader from '../components/PageLoader';

export default function GuiltySpending() {
    const [guiltyData, setGuiltyData] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchGuiltySpending();
    }, []);

    const fetchGuiltySpending = async () => {
        try {
            const response = await analyticsAPI.getGuiltySpending();
            setGuiltyData(response.data.guiltySpending);
        } catch (error) {
            console.error('Error fetching guilty spending:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <PageLoader />;
    }

    const severityStyles = {
        info: 'border-blue-500 bg-blue-500/10',
        warning: 'border-yellow-500 bg-yellow-500/10',
        critical: 'border-red-500 bg-red-500/10'
    };

    const severityIcons = {
        info: '💡',
        warning: '⚠️',
        critical: '🚨'
    };

    return (
        <div className="min-h-screen bg-dark-900 py-8">
            <div className="container mx-auto px-4 max-w-4xl">
                <div className="mb-6">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        ← Back to Dashboard
                    </button>
                </div>

                <h1 className="text-4xl font-bold mb-4">
                    <span className="bg-gradient-to-r from-accent-violet to-accent-cyan bg-clip-text text-transparent">
                        Guilty Spending Detector 😈
                    </span>
                </h1>
                <p className="text-gray-400 mb-8">
                    AI-powered insights to catch unusual spending patterns and keep you accountable.
                </p>

                {/* Spending Overview */}
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                    <Card>
                        <div className="text-sm text-gray-400 mb-2">This Week's Spending</div>
                        <div className="text-3xl font-bold">₹{guiltyData.weekTotal}</div>
                    </Card>
                    <Card>
                        <div className="text-sm text-gray-400 mb-2">Last Week's Spending</div>
                        <div className="text-3xl font-bold">₹{guiltyData.lastWeekTotal}</div>
                        {guiltyData.weekTotal > guiltyData.lastWeekTotal && (
                            <div className="text-sm text-red-400 mt-2">
                                ↑ {Math.round(((guiltyData.weekTotal - guiltyData.lastWeekTotal) / guiltyData.lastWeekTotal) * 100)}% increase
                            </div>
                        )}
                    </Card>
                </div>

                {/* Warnings Section */}
                <Card>
                    <h2 className="text-2xl font-bold mb-6">
                        {guiltyData.hasWarnings ? '🔍 We Found Some Patterns...' : '✅ Looking Good!'}
                    </h2>

                    {guiltyData.warnings.length > 0 ? (
                        <div className="space-y-4">
                            {guiltyData.warnings.map((warning, index) => (
                                <div
                                    key={index}
                                    className={`p-4 rounded-xl border-2 ${severityStyles[warning.severity]} animate-slide-up`}
                                    style={{ animationDelay: `${index * 0.1}s` }}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="text-3xl">{severityIcons[warning.severity]}</div>
                                        <div className="flex-1">
                                            <div className="font-semibold mb-1 capitalize">{warning.type.replace('_', ' ')}</div>
                                            <div className="text-lg">{warning.message}</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <div className="text-6xl mb-4">🎉</div>
                            <h3 className="text-2xl font-bold mb-2">Great Job!</h3>
                            <p className="text-gray-400">
                                No unusual spending patterns detected. You're managing your finances well!
                            </p>
                        </div>
                    )}
                </Card>

                {/* Category Breakdown */}
                {Object.values(guiltyData.categoryBreakdown).some(v => v > 0) && (
                    <Card className="mt-6">
                        <h2 className="text-2xl font-bold mb-4">This Week's Category Breakdown</h2>
                        <div className="space-y-3">
                            {Object.entries(guiltyData.categoryBreakdown)
                                .filter(([_, amount]) => amount > 0)
                                .sort(([_, a], [__, b]) => b - a)
                                .map(([category, amount]) => {
                                    const percentage = guiltyData.weekTotal > 0
                                        ? Math.round((amount / guiltyData.weekTotal) * 100)
                                        : 0;

                                    return (
                                        <div key={category} className="glass rounded-lg p-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="font-semibold">{category}</span>
                                                <span className="text-lg font-bold">₹{amount}</span>
                                            </div>
                                            <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-accent-violet to-accent-cyan"
                                                    style={{ width: `${percentage}%` }}
                                                />
                                            </div>
                                            <div className="text-sm text-gray-400 mt-1">{percentage}% of weekly spending</div>
                                        </div>
                                    );
                                })}
                        </div>
                    </Card>
                )}

                {/* Tips */}
                <Card variant="gradient" className="mt-6">
                    <h3 className="text-xl font-bold mb-3">💡 Pro Tips</h3>
                    <ul className="space-y-2 opacity-90">
                        <li>• Try to keep food expenses under 40% of your total spending</li>
                        <li>• Maintain consistent spending week-over-week</li>
                        <li>• Set a monthly budget and stick to it</li>
                        <li>• Review your analytics regularly to spot trends</li>
                    </ul>
                </Card>
            </div>
        </div>
    );
}
