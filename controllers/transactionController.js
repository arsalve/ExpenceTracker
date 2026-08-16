const { User, Transaction, Budget, Goal } = require('../models/schemas');
const { getAllTransactionsForUser } = require('../utils/backwardCompatibility');

class TransactionController {
    /**
     * Create a new transaction
     */
    static async createTransaction(req, res) {
        try {
            const { user, date, amount, type, description, category, notes, tags, isRecurring } = req.body;

            if (!user || !amount || !type || !description || !category) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Missing required fields' 
                });
            }

            const transactionDate = new Date(date);
            const transaction = {
                date: transactionDate,
                month: transactionDate.getMonth() + 1,
                year: transactionDate.getFullYear(),
                amount: Number(amount),
                type,
                description,
                category,
                notes: notes || '',
                tags: tags || [],
                isRecurring: isRecurring || false,
                id: Date.now() + Math.random().toString(36).slice(2)
            };

            const result = await User.findOneAndUpdate(
                { user },
                { $push: { transactions: transaction } },
                { upsert: true, new: true }
            );

            res.status(201).json({
                success: true,
                message: 'Transaction created successfully',
                data: transaction
            });
        } catch (error) {
            console.error('Error creating transaction:', error);
            res.status(500).json({
                success: false,
                message: 'Error creating transaction',
                error: error.message
            });
        }
    }

    /**
     * Get transactions for a user (from both old and new format)
     */
    static async getTransactions(req, res) {
        try {
            const { user, month, year, type, category } = req.body;

            if (!user) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'User ID is required' 
                });
            }

            // Get transactions from both old and new format
            let transactions = await getAllTransactionsForUser(user);

            let filter = {};

            if (month && year) {
                filter.month = Number(month);
                filter.year = Number(year);
            }

            if (type) filter.type = type;
            if (category) filter.category = category;

            // Apply filters
            if (Object.keys(filter).length > 0) {
                transactions = transactions.filter(t => {
                    return Object.keys(filter).every(key => t[key] === filter[key]);
                });
            }

            res.json({
                success: true,
                message: 'Transactions retrieved successfully',
                data: transactions,
                total: transactions.length,
                source: 'combined (new + old format)'
            });
        } catch (error) {
            console.error('Error fetching transactions:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching transactions',
                error: error.message
            });
        }
    }

    /**
     * Delete a transaction
     */
    static async deleteTransaction(req, res) {
        try {
            const { user, transactionId } = req.body;

            if (!user || !transactionId) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'User ID and Transaction ID are required' 
                });
            }

            const result = await User.findOneAndUpdate(
                { user },
                { $pull: { transactions: { id: transactionId } } },
                { new: true }
            );

            res.json({
                success: true,
                message: 'Transaction deleted successfully',
                data: result
            });
        } catch (error) {
            console.error('Error deleting transaction:', error);
            res.status(500).json({
                success: false,
                message: 'Error deleting transaction',
                error: error.message
            });
        }
    }

    /**
     * Update a transaction
     */
    static async updateTransaction(req, res) {
        try {
            const { user, transactionId, updates } = req.body;

            if (!user || !transactionId) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'User ID and Transaction ID are required' 
                });
            }

            const userData = await User.findOne({ user });
            if (!userData) {
                return res.status(404).json({ 
                    success: false, 
                    message: 'User not found' 
                });
            }

            const transactionIndex = userData.transactions.findIndex(t => t.id === transactionId);
            if (transactionIndex === -1) {
                return res.status(404).json({ 
                    success: false, 
                    message: 'Transaction not found' 
                });
            }

            userData.transactions[transactionIndex] = { 
                ...userData.transactions[transactionIndex],
                ...updates,
                id: transactionId
            };

            await userData.save();

            res.json({
                success: true,
                message: 'Transaction updated successfully',
                data: userData.transactions[transactionIndex]
            });
        } catch (error) {
            console.error('Error updating transaction:', error);
            res.status(500).json({
                success: false,
                message: 'Error updating transaction',
                error: error.message
            });
        }
    }

    /**
     * Get summary for a month (from both old and new format)
     */
    static async getMonthlySummary(req, res) {
        try {
            const { user, month, year } = req.body;

            if (!user || !month || !year) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'User ID, month, and year are required' 
                });
            }

            // Get transactions from both old and new format
            const allTransactions = await getAllTransactionsForUser(user);

            const transactions = allTransactions.filter(t => 
                t.month === Number(month) && t.year === Number(year)
            );

            const summary = {
                income: 0,
                expense: 0,
                savings: 0,
                byCategory: {}
            };

            transactions.forEach(t => {
                if (t.type === 'income') summary.income += t.amount;
                else if (t.type === 'expense') summary.expense += t.amount;
                else if (t.type === 'savings') summary.savings += t.amount;

                if (!summary.byCategory[t.category]) {
                    summary.byCategory[t.category] = { amount: 0, count: 0, type: t.type };
                }
                summary.byCategory[t.category].amount += t.amount;
                summary.byCategory[t.category].count += 1;
            });

            summary.net = summary.income - summary.expense;

            res.json({
                success: true,
                message: 'Monthly summary retrieved successfully',
                summary,
                transactionCount: transactions.length,
                source: 'combined (new + old format)'
            });
        } catch (error) {
            console.error('Error fetching summary:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching summary',
                error: error.message
            });
        }
    }

    /**
     * Get category-wise breakdown (from both old and new format)
     */
    static async getCategoryBreakdown(req, res) {
        try {
            const { user, month, year, type } = req.body;

            if (!user) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'User ID is required' 
                });
            }

            // Get transactions from both old and new format
            let transactions = await getAllTransactionsForUser(user);

            if (month && year) {
                transactions = transactions.filter(t => 
                    t.month === Number(month) && t.year === Number(year)
                );
            }

            if (type) {
                transactions = transactions.filter(t => t.type === type);
            }

            const breakdown = {};
            transactions.forEach(t => {
                if (!breakdown[t.category]) {
                    breakdown[t.category] = { amount: 0, count: 0 };
                }
                breakdown[t.category].amount += t.amount;
                breakdown[t.category].count += 1;
            });

            res.json({
                success: true,
                message: 'Category breakdown retrieved successfully',
                breakdown,
                source: 'combined (new + old format)'
            });
        } catch (error) {
            console.error('Error fetching breakdown:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching breakdown',
                error: error.message
            });
        }
    }
}

module.exports = TransactionController;
