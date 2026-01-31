const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const FriendSplit = require('../models/FriendSplit');
const { protect } = require('../middleware/auth');

// @route   POST /api/friend-splits
// @desc    Create a new friend split
// @access  Private
router.post('/', protect, [
    body('friendName').trim().notEmpty().withMessage('Friend name is required'),
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('amount').isNumeric().withMessage('Amount must be a number'),
    body('category').isIn(['Food', 'Travel', 'Fun', 'Misc']).withMessage('Invalid category'),
    body('paidBy').isIn(['user', 'friend']).withMessage('Invalid paidBy value')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array()
        });
    }

    try {
        const { friendName, friendEmail, title, amount, category, paidBy, date } = req.body;

        const friendSplit = await FriendSplit.create({
            userId: req.user.id,
            friendName,
            friendEmail: friendEmail || '',
            title,
            amount,
            category,
            paidBy,
            date: date || Date.now()
        });

        res.status(201).json({
            success: true,
            friendSplit
        });
    } catch (error) {
        console.error('Create friend split error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   GET /api/friend-splits
// @desc    Get all friend splits for the logged-in user
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const friendSplits = await FriendSplit.find({ userId: req.user.id })
            .sort({ date: -1 });

        res.json({
            success: true,
            friendSplits
        });
    } catch (error) {
        console.error('Get friend splits error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   PUT /api/friend-splits/:id/settle
// @desc    Mark a friend split as settled
// @access  Private
router.put('/:id/settle', protect, async (req, res) => {
    try {
        const friendSplit = await FriendSplit.findById(req.params.id);

        if (!friendSplit) {
            return res.status(404).json({
                success: false,
                message: 'Friend split not found'
            });
        }

        // Check if user owns this split
        if (friendSplit.userId.toString() !== req.user.id) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized'
            });
        }

        friendSplit.settled = !friendSplit.settled;
        await friendSplit.save();

        res.json({
            success: true,
            friendSplit
        });
    } catch (error) {
        console.error('Settle friend split error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   DELETE /api/friend-splits/:id
// @desc    Delete a friend split
// @access  Private
router.delete('/:id', protect, async (req, res) => {
    try {
        const friendSplit = await FriendSplit.findById(req.params.id);

        if (!friendSplit) {
            return res.status(404).json({
                success: false,
                message: 'Friend split not found'
            });
        }

        // Check if user owns this split
        if (friendSplit.userId.toString() !== req.user.id) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized'
            });
        }

        await friendSplit.deleteOne();

        res.json({
            success: true,
            message: 'Friend split deleted'
        });
    } catch (error) {
        console.error('Delete friend split error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

module.exports = router;
