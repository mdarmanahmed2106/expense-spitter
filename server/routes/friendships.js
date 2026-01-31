const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Friendship = require('../models/Friendship');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// @route   POST /api/friendships/search
// @desc    Search for users by email
// @access  Private
router.post('/search', protect, [
    body('email').isEmail().withMessage('Valid email is required')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array()
        });
    }

    try {
        const { email } = req.body;

        // Don't allow searching for yourself
        if (email.toLowerCase() === req.user.email.toLowerCase()) {
            return res.status(400).json({
                success: false,
                message: 'Cannot send friend request to yourself'
            });
        }

        // Find user by email
        const user = await User.findOne({ email: email.toLowerCase() }).select('name email');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check if friendship already exists
        const existingFriendship = await Friendship.findOne({
            $or: [
                { requester: req.user.id, recipient: user._id },
                { requester: user._id, recipient: req.user.id }
            ]
        });

        let friendshipStatus = 'none';
        if (existingFriendship) {
            if (existingFriendship.status === 'accepted') {
                friendshipStatus = 'friends';
            } else if (existingFriendship.status === 'pending') {
                friendshipStatus = existingFriendship.requester.toString() === req.user.id
                    ? 'request_sent'
                    : 'request_received';
            }
        }

        res.json({
            success: true,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email
            },
            friendshipStatus
        });
    } catch (error) {
        console.error('Search user error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   POST /api/friendships/request
// @desc    Send a friend request
// @access  Private
router.post('/request', protect, [
    body('recipientId').notEmpty().withMessage('Recipient ID is required')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array()
        });
    }

    try {
        const { recipientId } = req.body;

        // Check if recipient exists
        const recipient = await User.findById(recipientId);
        if (!recipient) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Don't allow sending request to yourself
        if (recipientId === req.user.id) {
            return res.status(400).json({
                success: false,
                message: 'Cannot send friend request to yourself'
            });
        }

        // Check if friendship already exists
        const existingFriendship = await Friendship.findOne({
            $or: [
                { requester: req.user.id, recipient: recipientId },
                { requester: recipientId, recipient: req.user.id }
            ]
        });

        if (existingFriendship) {
            if (existingFriendship.status === 'accepted') {
                return res.status(400).json({
                    success: false,
                    message: 'Already friends'
                });
            } else if (existingFriendship.status === 'pending') {
                return res.status(400).json({
                    success: false,
                    message: 'Friend request already sent'
                });
            }
        }

        // Create new friendship request
        const friendship = await Friendship.create({
            requester: req.user.id,
            recipient: recipientId,
            status: 'pending'
        });

        await friendship.populate('recipient', 'name email');

        res.status(201).json({
            success: true,
            friendship
        });
    } catch (error) {
        console.error('Send friend request error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});


router.get('/requests', protect, async (req, res) => {
    try {
        const requests = await Friendship.find({
            recipient: req.user.id,
            status: 'pending'
        })
            .populate('requester', 'name email')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            requests
        });
    } catch (error) {
        console.error('Get friend requests error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   GET /api/friendships/friends
// @desc    Get accepted friends list
// @access  Private
router.get('/friends', protect, async (req, res) => {
    try {
        const friendships = await Friendship.find({
            $or: [
                { requester: req.user.id, status: 'accepted' },
                { recipient: req.user.id, status: 'accepted' }
            ]
        })
            .populate('requester', 'name email')
            .populate('recipient', 'name email')
            .sort({ updatedAt: -1 });

        // Map to get friend details
        const friends = friendships.map(friendship => {
            const friend = friendship.requester._id.toString() === req.user.id
                ? friendship.recipient
                : friendship.requester;

            return {
                _id: friendship._id,
                friendId: friend._id,
                name: friend.name,
                email: friend.email,
                since: friendship.updatedAt
            };
        });

        res.json({
            success: true,
            friends
        });
    } catch (error) {
        console.error('Get friends error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

3
router.put('/:id/accept', protect, async (req, res) => {
    try {
        const friendship = await Friendship.findById(req.params.id);

        if (!friendship) {
            return res.status(404).json({
                success: false,
                message: 'Friend request not found'
            });
        }

        // Check if user is the recipient
        if (friendship.recipient.toString() !== req.user.id) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized'
            });
        }

        // Check if already accepted
        if (friendship.status === 'accepted') {
            return res.status(400).json({
                success: false,
                message: 'Friend request already accepted'
            });
        }

        friendship.status = 'accepted';
        await friendship.save();

        await friendship.populate('requester', 'name email');

        res.json({
            success: true,
            friendship
        });
    } catch (error) {
        console.error('Accept friend request error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   PUT /api/friendships/:id/reject
// @desc    Reject a friend request
// @access  Private
router.put('/:id/reject', protect, async (req, res) => {
    try {
        const friendship = await Friendship.findById(req.params.id);

        if (!friendship) {
            return res.status(404).json({
                success: false,
                message: 'Friend request not found'
            });
        }

        // Check if user is the recipient
        if (friendship.recipient.toString() !== req.user.id) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized'
            });
        }

        // Delete the request instead of marking as rejected
        await friendship.deleteOne();

        res.json({
            success: true,
            message: 'Friend request rejected'
        });
    } catch (error) {
        console.error('Reject friend request error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   DELETE /api/friendships/:id
// @desc    Remove a friend
// @access  Private
router.delete('/:id', protect, async (req, res) => {
    try {
        const friendship = await Friendship.findById(req.params.id);

        if (!friendship) {
            return res.status(404).json({
                success: false,
                message: 'Friendship not found'
            });
        }

        // Check if user is part of this friendship
        if (friendship.requester.toString() !== req.user.id &&
            friendship.recipient.toString() !== req.user.id) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized'
            });
        }

        await friendship.deleteOne();

        res.json({
            success: true,
            message: 'Friend removed'
        });
    } catch (error) {
        console.error('Remove friend error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

module.exports = router;
