const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Expense = require('../models/Expense');
const { protect } = require('../middleware/auth');

// @route   GET /api/expenses
// @desc    Get all expenses for logged in user
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20; // Default to 20 for pagination
        const { category, type, startDate, endDate, sortBy = 'date', order = 'desc' } = req.query;

        // Build Filter Object
        const filter = { userId: req.user.id };

        if (category && category !== 'All') {
            filter.category = category;
        }

        if (type && type !== 'all') {
            filter.type = type;
        }

        // Date Range Filter
        if (startDate || endDate) {
            filter.date = {};
            if (startDate) filter.date.$gte = new Date(startDate);
            if (endDate) {
                // Set to end of day
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                filter.date.$lte = end;
            }
        }

        // Build Sort Object
        const sort = {};
        sort[sortBy] = order === 'asc' ? 1 : -1;

        // Execute Query with Pagination
        let query = Expense.find(filter).sort(sort);

        // If limit is 0, return all (useful for stats exports if needed), else paginate
        if (limit > 0) {
            const skip = (page - 1) * limit;
            query = query.skip(skip).limit(limit);
        }

        const expenses = await query;
        const total = await Expense.countDocuments(filter);

        res.status(200).json({
            success: true,
            count: expenses.length,
            total,
            page,
            pages: limit > 0 ? Math.ceil(total / limit) : 1,
            expenses
        });
    } catch (error) {
        console.error('Get expenses error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   POST /api/expenses
// @desc    Create a new expense
// @access  Private
router.post('/', protect, [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('amount').isNumeric().withMessage('Amount must be a number'),
    body('category').isIn(['Food', 'Travel', 'Fun', 'Misc']).withMessage('Invalid category'),
    body('type').isIn(['personal', 'group']).withMessage('Invalid type')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array()
        });
    }

    try {
        const { title, amount, category, date, type, groupId } = req.body;

        const expense = await Expense.create({
            userId: req.user.id,
            title,
            amount,
            category,
            date: date || Date.now(),
            type,
            groupId: type === 'group' ? groupId : null
        });

        res.status(201).json({
            success: true,
            expense
        });
    } catch (error) {
        console.error('Create expense error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   PUT /api/expenses/:id
// @desc    Update an expense
// @access  Private
router.put('/:id', protect, async (req, res) => {
    try {
        let expense = await Expense.findById(req.params.id);

        if (!expense) {
            return res.status(404).json({
                success: false,
                message: 'Expense not found'
            });
        }

        // Make sure user owns expense
        if (expense.userId.toString() !== req.user.id) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to update this expense'
            });
        }

        expense = await Expense.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            expense
        });
    } catch (error) {
        console.error('Update expense error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   DELETE /api/expenses/:id
// @desc    Delete an expense
// @access  Private
router.delete('/:id', protect, async (req, res) => {
    try {
        const expense = await Expense.findById(req.params.id);

        if (!expense) {
            return res.status(404).json({
                success: false,
                message: 'Expense not found'
            });
        }

        // Make sure user owns expense
        if (expense.userId.toString() !== req.user.id) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to delete this expense'
            });
        }

        await expense.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Expense deleted successfully'
        });
    } catch (error) {
        console.error('Delete expense error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   GET /api/expenses/stats
// @desc    Get expense statistics
// @access  Private
router.get('/stats', protect, async (req, res) => {
    try {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        // Get this month's expenses
        const monthlyExpenses = await Expense.find({
            userId: req.user.id,
            date: { $gte: startOfMonth, $lte: endOfMonth }
        });

        const totalSpent = monthlyExpenses.reduce((sum, exp) => sum + exp.amount, 0);

        // Category breakdown
        const categoryBreakdown = {
            Food: 0,
            Travel: 0,
            Fun: 0,
            Misc: 0
        };

        monthlyExpenses.forEach(exp => {
            categoryBreakdown[exp.category] += exp.amount;
        });

        res.status(200).json({
            success: true,
            stats: {
                totalSpent,
                categoryBreakdown,
                expenseCount: monthlyExpenses.length
            }
        });
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

module.exports = router;
