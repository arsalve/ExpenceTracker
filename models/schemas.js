const mongoose = require('mongoose');

const transactionSchema = mongoose.Schema({
    date: {
        type: Date,
        default: Date.now,
        required: true
    },
    month: {
        type: Number,
        required: true
    },
    year: {
        type: Number,
        required: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    type: {
        type: String,
        enum: ['income', 'expense', 'savings'],
        required: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    notes: String,
    tags: [String],
    isRecurring: {
        type: Boolean,
        default: false
    },
    recurringId: String,
    id: {
        type: String,
        default: () => Date.now() + Math.random().toString(36).slice(2)
    }
}, { timestamps: true });

const budgetSchema = mongoose.Schema({
    user: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    limit: {
        type: Number,
        required: true,
        min: 0
    },
    month: Number,
    year: Number,
    alert_threshold: {
        type: Number,
        default: 80
    },
    created_at: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

const goalSchema = mongoose.Schema({
    user: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    target_amount: {
        type: Number,
        required: true,
        min: 0
    },
    current_amount: {
        type: Number,
        default: 0,
        min: 0
    },
    target_date: Date,
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    description: String,
    status: {
        type: String,
        enum: ['active', 'completed', 'abandoned'],
        default: 'active'
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

const userSchema = mongoose.Schema({
    user: {
        type: String,
        unique: true,
        required: true
    },
    email: String,
    password: String,
    currency: {
        type: String,
        default: '₹'
    },
    language: {
        type: String,
        default: 'mr'
    },
    theme: {
        type: String,
        default: 'auto'
    },
    notifications_enabled: {
        type: Boolean,
        default: true
    },
    transactions: [transactionSchema],
    budgets: [budgetSchema],
    goals: [goalSchema],
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    }
}, { strict: false });

const recurringTransactionSchema = mongoose.Schema({
    user: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['income', 'expense', 'savings'],
        required: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    frequency: {
        type: String,
        enum: ['daily', 'weekly', 'monthly', 'yearly'],
        default: 'monthly'
    },
    start_date: {
        type: Date,
        required: true
    },
    end_date: Date,
    active: {
        type: Boolean,
        default: true
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

module.exports = {
    User: mongoose.model('User', userSchema),
    Budget: mongoose.model('Budget', budgetSchema),
    Goal: mongoose.model('Goal', goalSchema),
    RecurringTransaction: mongoose.model('RecurringTransaction', recurringTransactionSchema)
};
