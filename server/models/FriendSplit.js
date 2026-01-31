const mongoose = require('mongoose');

const friendSplitSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    friendName: {
        type: String,
        required: [true, 'Please provide friend\'s name'],
        trim: true
    },
    friendEmail: {
        type: String,
        trim: true,
        default: ''
    },
    title: {
        type: String,
        required: [true, 'Please provide a title'],
        trim: true,
        maxlength: [100, 'Title cannot be more than 100 characters']
    },
    amount: {
        type: Number,
        required: [true, 'Please provide an amount'],
        min: [0, 'Amount cannot be negative']
    },
    category: {
        type: String,
        required: [true, 'Please select a category'],
        enum: ['Food', 'Travel', 'Fun', 'Misc'],
        default: 'Misc'
    },
    paidBy: {
        type: String,
        required: [true, 'Please specify who paid'],
        enum: ['user', 'friend'],
        default: 'user'
    },
    date: {
        type: Date,
        required: [true, 'Please provide a date'],
        default: Date.now
    },
    settled: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Index for faster queries
friendSplitSchema.index({ userId: 1, date: -1 });
friendSplitSchema.index({ userId: 1, settled: 1 });

module.exports = mongoose.model('FriendSplit', friendSplitSchema);
