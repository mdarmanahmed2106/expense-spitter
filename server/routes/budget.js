const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Expense = require('../models/Expense');
const FriendSplit = require('../models/FriendSplit');
const { protect } = require('../middleware/auth');

// @route   GET /api/budget
// @desc    Get user's monthly budget
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        res.status(200).json({
            success: true,
            monthlyBudget: user.monthlyBudget
        });
    } catch (error) {
        console.error('Get budget error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   PUT /api/budget
// @desc    Set/Update monthly budget
// @access  Private
router.put('/', protect, async (req, res) => {
    try {
        const { monthlyBudget } = req.body;

        if (monthlyBudget < 0) {
            return res.status(400).json({
                success: false,
                message: 'Budget cannot be negative'
            });
        }

        const user = await User.findByIdAndUpdate(
            req.user.id,
            { monthlyBudget },
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            monthlyBudget: user.monthlyBudget
        });
    } catch (error) {
        console.error('Update budget error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   GET /api/budget/status
// @desc    Get budget status (spending vs budget)
// @access  Private
router.get('/status', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        // Get this month's expenses
        const monthlyExpenses = await Expense.find({
            userId: req.user.id,
            date: { $gte: startOfMonth, $lte: endOfMonth }
        });

        // Get this month's friend lending (money YOU paid for friends)
        const monthlyFriendLending = await FriendSplit.find({
            userId: req.user.id,
            date: { $gte: startOfMonth, $lte: endOfMonth },
            paidBy: 'user' // Only count money leaving your pocket
        });

        const expenseTotal = monthlyExpenses.reduce((sum, exp) => sum + exp.amount, 0);

        // We DO NOT add friendLendingTotal to totalSpent anymore based on user feedback.
        // Budget now reflects "Net Personal Consumption", not "Cash Flow".
        const totalSpent = expenseTotal;

        const remaining = user.monthlyBudget - totalSpent;
        const percentageUsed = user.monthlyBudget > 0
            ? (totalSpent / user.monthlyBudget) * 100
            : 0;

        let warningLevel = 'safe';
        if (percentageUsed >= 100) {
            warningLevel = 'danger';
        } else if (percentageUsed >= 90) {
            warningLevel = 'critical';
        } else if (percentageUsed >= 70) {
            warningLevel = 'warning';
        }

        res.status(200).json({
            success: true,
            budget: {
                monthlyBudget: user.monthlyBudget,
                totalSpent,
                remaining,
                percentageUsed: Math.round(percentageUsed),
                warningLevel
            }
        });
    } catch (error) {
        console.error('Get budget status error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

module.exports = router;
