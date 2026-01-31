const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a group name'],
        trim: true,
        maxlength: [50, 'Group name cannot be more than 50 characters']
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    members: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        name: {
            type: String,
            required: true
        }
    }],
    expenses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Expense'
    }],
    inviteCode: {
        type: String,
        unique: true,
        required: true,
        length: 6
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});


// Method to calculate settlements (who owes whom)
groupSchema.methods.calculateSettlements = async function () {
    await this.populate('expenses');

    const memberBalances = {};

    // Initialize balances
    this.members.forEach(member => {
        memberBalances[member.userId.toString()] = 0;
    });

    // Calculate total expenses and per-person share
    const totalExpenses = this.expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const perPersonShare = totalExpenses / this.members.length;

    // Calculate who paid what
    const payments = {};
    this.expenses.forEach(expense => {
        const payerId = expense.userId.toString();
        payments[payerId] = (payments[payerId] || 0) + expense.amount;
    });

    // Calculate balances (positive = owed to them, negative = they owe)
    this.members.forEach(member => {
        const memberId = member.userId.toString();
        const paid = payments[memberId] || 0;
        memberBalances[memberId] = paid - perPersonShare;
    });

    return memberBalances;
};

module.exports = mongoose.model('Group', groupSchema);
