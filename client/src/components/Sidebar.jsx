import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    PlusCircle,
    Users,
    UserPlus,
    BarChart3,
    Wallet,
    List
} from 'lucide-react';

const Sidebar = () => {
    const location = useLocation();

    const navItems = [
        { icon: LayoutDashboard, path: '/dashboard', label: 'Dashboard' },
        { icon: PlusCircle, path: '/add-expense', label: 'Add' },
        { icon: List, path: '/transactions', label: 'Transactions' },
        { icon: Wallet, path: '/budget', label: 'Budget' },
        { icon: Users, path: '/groups', label: 'Groups' },
        { icon: UserPlus, path: '/friends', label: 'Friends' },
        { icon: Wallet, path: '/friends?tab=expenses', label: 'Friend Expenses' },
        { icon: BarChart3, path: '/analytics', label: 'Analytics' },
    ];

    return (
        <div className="fixed md:left-0 md:top-0 md:h-screen md:w-20 w-full h-16 bottom-0 left-0 bg-dark-950 border-r md:border-r border-t md:border-t-0 border-white/5 flex md:flex-col flex-row items-center justify-around md:justify-start md:py-8 md:gap-6 z-50">
            {/* Logo - Hidden on mobile */}
            <div className="hidden md:flex w-10 h-10 rounded-xl gradient-lime items-center justify-center mb-2 shadow-neon-lime">
                <span className="text-black font-bold text-lg">SE</span>
            </div>


            {/* Navigation Icons */}
            <div className="flex md:flex-col flex-row gap-1 md:gap-4 w-full md:w-auto justify-evenly md:justify-start">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    // Exact match for most, but startsWith for sub-routes could be better?
                    // For now strict match or simple logic
                    const isActive = location.pathname === item.path || (item.path.includes('?') && location.pathname + location.search === item.path);

                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`icon-btn ${isActive ? 'active' : ''}`}
                            title={item.label}
                        >
                            <Icon size={20} />
                        </Link>
                    );
                })}
            </div>

            {/* Add button at bottom */}
            {/* Add button at bottom - Removed as per request */}
            <div className="mt-auto hidden md:block">
                {/* Placeholder or future settings */}
            </div>
        </div>
    );
};

export default Sidebar;

