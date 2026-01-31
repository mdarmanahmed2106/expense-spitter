import React, { useState, useEffect } from 'react';
import {
    Filter, Calendar, ChevronLeft, ChevronRight,
    ArrowUpDown, Search, Download
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import TopNav from '../components/TopNav';
import { expenseAPI } from '../services/api';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const Transactions = () => {
    const [loading, setLoading] = useState(true);
    const [expenses, setExpenses] = useState([]);
    const [pagination, setPagination] = useState({
        page: 1,
        pages: 1,
        total: 0
    });

    const [filters, setFilters] = useState({
        category: 'All',
        type: 'all',
        startDate: '',
        endDate: '',
        sortBy: 'date',
        order: 'desc'
    });

    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        fetchExpenses();
    }, [pagination.page, filters]);

    const fetchExpenses = async () => {
        setLoading(true);
        try {
            const params = {
                page: pagination.page,
                limit: 10, // Show 10 per page
                ...filters
            };

            // Clean up empty filters
            if (params.category === 'All') delete params.category;
            if (params.type === 'all') delete params.type;
            if (!params.startDate) delete params.startDate;
            if (!params.endDate) delete params.endDate;

            const res = await expenseAPI.getAll(params);
            setExpenses(res.data.expenses);
            setPagination({
                page: res.data.page,
                pages: res.data.pages,
                total: res.data.total
            });
        } catch (error) {
            console.error('Error fetching transactions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setPagination(prev => ({ ...prev, page: 1 })); // Reset to page 1 on filter change
    };

    const clearFilters = () => {
        setFilters({
            category: 'All',
            type: 'all',
            startDate: '',
            endDate: '',
            sortBy: 'date',
            order: 'desc'
        });
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const categoryColors = {
        Food: 'neon-lime',
        Travel: 'neon-orange',
        Fun: 'neon-pink',
        Misc: 'neon-blue'
    };

    return (
        <div className="min-h-screen bg-dark-950">
            <Sidebar />
            <TopNav title="Transactions" />

            <main className="md:ml-20 ml-0 pt-16 p-6 pb-24">
                <div className="max-w-6xl mx-auto space-y-6">

                    {/* Header & Controls */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-white">All Transactions</h1>
                            <p className="text-gray-400 text-sm">
                                Showing {expenses.length} of {pagination.total} records
                            </p>
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${showFilters ? 'bg-neon-lime/10 border-neon-lime text-neon-lime' : 'bg-dark-850 border-white/10 text-gray-400 hover:text-white'}`}
                            >
                                <Filter size={18} />
                                <span>Filters</span>
                            </button>
                            {/* Export button placeholder */}
                            {/* <button className="flex items-center gap-2 px-4 py-2 bg-dark-850 border border-white/10 rounded-xl text-gray-400 hover:text-white transition-all">
                                <Download size={18} />
                                <span className="hidden md:inline">Export</span>
                            </button> */}
                        </div>
                    </div>

                    {/* Filter Bar */}
                    {showFilters && (
                        <div className="bg-dark-900/50 border border-white/5 p-4 rounded-2xl grid grid-cols-1 md:grid-cols-4 gap-4 animate-in fade-in slide-in-from-top-2">
                            {/* Category */}
                            <div>
                                <label className="text-xs text-gray-500 mb-1 block">Category</label>
                                <select
                                    value={filters.category}
                                    onChange={(e) => handleFilterChange('category', e.target.value)}
                                    className="w-full bg-dark-950 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-neon-lime/50 outline-none"
                                >
                                    <option value="All">All Categories</option>
                                    <option value="Food">Food</option>
                                    <option value="Travel">Travel</option>
                                    <option value="Fun">Fun</option>
                                    <option value="Misc">Misc</option>
                                </select>
                            </div>

                            {/* Type */}
                            <div>
                                <label className="text-xs text-gray-500 mb-1 block">Type</label>
                                <select
                                    value={filters.type}
                                    onChange={(e) => handleFilterChange('type', e.target.value)}
                                    className="w-full bg-dark-950 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-neon-lime/50 outline-none"
                                >
                                    <option value="all">All Types</option>
                                    <option value="personal">Personal</option>
                                    <option value="group">Group</option>
                                    <option value="friend">Friend Split</option>
                                </select>
                            </div>

                            {/* Date Range */}
                            <div className="md:col-span-2 flex gap-2">
                                <div className="flex-1">
                                    <label className="text-xs text-gray-500 mb-1 block">From</label>
                                    <input
                                        type="date"
                                        value={filters.startDate}
                                        onChange={(e) => handleFilterChange('startDate', e.target.value)}
                                        className="w-full bg-dark-950 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-neon-lime/50 outline-none"
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="text-xs text-gray-500 mb-1 block">To</label>
                                    <input
                                        type="date"
                                        value={filters.endDate}
                                        onChange={(e) => handleFilterChange('endDate', e.target.value)}
                                        className="w-full bg-dark-950 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-neon-lime/50 outline-none"
                                    />
                                </div>
                            </div>

                            {/* Sort & Clear */}
                            <div className="md:col-span-4 flex justify-between items-center pt-2 border-t border-white/5">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-500">Sort by:</span>
                                    <select
                                        value={`${filters.sortBy}-${filters.order}`}
                                        onChange={(e) => {
                                            const [sortBy, order] = e.target.value.split('-');
                                            setFilters(prev => ({ ...prev, sortBy, order }));
                                        }}
                                        className="bg-transparent text-sm text-neon-lime border-none outline-none cursor-pointer"
                                    >
                                        <option value="date-desc">Newest First</option>
                                        <option value="date-asc">Oldest First</option>
                                        <option value="amount-desc">Highest Amount</option>
                                        <option value="amount-asc">Lowest Amount</option>
                                    </select>
                                </div>
                                <button
                                    onClick={clearFilters}
                                    className="text-xs text-red-400 hover:text-red-300 underline"
                                >
                                    Clear Filters
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Transactions List */}
                    {loading ? (
                        <div className="flex justify-center py-20">
                            <LoadingSpinner />
                        </div>
                    ) : expenses.length === 0 ? (
                        <div className="text-center py-20 bg-dark-900/30 rounded-3xl border border-white/5">
                            <div className="w-16 h-16 bg-dark-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Search className="text-gray-500" size={24} />
                            </div>
                            <h3 className="text-xl text-white font-bold mb-2">No transactions found</h3>
                            <p className="text-gray-400">Try adjusting your filters</p>
                            <button
                                onClick={clearFilters}
                                className="mt-4 text-neon-lime hover:underline"
                            >
                                Clear all filters
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {/* Desktop Table Header */}
                            <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                <div className="col-span-4">Details</div>
                                <div className="col-span-2">Category</div>
                                <div className="col-span-2">Date</div>
                                <div className="col-span-2">Type</div>
                                <div className="col-span-2 text-right">Amount</div>
                            </div>

                            {expenses.map((expense) => (
                                <div
                                    key={expense._id}
                                    className="group bg-dark-900/50 hover:bg-dark-850 border border-white/5 hover:border-white/10 rounded-2xl p-4 transition-all"
                                >
                                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                                        {/* Mobile: Top Row */}
                                        <div className="col-span-12 md:col-span-4 flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-full bg-dark-800 flex items-center justify-center shrink-0 border border-${categoryColors[expense.category] || 'gray'}/30`}>
                                                <div className={`w-2 h-2 rounded-full bg-${categoryColors[expense.category] || 'gray-400'} shadow-neon-${categoryColors[expense.category] || 'gray'}`} />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-white group-hover:text-neon-lime transition-colors">
                                                    {expense.title}
                                                </h3>
                                                {/* Mobile only date */}
                                                <p className="text-xs text-gray-500 md:hidden">
                                                    {new Date(expense.date).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Category */}
                                        <div className="hidden md:block col-span-2">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium bg-dark-950 border border-white/5 text-${categoryColors[expense.category] || 'gray-400'}`}>
                                                {expense.category}
                                            </span>
                                        </div>

                                        {/* Date */}
                                        <div className="hidden md:block col-span-2 text-sm text-gray-400">
                                            {new Date(expense.date).toLocaleDateString()}
                                        </div>

                                        {/* Type */}
                                        <div className="hidden md:block col-span-2">
                                            <span className="text-xs text-gray-500 capitalize">
                                                {expense.type === 'friend' ? 'Friend Split' : expense.type}
                                            </span>
                                        </div>

                                        {/* Amount */}
                                        <div className="col-span-12 md:col-span-2 flex justify-between md:justify-end items-center mt-2 md:mt-0 pt-2 md:pt-0 border-t md:border-t-0 border-white/5">
                                            <span className="md:hidden text-sm text-gray-500">Amount</span>
                                            <span className="font-bold text-white text-lg">
                                                ₹{expense.amount.toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {pagination.pages > 1 && (
                        <div className="flex justify-center items-center gap-4 pt-8">
                            <button
                                onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                                disabled={pagination.page === 1}
                                className="p-2 rounded-lg bg-dark-850 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-dark-800 transition-colors"
                            >
                                <ChevronLeft size={20} />
                            </button>

                            <span className="text-sm text-gray-400">
                                Page <span className="text-neon-lime font-bold">{pagination.page}</span> of {pagination.pages}
                            </span>

                            <button
                                onClick={() => setPagination(prev => ({ ...prev, page: Math.min(pagination.pages, prev.page + 1) }))}
                                disabled={pagination.page === pagination.pages}
                                className="p-2 rounded-lg bg-dark-850 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-dark-800 transition-colors"
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    )}

                </div>
            </main>
        </div>
    );
};

export default Transactions;
