import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { UserPlus, Users, Mail, Check, X, Trash2, Search, DollarSign } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import TopNav from '../components/TopNav';
import { friendshipAPI, friendSplitAPI } from '../services/api';

const Friends = () => {
    const location = useLocation();
    const [activeTab, setActiveTab] = useState('friends'); // 'friends', 'requests', 'add', 'expenses'
    const [friends, setFriends] = useState([]);
    const [requests, setRequests] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [searchEmail, setSearchEmail] = useState('');
    const [searchResult, setSearchResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [searchLoading, setSearchLoading] = useState(false);

    // Check for tab param in URL
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const tab = params.get('tab');
        if (tab && ['friends', 'requests', 'add', 'expenses'].includes(tab)) {
            setActiveTab(tab);
        }
    }, [location.search]);

    useEffect(() => {
        fetchFriends();
        fetchRequests();
        fetchExpenses();
    }, []);

    const fetchFriends = async () => {
        try {
            const res = await friendshipAPI.getFriends();
            setFriends(res.data.friends || []);
        } catch (error) {
            console.error('Error fetching friends:', error);
        }
    };

    const fetchRequests = async () => {
        try {
            const res = await friendshipAPI.getRequests();
            setRequests(res.data.requests || []);
        } catch (error) {
            console.error('Error fetching requests:', error);
        }
    };

    const fetchExpenses = async () => {
        try {
            const res = await friendSplitAPI.getAll(); // Ensure this API method exists in api.js services
            setExpenses(res.data.friendSplits || []);
        } catch (error) {
            console.error('Error fetching expenses:', error);
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        setSearchLoading(true);
        setSearchResult(null);

        try {
            const res = await friendshipAPI.searchUsers(searchEmail);
            setSearchResult(res.data);
        } catch (error) {
            if (error.response?.status === 404) {
                alert('User not found with that email');
            } else {
                alert(error.response?.data?.message || 'Error searching for user');
            }
        } finally {
            setSearchLoading(false);
        }
    };

    const handleSendRequest = async (userId) => {
        setLoading(true);
        try {
            await friendshipAPI.sendRequest(userId);
            alert('Friend request sent!');
            setSearchResult({ ...searchResult, friendshipStatus: 'request_sent' });
        } catch (error) {
            alert(error.response?.data?.message || 'Error sending friend request');
        } finally {
            setLoading(false);
        }
    };

    const handleAcceptRequest = async (id) => {
        setLoading(true);
        try {
            await friendshipAPI.acceptRequest(id);
            fetchFriends();
            fetchRequests();
        } catch (error) {
            alert('Error accepting friend request');
        } finally {
            setLoading(false);
        }
    };

    const handleRejectRequest = async (id) => {
        setLoading(true);
        try {
            await friendshipAPI.rejectRequest(id);
            fetchRequests();
        } catch (error) {
            alert('Error rejecting friend request');
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveFriend = async (id) => {
        if (window.confirm('Are you sure you want to remove this friend?')) {
            setLoading(true);
            try {
                await friendshipAPI.removeFriend(id);
                fetchFriends();
            } catch (error) {
                alert('Error removing friend');
            } finally {
                setLoading(false);
            }
        }
    };

    const handleSettleExpense = async (id) => {
        if (window.confirm('Mark this expense as settled/paid?')) {
            try {
                await friendSplitAPI.settle(id);
                fetchExpenses();
            } catch (error) {
                alert('Error settling expense');
            }
        }
    };

    const handleDeleteExpense = async (id) => {
        if (window.confirm('Are you sure you want to delete this expense record?')) {
            try {
                await friendSplitAPI.delete(id);
                fetchExpenses();
            } catch (error) {
                alert('Error deleting expense');
            }
        }
    };

    // Calculate balances
    const calculateBalances = () => {
        let totalOwedToYou = 0;
        let totalYouOwe = 0;

        expenses.forEach(exp => {
            if (!exp.settled) {
                if (exp.paidBy === 'user') {
                    totalOwedToYou += exp.amount;
                } else {
                    totalYouOwe += exp.amount;
                }
            }
        });

        return { totalOwedToYou, totalYouOwe };
    };

    const { totalOwedToYou, totalYouOwe } = calculateBalances();

    return (
        <div className="min-h-screen bg-dark-950">
            <Sidebar />
            <TopNav title="Friends" />

            <main className="ml-20 pt-16 p-8">
                <div className="max-w-[1600px] mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold text-white mb-2">Friends & Expenses</h1>
                        <p className="text-gray-400">Manage friends and track shared expenses</p>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-4 mb-8">
                        <button
                            onClick={() => setActiveTab('friends')}
                            className={`px-6 py-3 rounded-2xl font-medium transition-all ${activeTab === 'friends'
                                ? 'bg-neon-lime text-black'
                                : 'bg-dark-800 text-gray-400 hover:bg-dark-700'
                                }`}
                        >
                            <Users className="inline mr-2" size={20} />
                            My Friends ({friends.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('requests')}
                            className={`px-6 py-3 rounded-2xl font-medium transition-all relative ${activeTab === 'requests'
                                ? 'bg-neon-orange text-black'
                                : 'bg-dark-800 text-gray-400 hover:bg-dark-700'
                                }`}
                        >
                            <Mail className="inline mr-2" size={20} />
                            Requests ({requests.length})
                            {requests.length > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                    {requests.length}
                                </span>
                            )}
                        </button>
                        {/* Expenses Tab Button Removed - Accessible via Sidebar */}
                        <button
                            onClick={() => setActiveTab('add')}
                            className={`px-6 py-3 rounded-2xl font-medium transition-all ${activeTab === 'add'
                                ? 'bg-neon-pink text-black'
                                : 'bg-dark-800 text-gray-400 hover:bg-dark-700'
                                }`}
                        >
                            <UserPlus className="inline mr-2" size={20} />
                            Add Friend
                        </button>
                    </div>

                    {/* Tab Content */}
                    <div>
                        {/* My Friends Tab */}
                        {activeTab === 'friends' && (
                            <div>
                                {friends.length === 0 ? (
                                    <div className="text-center py-20">
                                        <Users className="mx-auto mb-4 text-gray-600" size={64} />
                                        <h3 className="text-2xl font-bold text-gray-400 mb-2">No friends yet</h3>
                                        <p className="text-gray-500 mb-6">Add friends to split expenses easily!</p>
                                        <button
                                            onClick={() => setActiveTab('add')}
                                            className="px-6 py-3 gradient-lime text-black font-bold rounded-2xl hover:shadow-neon-lime transition-all"
                                        >
                                            Add Friend
                                        </button>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {friends.map((friend) => (
                                            <div
                                                key={friend._id}
                                                className="bg-dark-800 rounded-2xl p-6 border border-white/10 hover:border-neon-lime/30 transition-all"
                                            >
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className="flex-1">
                                                        <h3 className="text-white font-bold text-lg mb-1">
                                                            {friend.name}
                                                        </h3>
                                                        <p className="text-gray-400 text-sm">{friend.email}</p>
                                                    </div>
                                                    <button
                                                        onClick={() => handleRemoveFriend(friend._id)}
                                                        disabled={loading}
                                                        className="p-2 bg-red-500/20 text-red-400 rounded-xl hover:bg-red-500/30 transition-all"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                                <p className="text-gray-500 text-xs">
                                                    Friends since {new Date(friend.since).toLocaleDateString('en-IN', {
                                                        month: 'short',
                                                        year: 'numeric'
                                                    })}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Friend Requests Tab */}
                        {activeTab === 'requests' && (
                            <div>
                                {requests.length === 0 ? (
                                    <div className="text-center py-20">
                                        <Mail className="mx-auto mb-4 text-gray-600" size={64} />
                                        <h3 className="text-2xl font-bold text-gray-400 mb-2">No pending requests</h3>
                                        <p className="text-gray-500">You're all caught up!</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {requests.map((request) => (
                                            <div
                                                key={request._id}
                                                className="bg-dark-800 rounded-2xl p-6 border border-neon-orange/30"
                                            >
                                                <div className="mb-4">
                                                    <h3 className="text-white font-bold text-lg mb-1">
                                                        {request.requester.name}
                                                    </h3>
                                                    <p className="text-gray-400 text-sm">{request.requester.email}</p>
                                                </div>
                                                <p className="text-gray-500 text-xs mb-4">
                                                    {new Date(request.createdAt).toLocaleDateString('en-IN', {
                                                        day: 'numeric',
                                                        month: 'short'
                                                    })}
                                                </p>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleAcceptRequest(request._id)}
                                                        disabled={loading}
                                                        className="flex-1 py-2 bg-neon-lime/20 text-neon-lime rounded-xl hover:bg-neon-lime/30 transition-all flex items-center justify-center gap-2 font-medium"
                                                    >
                                                        <Check size={16} />
                                                        Accept
                                                    </button>
                                                    <button
                                                        onClick={() => handleRejectRequest(request._id)}
                                                        disabled={loading}
                                                        className="flex-1 py-2 bg-red-500/20 text-red-400 rounded-xl hover:bg-red-500/30 transition-all flex items-center justify-center gap-2 font-medium"
                                                    >
                                                        <X size={16} />
                                                        Reject
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Expenses Tab */}
                        {activeTab === 'expenses' && (
                            <div className="space-y-8">
                                {/* Summary Cards */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-dark-800 rounded-2xl p-6 border border-green-500/30">
                                        <p className="text-gray-400 mb-1">Friends Owe You</p>
                                        <h3 className="text-3xl font-bold text-green-400">₹{totalOwedToYou.toFixed(2)}</h3>
                                        <p className="text-xs text-gray-500 mt-2">Total credit</p>
                                    </div>
                                    <div className="bg-dark-800 rounded-2xl p-6 border border-red-500/30">
                                        <p className="text-gray-400 mb-1">You Owe Friends</p>
                                        <h3 className="text-3xl font-bold text-red-400">₹{totalYouOwe.toFixed(2)}</h3>
                                        <p className="text-xs text-gray-500 mt-2">Total debt</p>
                                    </div>
                                </div>

                                {/* Transactions List */}
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-4">Transaction History</h3>
                                    {expenses.length === 0 ? (
                                        <p className="text-gray-500 text-center py-10">No expenses recorded yet.</p>
                                    ) : (
                                        <div className="space-y-4">
                                            {expenses.map((expense) => (
                                                <div
                                                    key={expense._id}
                                                    className={`bg-dark-800 rounded-2xl p-6 border transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${expense.settled
                                                        ? 'border-white/10 opacity-60'
                                                        : expense.paidBy === 'user'
                                                            ? 'border-green-500/20 hover:border-green-500/40'
                                                            : 'border-red-500/20 hover:border-red-500/40'
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold ${expense.paidBy === 'user' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                                                            }`}>
                                                            {expense.paidBy === 'user' ? '+' : '-'}
                                                        </div>
                                                        <div>
                                                            <h4 className="text-white font-bold text-lg">{expense.title}</h4>
                                                            <p className="text-gray-400 text-sm">
                                                                With: <span className="text-white">{expense.friendName}</span> • {new Date(expense.date).toLocaleDateString()}
                                                            </p>
                                                            <p className="text-xs text-gray-500 mt-1">
                                                                {expense.paidBy === 'user'
                                                                    ? 'You paid, they owe you'
                                                                    : `${expense.friendName} paid, you owe them`}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-6 w-full md:w-auto">
                                                        <div className="text-right flex-1 md:flex-none">
                                                            <p className={`font-bold text-xl ${expense.settled ? 'text-gray-500 line-through' :
                                                                expense.paidBy === 'user' ? 'text-green-400' : 'text-red-400'
                                                                }`}>
                                                                ₹{expense.amount.toFixed(2)}
                                                            </p>
                                                            {expense.settled && <span className="text-xs text-gray-500 font-medium">SETTLED</span>}
                                                        </div>

                                                        {!expense.settled && (
                                                            <button
                                                                onClick={() => handleSettleExpense(expense._id)}
                                                                className="px-4 py-2 bg-dark-700 hover:bg-neon-lime hover:text-black text-gray-300 rounded-xl text-sm font-medium transition-all"
                                                            >
                                                                Settle
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => handleDeleteExpense(expense._id)}
                                                            className="p-2 text-gray-600 hover:text-red-400 transition-colors"
                                                            title="Delete"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Add Friend Tab */}
                        {activeTab === 'add' && (
                            <div className="max-w-2xl mx-auto">
                                <div className="bg-dark-800 rounded-3xl p-8 border border-white/10">
                                    <h2 className="text-2xl font-bold text-white mb-6">Search for Friends</h2>
                                    <form onSubmit={handleSearch} className="mb-6">
                                        <div className="flex gap-4">
                                            <div className="flex-1">
                                                <input
                                                    type="email"
                                                    value={searchEmail}
                                                    onChange={(e) => setSearchEmail(e.target.value)}
                                                    required
                                                    className="w-full px-4 py-3.5 bg-dark-850 border border-white/10 rounded-2xl text-white focus:border-neon-pink/50 focus:outline-none transition-all"
                                                    placeholder="Enter friend's email"
                                                />
                                            </div>
                                            <button
                                                type="submit"
                                                disabled={searchLoading}
                                                className="px-6 py-3.5 gradient-pink text-black font-bold rounded-2xl hover:shadow-neon-pink transition-all flex items-center gap-2"
                                            >
                                                <Search size={20} />
                                                {searchLoading ? 'Searching...' : 'Search'}
                                            </button>
                                        </div>
                                    </form>

                                    {/* Search Result */}
                                    {searchResult && (
                                        <div className="bg-dark-900 rounded-2xl p-6 border border-white/10">
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1">
                                                    <h3 className="text-white font-bold text-lg mb-1">
                                                        {searchResult.user.name}
                                                    </h3>
                                                    <p className="text-gray-400 text-sm">{searchResult.user.email}</p>
                                                </div>
                                                <div>
                                                    {searchResult.friendshipStatus === 'none' && (
                                                        <button
                                                            onClick={() => handleSendRequest(searchResult.user._id)}
                                                            disabled={loading}
                                                            className="px-6 py-2 bg-neon-pink text-black font-bold rounded-xl hover:shadow-neon-pink transition-all"
                                                        >
                                                            Send Request
                                                        </button>
                                                    )}
                                                    {searchResult.friendshipStatus === 'friends' && (
                                                        <span className="px-6 py-2 bg-neon-lime/20 text-neon-lime rounded-xl font-medium">
                                                            Already Friends
                                                        </span>
                                                    )}
                                                    {searchResult.friendshipStatus === 'request_sent' && (
                                                        <span className="px-6 py-2 bg-gray-700 text-gray-400 rounded-xl font-medium">
                                                            Request Sent
                                                        </span>
                                                    )}
                                                    {searchResult.friendshipStatus === 'request_received' && (
                                                        <span className="px-6 py-2 bg-neon-orange/20 text-neon-orange rounded-xl font-medium">
                                                            Check Requests Tab
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main >
        </div >
    );
};

export default Friends;
