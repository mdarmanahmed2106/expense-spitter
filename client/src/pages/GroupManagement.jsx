import React, { useEffect, useState } from 'react';
import { Users, Plus, DollarSign, Copy, Check, LogIn, X, TrendingUp, TrendingDown } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import TopNav from '../components/TopNav';
import Modal from '../components/ui/Modal';
import PageLoader from '../components/PageLoader';
import { groupAPI } from '../services/api';

const GroupManagement = () => {
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showJoinModal, setShowJoinModal] = useState(false);
    const [newGroup, setNewGroup] = useState({ name: '' });
    const [inviteCode, setInviteCode] = useState('');
    const [copiedCode, setCopiedCode] = useState(null);
    const [joinError, setJoinError] = useState('');
    const [joinSuccess, setJoinSuccess] = useState('');
    const [settlements, setSettlements] = useState({});

    useEffect(() => {
        fetchGroups();
    }, []);

    const fetchGroups = async () => {
        try {
            const res = await groupAPI.getAll();
            const groupsData = res.data.groups || [];
            setGroups(groupsData);

            // Fetch settlements for each group
            const settlementsData = {};
            for (const group of groupsData) {
                try {
                    const settlementRes = await groupAPI.getSettlements(group._id);
                    settlementsData[group._id] = settlementRes.data;
                } catch (error) {
                    console.error(`Error fetching settlements for group ${group._id}:`, error);
                }
            }
            setSettlements(settlementsData);
        } catch (error) {
            console.error('Error fetching groups:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateGroup = async (e) => {
        e.preventDefault();
        try {
            await groupAPI.create({ name: newGroup.name });
            setShowCreateModal(false);
            setNewGroup({ name: '' });
            fetchGroups();
        } catch (error) {
            console.error('Error creating group:', error);
            const errorMessage = error.response?.data?.message || 'Failed to create group';
            alert(errorMessage);
        }
    };

    const handleJoinGroup = async (e) => {
        e.preventDefault();
        setJoinError('');
        setJoinSuccess('');

        if (inviteCode.length !== 6) {
            setJoinError('Invite code must be 6 digits');
            return;
        }

        try {
            const res = await groupAPI.joinGroup(inviteCode);
            setJoinSuccess(res.data.message);
            setInviteCode('');
            setTimeout(() => {
                setShowJoinModal(false);
                setJoinSuccess('');
                fetchGroups();
            }, 1500);
        } catch (error) {
            setJoinError(error.response?.data?.message || 'Failed to join group');
        }
    };

    const copyInviteCode = (code) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(null), 2000);
    };



    if (loading) {
        return <PageLoader />;
    }

    return (
        <div className="min-h-screen bg-dark-950">
            <Sidebar />
            <TopNav title="Groups" />

            <main className="md:ml-20 ml-0 pt-16 p-8 pb-24 md:pb-8">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-2">Group Management</h1>
                            <p className="text-gray-400">Split expenses with friends</p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowJoinModal(true)}
                                className="px-6 py-3 bg-dark-850 border border-neon-orange/30 text-neon-orange font-semibold rounded-full hover:bg-neon-orange/10 transition-all flex items-center gap-2"
                            >
                                <LogIn size={20} />
                                Join Group
                            </button>
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="px-6 py-3 gradient-lime text-black font-semibold rounded-full hover:shadow-neon-lime transition-all flex items-center gap-2"
                            >
                                <Plus size={20} />
                                Create Group
                            </button>
                        </div>
                    </div>

                    {/* Groups Grid */}
                    {groups.length === 0 ? (
                        <div className="premium-card text-center py-16">
                            <Users className="mx-auto mb-4 text-gray-600" size={64} />
                            <h3 className="text-xl font-bold text-white mb-2">No Groups Yet</h3>
                            <p className="text-gray-400 mb-6">Create a group or join one using an invite code</p>
                            <div className="flex gap-3 justify-center">
                                <button
                                    onClick={() => setShowJoinModal(true)}
                                    className="px-6 py-3 bg-dark-850 border border-neon-orange/30 text-neon-orange font-semibold rounded-full hover:bg-neon-orange/10 transition-all inline-flex items-center gap-2"
                                >
                                    <LogIn size={20} />
                                    Join Group
                                </button>
                                <button
                                    onClick={() => setShowCreateModal(true)}
                                    className="px-6 py-3 gradient-lime text-black font-semibold rounded-full hover:shadow-neon-lime transition-all inline-flex items-center gap-2"
                                >
                                    <Plus size={20} />
                                    Create Group
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {groups.map((group) => (
                                <div key={group._id} className="premium-card group">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-neon-lime to-neon-orange flex items-center justify-center">
                                            <Users className="text-black" size={28} />
                                        </div>
                                        <span className="px-3 py-1 bg-neon-lime/20 text-neon-lime text-xs rounded-full">
                                            {group.members?.length || 0} members
                                        </span>
                                    </div>

                                    <h3 className="text-xl font-bold text-white mb-2">{group.name}</h3>

                                    {/* Invite Code Display */}
                                    <div className="mb-4 p-3 bg-dark-850 rounded-xl border border-white/10">
                                        <p className="text-gray-400 text-xs mb-2">Invite Code</p>
                                        <div className="flex items-center justify-between">
                                            <span className="text-2xl font-bold text-neon-lime tracking-wider">
                                                {group.inviteCode}
                                            </span>
                                            <button
                                                onClick={() => copyInviteCode(group.inviteCode)}
                                                className="p-2 hover:bg-dark-900 rounded-lg transition-all"
                                                title="Copy invite code"
                                            >
                                                {copiedCode === group.inviteCode ? (
                                                    <Check className="text-neon-lime" size={18} />
                                                ) : (
                                                    <Copy className="text-gray-400 hover:text-neon-lime" size={18} />
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Members List */}
                                    <div className="mb-4">
                                        <p className="text-gray-400 text-sm mb-2">Members:</p>
                                        <div className="flex flex-wrap gap-2">
                                            {group.members?.slice(0, 3).map((member, idx) => (
                                                <span key={idx} className="px-3 py-1 bg-dark-850 text-gray-300 text-xs rounded-full">
                                                    {member.name}
                                                </span>
                                            ))}
                                            {group.members?.length > 3 && (
                                                <span className="px-3 py-1 bg-dark-850 text-gray-400 text-xs rounded-full">
                                                    +{group.members.length - 3} more
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Stats */}
                                    <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/10">
                                        <div>
                                            <p className="text-gray-500 text-xs mb-1">Total Expenses</p>
                                            <p className="text-white font-bold">{group.expenses?.length || 0}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500 text-xs mb-1">Total Amount</p>
                                            <p className="text-neon-lime font-bold">
                                                ₹{group.expenses?.reduce((sum, exp) => sum + exp.amount, 0).toLocaleString() || 0}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Settlements Section */}
                                    {settlements[group._id] && Object.keys(settlements[group._id].settlements || {}).length > 0 && (
                                        <div className="mt-4 pt-4 border-t border-white/10">
                                            <div className="flex items-center justify-between mb-3">
                                                <p className="text-gray-400 text-sm font-medium">Settlements</p>
                                                {settlements[group._id].topSpender && (
                                                    <span className="px-2 py-1 bg-neon-orange/20 text-neon-orange text-xs rounded-full flex items-center gap-1">
                                                        <TrendingUp size={12} />
                                                        Top: {settlements[group._id].topSpender}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="space-y-2 max-h-32 overflow-y-auto">
                                                {Object.entries(settlements[group._id].settlements || {}).map(([name, balance]) => (
                                                    <div key={name} className="flex items-center justify-between p-2 bg-dark-850 rounded-lg">
                                                        <span className="text-gray-300 text-sm">{name}</span>
                                                        <div className="flex items-center gap-2">
                                                            {balance > 0 ? (
                                                                <>
                                                                    <TrendingUp size={14} className="text-neon-lime" />
                                                                    <span className="text-neon-lime font-semibold text-sm">
                                                                        +₹{Math.abs(balance).toFixed(2)}
                                                                    </span>
                                                                </>
                                                            ) : balance < 0 ? (
                                                                <>
                                                                    <TrendingDown size={14} className="text-red-400" />
                                                                    <span className="text-red-400 font-semibold text-sm">
                                                                        -₹{Math.abs(balance).toFixed(2)}
                                                                    </span>
                                                                </>
                                                            ) : (
                                                                <span className="text-gray-500 font-semibold text-sm">
                                                                    ₹0.00
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            <p className="text-gray-500 text-xs mt-2">
                                                💡 Green = owed to them, Red = they owe
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            {/* Create Group Modal */}
            <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)}>
                <div className="bg-dark-850 rounded-3xl p-8 max-w-md w-full">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-white">Create New Group</h2>
                        <button onClick={() => setShowCreateModal(false)} className="icon-btn">
                            <X size={20} />
                        </button>
                    </div>

                    <form onSubmit={handleCreateGroup} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Group Name
                            </label>
                            <input
                                type="text"
                                value={newGroup.name}
                                onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                                required
                                className="w-full px-4 py-3 bg-dark-900 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-neon-lime/50 focus:outline-none"
                                placeholder="e.g., Hostel Friends"
                            />
                        </div>

                        <p className="text-gray-400 text-sm">
                            You'll be added as the first member. Share the invite code with others to join.
                        </p>

                        <button
                            type="submit"
                            className="w-full py-3 gradient-lime text-black font-bold rounded-xl hover:shadow-neon-lime transition-all"
                        >
                            Create Group
                        </button>
                    </form>
                </div>
            </Modal>

            {/* Join Group Modal */}
            <Modal isOpen={showJoinModal} onClose={() => {
                setShowJoinModal(false);
                setJoinError('');
                setJoinSuccess('');
                setInviteCode('');
            }}>
                <div className="bg-dark-850 rounded-3xl p-8 max-w-md w-full">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-white">Join Group</h2>
                        <button onClick={() => {
                            setShowJoinModal(false);
                            setJoinError('');
                            setJoinSuccess('');
                            setInviteCode('');
                        }} className="icon-btn">
                            <X size={20} />
                        </button>
                    </div>

                    {joinSuccess ? (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 rounded-full bg-neon-lime/20 flex items-center justify-center mx-auto mb-4">
                                <Check className="text-neon-lime" size={32} />
                            </div>
                            <p className="text-neon-lime text-lg font-semibold">{joinSuccess}</p>
                        </div>
                    ) : (
                        <form onSubmit={handleJoinGroup} className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Enter 6-Digit Invite Code
                                </label>
                                <input
                                    type="text"
                                    value={inviteCode}
                                    onChange={(e) => {
                                        const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                                        setInviteCode(value);
                                        setJoinError('');
                                    }}
                                    maxLength={6}
                                    required
                                    className="w-full px-4 py-4 bg-dark-900 border border-white/10 rounded-xl text-white text-center text-3xl font-bold tracking-widest placeholder-gray-500 focus:border-neon-orange/50 focus:outline-none"
                                    placeholder="000000"
                                />
                                <p className="text-gray-500 text-xs mt-2 text-center">
                                    Ask a group member for the invite code
                                </p>
                            </div>

                            {joinError && (
                                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                                    <p className="text-red-400 text-sm text-center">{joinError}</p>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={inviteCode.length !== 6}
                                className="w-full py-3 gradient-orange text-black font-bold rounded-xl hover:shadow-neon-orange transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Join Group
                            </button>
                        </form>
                    )}
                </div>
            </Modal>
        </div>
    );
};

export default GroupManagement;

