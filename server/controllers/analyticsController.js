const Expense = require('../models/Expense');
const FriendSplit = require('../models/FriendSplit');

// Helper to fetch consolidated transactions (Expenses ONLY for Net Cost view)
const getTransactions = async (userId, startDate, endDate) => {
    // Based on user feedback, we only count PERSONAL expenses for analytics/budget.
    // Loans to friends are assets, not expenses.
    return await Expense.find({
        userId,
        date: { $gte: startDate, $lte: endDate }
    });
};

// Get analytics data for user
const getAnalytics = async (req, res) => {
    try {
        const userId = req.user.id;
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        // Get this month's transactions
        const monthlyTransactions = await getTransactions(userId, startOfMonth, endOfMonth);

        // Category breakdown
        const categoryBreakdownObj = {
            Food: 0,
            Travel: 0,
            Fun: 0,
            Misc: 0
        };

        monthlyTransactions.forEach(exp => {
            const cat = categoryBreakdownObj[exp.category] !== undefined ? exp.category : 'Misc';
            categoryBreakdownObj[cat] += exp.amount;
        });

        const totalSpent = monthlyTransactions.reduce((sum, exp) => sum + exp.amount, 0);

        // Calculate percentages & Highest spending category
        let highestCategory = 'Misc';
        let highestAmount = 0;

        Object.entries(categoryBreakdownObj).forEach(([cat, amount]) => {
            if (amount > highestAmount) {
                highestAmount = amount;
                highestCategory = cat;
            }
        });

        // Convert to Array for Frontend (Recharts expects array)
        const categoryBreakdown = Object.entries(categoryBreakdownObj)
            .map(([category, total]) => ({
                category,
                total,
                percentage: totalSpent > 0 ? Math.round((total / totalSpent) * 100) : 0
            }))
            .filter(item => item.total > 0);

        // Weekly spending (last 4 weeks)
        const weeklySpending = [];
        for (let i = 3; i >= 0; i--) {
            const weekStart = new Date(now);
            weekStart.setDate(now.getDate() - (i * 7 + 7));
            const weekEnd = new Date(now);
            weekEnd.setDate(now.getDate() - (i * 7));

            const weekTransactions = await getTransactions(userId, weekStart, weekEnd);
            const weekTotal = weekTransactions.reduce((sum, exp) => sum + exp.amount, 0);

            weeklySpending.push({
                week: `Week ${4 - i}`,
                amount: weekTotal
            });
        }

        // Monthly trend (last 6 months)
        const monthlyTrend = [];
        for (let i = 5; i >= 0; i--) {
            const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
            const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);

            const monthTransactions = await getTransactions(userId, monthStart, monthEnd);
            const monthTotal = monthTransactions.reduce((sum, exp) => sum + exp.amount, 0);

            monthlyTrend.push({
                month: monthDate.toLocaleDateString('en-US', { month: 'short' }),
                amount: monthTotal
            });
        }

        res.status(200).json({
            success: true,
            analytics: {
                categoryBreakdown, // Now an Array
                weeklySpending,
                monthlyTrend,
                highestCategory,
                totalSpent
            }
        });
    } catch (error) {
        console.error('Get analytics error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Guilty spending detection
const getGuiltySpending = async (req, res) => {
    try {
        const userId = req.user.id;
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        // This week & Last week dates
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - 7);

        const lastWeekStart = new Date(now);
        lastWeekStart.setDate(now.getDate() - 14);
        const lastWeekEnd = new Date(now);
        lastWeekEnd.setDate(now.getDate() - 7);

        // Get transactions
        const [monthlyTransactions, weekTransactions, lastWeekTransactions] = await Promise.all([
            getTransactions(userId, startOfMonth, endOfMonth),
            getTransactions(userId, weekStart, now),
            getTransactions(userId, lastWeekStart, lastWeekEnd)
        ]);

        const totalSpent = monthlyTransactions.reduce((sum, exp) => sum + exp.amount, 0);
        const weekTotal = weekTransactions.reduce((sum, exp) => sum + exp.amount, 0);
        const lastWeekTotal = lastWeekTransactions.reduce((sum, exp) => sum + exp.amount, 0);

        // Category breakdown
        const categoryBreakdown = { Food: 0, Travel: 0, Fun: 0, Misc: 0 };
        const weekCategoryBreakdown = { Food: 0, Travel: 0, Fun: 0, Misc: 0 };

        monthlyTransactions.forEach(exp => {
            const cat = categoryBreakdown[exp.category] !== undefined ? exp.category : 'Misc';
            categoryBreakdown[cat] += exp.amount;
        });

        weekTransactions.forEach(exp => {
            const cat = weekCategoryBreakdown[exp.category] !== undefined ? exp.category : 'Misc';
            weekCategoryBreakdown[cat] += exp.amount;
        });

        // Detect guilty patterns
        const warnings = [];

        // Check if food spending > 40%
        const foodPercentage = totalSpent > 0 ? (categoryBreakdown.Food / totalSpent) * 100 : 0;
        if (foodPercentage > 40) {
            warnings.push({
                type: 'high_food',
                message: `You spent ₹${categoryBreakdown.Food} on food this month (${Math.round(foodPercentage)}% of total) 👀`,
                severity: 'warning'
            });
        }

        // Check for spending spike
        if (lastWeekTotal > 0 && weekTotal > lastWeekTotal * 1.5) {
            const increase = Math.round(((weekTotal - lastWeekTotal) / lastWeekTotal) * 100);
            warnings.push({
                type: 'spending_spike',
                message: `Your spending increased by ${increase}% this week compared to last week! 📈`,
                severity: 'critical'
            });
        }

        // Check fun expenses
        const funPercentage = totalSpent > 0 ? (categoryBreakdown.Fun / totalSpent) * 100 : 0;
        if (funPercentage > 30) {
            warnings.push({
                type: 'high_fun',
                message: `Fun expenses exceeded your usual pattern 😈 (₹${categoryBreakdown.Fun})`,
                severity: 'info'
            });
        }

        // Weekly food spending
        if (weekCategoryBreakdown.Food > 0) {
            warnings.push({
                type: 'weekly_food',
                message: `You spent ₹${weekCategoryBreakdown.Food} on food this week 👀`,
                severity: 'info'
            });
        }

        // Check daily average
        const avgDailySpending = totalSpent / new Date().getDate();

        // Get today's transactions
        const todayStart = new Date(now);
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date(now);
        todayEnd.setHours(23, 59, 59, 999);

        const todayTransactions = await getTransactions(userId, todayStart, todayEnd);
        const todayTotal = todayTransactions.reduce((sum, exp) => sum + exp.amount, 0);

        if (todayTotal > avgDailySpending * 2 && avgDailySpending > 0) {
            warnings.push({
                type: 'high_daily',
                message: `Today's spending (₹${todayTotal}) is higher than your daily average! 💸`,
                severity: 'warning'
            });
        }

        res.status(200).json({
            success: true,
            guiltySpending: {
                warnings,
                weekTotal,
                lastWeekTotal,
                categoryBreakdown: weekCategoryBreakdown,
                hasWarnings: warnings.length > 0
            }
        });
    } catch (error) {
        console.error('Get guilty spending error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

module.exports = {
    getAnalytics,
    getGuiltySpending
};
