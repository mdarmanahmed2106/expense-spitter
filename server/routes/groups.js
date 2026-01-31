const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Group = require('../models/Group');
const Expense = require('../models/Expense');
const { protect } = require('../middleware/auth');

// @route   GET /api/groups
// @desc    Get all groups for logged in user
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const groups = await Group.find({
            $or: [
                { createdBy: req.user.id },
                { 'members.userId': req.user.id }
            ]
        }).populate('expenses');

        res.status(200).json({
            success: true,
            count: groups.length,
            groups
        });
    } catch (error) {
        console.error('Get groups error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   POST /api/groups
// @desc    Create a new group
// @access  Private
router.post('/', protect, [
    body('name').trim().notEmpty().withMessage('Group name is required')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array()
        });
    }

    try {
        const { name } = req.body;

        console.log('Creating group with:', { name, userId: req.user.id, userName: req.user.name });

        // Generate unique 6-digit invite code
        let inviteCode;
        let isUnique = false;
        while (!isUnique) {
            inviteCode = Math.floor(100000 + Math.random() * 900000).toString();
            const existingGroup = await Group.findOne({ inviteCode });
            if (!existingGroup) {
                isUnique = true;
            }
        }

        // Only add creator as the first member
        const groupMembers = [
            { userId: req.user.id, name: req.user.name }
        ];

        const group = await Group.create({
            name,
            createdBy: req.user.id,
            members: groupMembers,
            inviteCode
        });

        console.log('Group created successfully:', group._id);

        res.status(201).json({
            success: true,
            group
        });
    } catch (error) {
        console.error('Create group error:', error);
        console.error('Error details:', error.message);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
});

// @route   GET /api/groups/:id
// @desc    Get a single group
// @access  Private
router.get('/:id', protect, async (req, res) => {
    try {
        const group = await Group.findById(req.params.id).populate('expenses');

        if (!group) {
            return res.status(404).json({
                success: false,
                message: 'Group not found'
            });
        }

        // Check if user is a member
        const isMember = group.members.some(m => m.userId.toString() === req.user.id);
        if (!isMember && group.createdBy.toString() !== req.user.id) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to view this group'
            });
        }

        res.status(200).json({
            success: true,
            group
        });
    } catch (error) {
        console.error('Get group error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   POST /api/groups/:id/expenses
// @desc    Add expense to group
// @access  Private
router.post('/:id/expenses', protect, [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('amount').isNumeric().withMessage('Amount must be a number'),
    body('category').isIn(['Food', 'Travel', 'Fun', 'Misc']).withMessage('Invalid category')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array()
        });
    }

    try {
        const group = await Group.findById(req.params.id);

        if (!group) {
            return res.status(404).json({
                success: false,
                message: 'Group not found'
            });
        }

        // Check if user is a member
        const isMember = group.members.some(m => m.userId.toString() === req.user.id);
        if (!isMember && group.createdBy.toString() !== req.user.id) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to add expenses to this group'
            });
        }

        const { title, amount, category, date } = req.body;

        // Create expense
        const expense = await Expense.create({
            userId: req.user.id,
            title,
            amount,
            category,
            date: date || Date.now(),
            type: 'group',
            groupId: group._id
        });

        // Add expense to group
        group.expenses.push(expense._id);
        await group.save();

        res.status(201).json({
            success: true,
            expense
        });
    } catch (error) {
        console.error('Add group expense error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   GET /api/groups/:id/settlements
// @desc    Get settlement calculations for group
// @access  Private
router.get('/:id/settlements', protect, async (req, res) => {
    try {
        const group = await Group.findById(req.params.id).populate('expenses');

        if (!group) {
            return res.status(404).json({
                success: false,
                message: 'Group not found'
            });
        }

        // Check if user is a member
        const isMember = group.members.some(m => m.userId.toString() === req.user.id);
        if (!isMember && group.createdBy.toString() !== req.user.id) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to view this group'
            });
        }

        const balances = await group.calculateSettlements();

        // Find top spender
        let topSpender = null;
        let maxSpent = 0;

        for (const [userId, balance] of Object.entries(balances)) {
            const member = group.members.find(m => m.userId.toString() === userId);
            if (balance > maxSpent) {
                maxSpent = balance;
                topSpender = member ? member.name : 'Unknown';
            }
        }

        // Format balances with member names
        const formattedBalances = {};
        for (const [userId, balance] of Object.entries(balances)) {
            const member = group.members.find(m => m.userId.toString() === userId);
            if (member) {
                formattedBalances[member.name] = balance;
            }
        }

        res.status(200).json({
            success: true,
            settlements: formattedBalances,
            topSpender,
            totalExpenses: group.expenses.reduce((sum, exp) => sum + exp.amount, 0)
        });
    } catch (error) {
        console.error('Get settlements error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   POST /api/groups/join
// @desc    Join a group using invite code
// @access  Private
router.post('/join', protect, [
    body('inviteCode').trim().isLength({ min: 6, max: 6 }).withMessage('Invite code must be 6 digits')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array()
        });
    }

    try {
        const { inviteCode } = req.body;

        // Find group by invite code
        const group = await Group.findOne({ inviteCode });

        if (!group) {
            return res.status(404).json({
                success: false,
                message: 'Invalid invite code. Group not found.'
            });
        }

        // Check if user is already a member
        const isMember = group.members.some(m => m.userId.toString() === req.user.id);
        if (isMember) {
            return res.status(400).json({
                success: false,
                message: 'You are already a member of this group'
            });
        }

        // Add user to group members
        group.members.push({
            userId: req.user.id,
            name: req.user.name
        });

        await group.save();

        res.status(200).json({
            success: true,
            message: `Successfully joined ${group.name}`,
            group
        });
    } catch (error) {
        console.error('Join group error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while joining group'
        });
    }
});

// @route   GET /api/groups/:id/invite-code
// @desc    Get invite code for a group
// @access  Private (members only)
router.get('/:id/invite-code', protect, async (req, res) => {
    try {
        const group = await Group.findById(req.params.id);

        if (!group) {
            return res.status(404).json({
                success: false,
                message: 'Group not found'
            });
        }

        // Check if user is a member or creator
        const isMember = group.members.some(m => m.userId.toString() === req.user.id);
        if (!isMember && group.createdBy.toString() !== req.user.id) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to view this group\'s invite code'
            });
        }

        res.status(200).json({
            success: true,
            inviteCode: group.inviteCode
        });
    } catch (error) {
        console.error('Get invite code error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

module.exports = router;
