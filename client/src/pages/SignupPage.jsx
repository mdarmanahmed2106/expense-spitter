import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, AlertCircle } from 'lucide-react';
import { authAPI } from '../services/api'; // Keep for consistency if needed, but context is better
import { useAuth } from '../context/AuthContext';

const SignupPage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { signup } = useAuth(); // Use context instead of direct API

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const res = await signup(formData.name, formData.email, formData.password);

        if (res.success) {
            // Success! Auto-login handled by context, just redirect
            navigate('/dashboard');
        } else {
            setError(res.message);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-dark-950 flex">
            {/* Left Side - Form */}
            <div className="flex-1 flex items-center justify-center p-8">
                <div className="w-full max-w-md">
                    {/* Logo */}
                    <Link to="/" className="inline-flex items-center gap-3 mb-8">
                        <div className="w-12 h-12 rounded-2xl gradient-lime flex items-center justify-center">
                            <span className="text-black font-bold text-xl">SE</span>
                        </div>
                        <span className="text-2xl font-bold text-white">Smart Split</span>
                    </Link>

                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold text-white mb-2">Create Account</h1>
                        <p className="text-gray-400">Start managing your expenses smarter</p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-start gap-3">
                            <AlertCircle className="text-red-400 flex-shrink-0 mt-0.5" size={20} />
                            <p className="text-red-400 text-sm">{error}</p>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Name Input */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="w-full pl-12 pr-4 py-3.5 bg-dark-850 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:border-neon-lime/50 focus:outline-none transition-all"
                                    placeholder="Enter your name"
                                />
                            </div>
                        </div>

                        {/* Email Input */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="w-full pl-12 pr-4 py-3.5 bg-dark-850 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:border-neon-lime/50 focus:outline-none transition-all"
                                    placeholder="you@example.com"
                                />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    minLength={6}
                                    className="w-full pl-12 pr-4 py-3.5 bg-dark-850 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:border-neon-lime/50 focus:outline-none transition-all"
                                    placeholder="Minimum 6 characters"
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 gradient-lime text-black font-bold rounded-2xl hover:shadow-neon-lime transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
                        >
                            {loading ? 'Creating Account...' : 'Create Account'}
                            {!loading && <ArrowRight size={20} />}
                        </button>
                    </form>

                    {/* Login Link */}
                    <p className="mt-6 text-center text-gray-400">
                        Already have an account?{' '}
                        <Link to="/login" className="text-neon-lime hover:text-neon-lime-dark font-semibold">
                            Login
                        </Link>
                    </p>
                </div>
            </div>

            {/* Right Side - Visual */}
            <div className="hidden lg:flex flex-1 bg-gradient-to-br from-dark-900 to-dark-850 items-center justify-center p-12 relative overflow-hidden">
                {/* Decorative Elements */}
                <div className="absolute top-20 right-20 w-64 h-64 bg-neon-lime/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-20 left-20 w-80 h-80 bg-neon-orange/10 rounded-full blur-3xl"></div>

                <div className="relative z-10 max-w-lg">
                    <h2 className="text-5xl font-bold text-white mb-6">
                        Join the Smart Money Movement
                    </h2>
                    <p className="text-xl text-gray-300 mb-8">
                        Track expenses, split bills, and build better financial habits—all in one beautiful app.
                    </p>
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-neon-lime/20 flex items-center justify-center">
                                <span className="text-neon-lime">✓</span>
                            </div>
                            <span className="text-gray-300">Real-time budget tracking</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-neon-orange/20 flex items-center justify-center">
                                <span className="text-neon-orange">✓</span>
                            </div>
                            <span className="text-gray-300">AI-powered spending insights</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-neon-pink/20 flex items-center justify-center">
                                <span className="text-neon-pink">✓</span>
                            </div>
                            <span className="text-gray-300">Easy group expense splitting</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignupPage;

