import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Loader } from 'lucide-react';
import { authAPI } from '../services/api';

const VerifyEmail = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error'
    const [message, setMessage] = useState('');

    useEffect(() => {
        verifyEmail();
    }, [token]);

    const verifyEmail = async () => {
        try {
            const res = await authAPI.verifyEmail(token);
            setStatus('success');
            setMessage(res.data.message);

            // Redirect to login after 3 seconds
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (error) {
            setStatus('error');
            setMessage(error.response?.data?.message || 'Email verification failed');
        }
    };

    return (
        <div className="min-h-screen bg-dark-900 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                <div className="bg-dark-800 rounded-3xl p-8 border border-white/10 text-center">
                    {status === 'verifying' && (
                        <>
                            <Loader className="mx-auto mb-4 text-neon-lime animate-spin" size={64} />
                            <h2 className="text-2xl font-bold text-white mb-2">Verifying Email...</h2>
                            <p className="text-gray-400">Please wait while we verify your email address.</p>
                        </>
                    )}

                    {status === 'success' && (
                        <>
                            <CheckCircle className="mx-auto mb-4 text-neon-lime" size={64} />
                            <h2 className="text-2xl font-bold text-white mb-2">Email Verified!</h2>
                            <p className="text-gray-300 mb-4">{message}</p>
                            <p className="text-gray-400 text-sm mb-6">Redirecting to login...</p>
                            <Link
                                to="/login"
                                className="inline-block px-6 py-3 gradient-lime text-black font-bold rounded-2xl hover:shadow-neon-lime transition-all"
                            >
                                Go to Login
                            </Link>
                        </>
                    )}

                    {status === 'error' && (
                        <>
                            <XCircle className="mx-auto mb-4 text-red-500" size={64} />
                            <h2 className="text-2xl font-bold text-white mb-2">Verification Failed</h2>
                            <p className="text-gray-300 mb-6">{message}</p>
                            <div className="space-y-3">
                                <Link
                                    to="/verification-pending"
                                    className="block px-6 py-3 gradient-orange text-black font-bold rounded-2xl hover:shadow-neon-orange transition-all"
                                >
                                    Resend Verification Email
                                </Link>
                                <Link
                                    to="/login"
                                    className="block px-6 py-3 bg-dark-700 text-white font-medium rounded-2xl hover:bg-dark-600 transition-all"
                                >
                                    Back to Login
                                </Link>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VerifyEmail;
