import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight, TrendingUp, Users, PieChart, Shield, Zap, DollarSign } from 'lucide-react';

const LandingPage = () => {
    const navigate = useNavigate();

    const features = [
        {
            icon: DollarSign,
            title: 'Smart Budgeting',
            description: 'Set monthly budgets and get real-time warnings',
            color: 'neon-lime'
        },
        {
            icon: PieChart,
            title: 'Visual Analytics',
            description: 'Beautiful charts showing your spending patterns',
            color: 'neon-orange'
        },
        {
            icon: Users,
            title: 'Group Expenses',
            description: 'Split bills with friends, auto-calculate settlements',
            color: 'neon-pink'
        },
        {
            icon: TrendingUp,
            title: 'Spending Insights',
            description: 'AI-powered guilty spending detection',
            color: 'neon-blue'
        },
        {
            icon: Shield,
            title: 'Secure & Private',
            description: 'Your data is encrypted and protected',
            color: 'neon-lime'
        },
        {
            icon: Zap,
            title: 'Lightning Fast',
            description: 'Real-time updates and instant calculations',
            color: 'neon-orange'
        }
    ];

    return (
        <div className="min-h-screen bg-dark-950 text-white">
            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-dark-950/80 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl gradient-lime flex items-center justify-center">
                            <span className="text-black font-bold text-lg">SE</span>
                        </div>
                        <span className="text-xl font-bold">Smart Split</span>
                    </div>

                    <div className="flex items-center gap-4">
                        <Link
                            to="/login"
                            className="px-6 py-2 text-gray-300 hover:text-white transition-colors"
                        >
                            Login
                        </Link>
                        <Link
                            to="/signup"
                            className="px-6 py-2 gradient-lime text-black font-semibold rounded-full hover:shadow-neon-lime transition-all"
                        >
                            Get Started Free
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-6">
                <div className="max-w-7xl mx-auto text-center">
                    <div className="inline-block mb-6">
                        <span className="px-4 py-2 bg-dark-850 border border-neon-lime/30 rounded-full text-sm text-neon-lime">
                            ✨ Track smarter. Spend better. Split effortlessly.
                        </span>
                    </div>

                    <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold mb-6 leading-tight">
                        Expense Management
                        <br />
                        <span className="bg-gradient-to-r from-neon-lime via-neon-orange to-neon-pink bg-clip-text text-transparent">
                            Reimagined
                        </span>
                    </h1>

                    <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
                        The only expense tracker built specifically for hostel students.
                        Manage budgets, split bills, and build financial discipline—all in one beautiful app.
                    </p>

                    <div className="flex items-center justify-center gap-4">
                        <button
                            onClick={() => navigate('/signup')}
                            className="px-8 py-4 gradient-lime text-black font-bold rounded-full hover:shadow-neon-lime transition-all flex items-center gap-2 text-lg"
                        >
                            Start Free Today
                            <ArrowRight size={20} />
                        </button>
                        <button
                            onClick={() => navigate('/login')}
                            className="px-8 py-4 bg-dark-850 border border-white/10 text-white font-semibold rounded-full hover:border-neon-lime/30 transition-all text-lg"
                        >
                            View Demo
                        </button>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-8 mt-20 max-w-3xl mx-auto">
                        <div className="premium-card text-center">
                            <h3 className="text-4xl font-bold text-neon-lime mb-2">₹10L+</h3>
                            <p className="text-gray-400 text-sm">Money Tracked</p>
                        </div>
                        <div className="premium-card text-center">
                            <h3 className="text-4xl font-bold text-neon-orange mb-2">5K+</h3>
                            <p className="text-gray-400 text-sm">Active Users</p>
                        </div>
                        <div className="premium-card text-center">
                            <h3 className="text-4xl font-bold text-neon-pink mb-2">99%</h3>
                            <p className="text-gray-400 text-sm">Satisfaction</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-20 px-6 bg-dark-900/50">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold mb-4">Everything You Need</h2>
                        <p className="text-gray-400 text-lg">Powerful features designed for students</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map((feature, idx) => {
                            const Icon = feature.icon;
                            // Explicit mapping for Tailwind to scan
                            const bgColors = {
                                'neon-lime': 'bg-neon-lime/10 group-hover:bg-neon-lime/20',
                                'neon-orange': 'bg-neon-orange/10 group-hover:bg-neon-orange/20',
                                'neon-pink': 'bg-neon-pink/10 group-hover:bg-neon-pink/20',
                                'neon-blue': 'bg-neon-blue/10 group-hover:bg-neon-blue/20'
                            };
                            const textColors = {
                                'neon-lime': 'text-neon-lime',
                                'neon-orange': 'text-neon-orange',
                                'neon-pink': 'text-neon-pink',
                                'neon-blue': 'text-neon-blue'
                            };

                            return (
                                <div key={idx} className="premium-card group cursor-pointer">
                                    <div className={`w-14 h-14 rounded-2xl ${bgColors[feature.color]} flex items-center justify-center mb-4 transition-all`}>
                                        <Icon className={textColors[feature.color]} size={28} />
                                    </div>
                                    <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                                    <p className="text-gray-400">{feature.description}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-6">
                <div className="max-w-4xl mx-auto">
                    <div className="premium-card text-center bg-gradient-to-br from-dark-850 to-dark-800 border-2 border-neon-lime/20">
                        <h2 className="text-4xl font-bold mb-4">Ready to Take Control?</h2>
                        <p className="text-gray-300 text-lg mb-8">
                            Join thousands of students managing their finances smarter
                        </p>
                        <button
                            onClick={() => navigate('/signup')}
                            className="px-10 py-4 gradient-lime text-black font-bold rounded-full hover:shadow-neon-lime transition-all inline-flex items-center gap-2 text-lg"
                        >
                            Get Started Free
                            <ArrowRight size={20} />
                        </button>
                        <p className="text-gray-500 text-sm mt-4">No credit card required • Free forever</p>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-white/5 py-8 px-6">
                <div className="max-w-7xl mx-auto text-center text-gray-500 text-sm">
                    <p>© 2026 Smart Split. Built for students, by students.</p>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;

