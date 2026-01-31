import React from 'react';
import { Search, ChevronDown, Bell, User, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const TopNav = ({ title = "Dashboard" }) => {
    const { user, logout } = useAuth();

    return (
        <div className="fixed top-0 md:left-20 left-0 right-0 h-16 bg-dark-950/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-4 md:px-8 z-40">
            {/* Title */}
            <h1 className="text-2xl font-bold text-white uppercase tracking-wider">{title}</h1>

            {/* Right side controls */}
            <div className="flex items-center gap-4">
                {/* Search */}
                {/* <button className="icon-btn">
                    <Search size={18} />
                </button> */}

                {/* Notifications */}
                {/* <button className="icon-btn relative">
                    <Bell size={18} />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-neon-orange rounded-full"></span>
                </button> */}

                {/* User profile */}
                <div className="flex items-center gap-3 pl-4 border-l border-white/10">
                    <div className="text-right hidden md:block">
                        <p className="text-sm font-medium text-white">{user?.name || 'User'}</p>
                        <p className="text-xs text-gray-500">@{user?.email?.split('@')[0]}</p>
                    </div>
                    <div className="w-10 h-10 rounded-full gradient-lime flex items-center justify-center text-black font-bold">
                        {user?.name?.[0] || 'U'}
                    </div>
                    <button
                        onClick={logout}
                        className="icon-btn hover:bg-red-500/10 hover:text-red-500 transition-all"
                        title="Logout"
                    >
                        <LogOut size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TopNav;

