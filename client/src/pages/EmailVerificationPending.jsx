import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Mail, RefreshCw } from 'lucide-react';
import { authAPI } from '../services/api';

const EmailVerificationPending = () => {
    const location = useLocation();
    const email = location.state?.email || '';
    const [resendEmail, setResendEmail] = useState(email);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleResend = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');

        try {
            const res = await authAPI.resendVerification(resendEmail);
            setMessage(res.data.message);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to resend verification email');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-dark-900 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                <div className="bg-dark-800 rounded-3xl p-8 border border-white/10">
                    <div className="text-center mb-8">
                        <Mail className="mx-auto mb-4 text-neon-lime" size={64} />
                        <h2 className="text-3xl font-bold text-white mb-2">Check Your Email</h2>
                        <p className="text-gray-300">
                            We've sent a verification link to:
                        </p>
                        <p className="text-neon-lime font-medium mt-2">{email}</p>
                    </div>

                    <div className="bg-dark-900 rounded-2xl p-6 mb-6">
                        <h3 className="text-white font-bold mb-3">📬 Next Steps:</h3>
                        <ol className="text-gray-300 space-y-2 text-sm">
                            <li>1. Check your inbox (and spam folder)</li>
                            <li>2. Click the verification link in the email</li>
                            <li>3. Return here to log in</li>
                        </ol>
                    </div>

                    {message && (
                        <div className="bg-neon-lime/20 border border-neon-lime/30 rounded-2xl p-4 mb-6">
                            <p className="text-neon-lime text-sm">{message}</p>
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-500/20 border border-red-500/30 rounded-2xl p-4 mb-6">
                            <p className="text-red-400 text-sm">{error}</p>
                        </div>
                    )}

                    <div className="mb-6">
                        <p className="text-gray-400 text-sm mb-4">Didn't receive the email?</p>
                        <form onSubmit={handleResend} className="space-y-3">
                            <input
                                type="email"
                                value={resendEmail}
                                onChange={(e) => setResendEmail(e.target.value)}
                                required
                                className="w-full px-4 py-3 bg-dark-850 border border-white/10 rounded-2xl text-white focus:border-neon-lime/50 focus:outline-none transition-all"
                                placeholder="Enter your email"
                            />
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 gradient-orange text-black font-bold rounded-2xl hover:shadow-neon-orange transition-all flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <RefreshCw className="animate-spin" size={20} />
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        <RefreshCw size={20} />
                                        Resend Verification Email
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    <div className="text-center">
                        <Link
                            to="/login"
                            className="text-gray-400 hover:text-white transition-colors text-sm"
                        >
                            ← Back to Login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmailVerificationPending;
