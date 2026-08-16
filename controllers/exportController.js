const { User } = require('../models/schemas');
const { getAllTransactionsForUser } = require('../utils/backwardCompatibility');

class ExportController {
    /**
     * Export data as JSON (includes old format data)
     */
    static async exportJSON(req, res) {
        try {
            const { user } = req.body;

            if (!user) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'User ID is required' 
                });
            }

            // Get transactions from both old and new format
            const transactions = await getAllTransactionsForUser(user);

            // Get budgets and goals from new format
            const userData = await User.findOne({ user });

            const exportData = {
                exportedAt: new Date().toISOString(),
                user: user,
                transactions: transactions,
                budgets: userData?.budgets || [],
                goals: userData?.goals || [],
                source: 'combined (new + old format)'
            };

            res.setHeader('Content-Disposition', `attachment; filename="expense-tracker-${user}-${Date.now()}.json"`);
            res.setHeader('Content-Type', 'application/json');
            res.json(exportData);
        } catch (error) {
            console.error('Error exporting data:', error);
            res.status(500).json({
                success: false,
                message: 'Error exporting data',
                error: error.message
            });
        }
    }

    /**
     * Export data as CSV (includes old format data)
     */
    static async exportCSV(req, res) {
        try {
            const { user } = req.body;

            if (!user) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'User ID is required' 
                });
            }

            // Get transactions from both old and new format
            const transactions = await getAllTransactionsForUser(user);

            const headers = ['Date', 'Month', 'Year', 'Amount', 'Type', 'Description', 'Category', 'Notes'];
            
            let csvContent = headers.join(',') + '\n';
            
            transactions.forEach(t => {
                const row = [
                    new Date(t.date).toLocaleDateString(),
                    t.month,
                    t.year,
                    t.amount,
                    t.type,
                    `"${t.description}"`,
                    t.category,
                    `"${t.notes || ''}"`
                ];
                csvContent += row.join(',') + '\n';
            });

            res.setHeader('Content-Disposition', `attachment; filename="expense-tracker-${user}-${Date.now()}.csv"`);
            res.setHeader('Content-Type', 'text/csv');
            res.send(csvContent);
        } catch (error) {
            console.error('Error exporting CSV:', error);
            res.status(500).json({
                success: false,
                message: 'Error exporting CSV',
                error: error.message
            });
        }
    }

    /**
     * Import data from JSON
     */
    static async importJSON(req, res) {
        try {
            const { user, data } = req.body;

            if (!user || !data) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'User ID and data are required' 
                });
            }

            let importedData;
            if (typeof data === 'string') {
                importedData = JSON.parse(data);
            } else {
                importedData = data;
            }

            const result = await User.findOneAndUpdate(
                { user },
                {
                    $push: {
                        transactions: { $each: importedData.transactions || [] },
                        budgets: { $each: importedData.budgets || [] },
                        goals: { $each: importedData.goals || [] }
                    }
                },
                { upsert: true, new: true }
            );

            res.json({
                success: true,
                message: 'Data imported successfully',
                imported: {
                    transactions: (importedData.transactions || []).length,
                    budgets: (importedData.budgets || []).length,
                    goals: (importedData.goals || []).length
                }
            });
        } catch (error) {
            console.error('Error importing data:', error);
            res.status(500).json({
                success: false,
                message: 'Error importing data',
                error: error.message
            });
        }
    }

    /**
     * Get statistics (includes old format data)
     */
    static async getStatistics(req, res) {
        try {
            const { user, year } = req.body;

            if (!user) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'User ID is required' 
                });
            }

            // Get transactions from both old and new format
            let transactions = await getAllTransactionsForUser(user);

            if (year) {
                transactions = transactions.filter(t => t.year === Number(year));
            }

            const stats = {
                total_transactions: transactions.length,
                total_income: 0,
                total_expense: 0,
                total_savings: 0,
                average_transaction: 0,
                monthly_breakdown: {}
            };

            transactions.forEach(t => {
                if (t.type === 'income') stats.total_income += t.amount;
                else if (t.type === 'expense') stats.total_expense += t.amount;
                else if (t.type === 'savings') stats.total_savings += t.amount;

                const monthKey = `${t.year}-${String(t.month).padStart(2, '0')}`;
                if (!stats.monthly_breakdown[monthKey]) {
                    stats.monthly_breakdown[monthKey] = { income: 0, expense: 0, savings: 0 };
                }
                stats.monthly_breakdown[monthKey][t.type] += t.amount;
            });

            if (stats.total_transactions > 0) {
                stats.average_transaction = Math.round(
                    (stats.total_income + stats.total_expense + stats.total_savings) / stats.total_transactions
                );
            }

            stats.net_balance = stats.total_income - stats.total_expense;

            res.json({
                success: true,
                message: 'Statistics retrieved successfully',
                stats,
                source: 'combined (new + old format)'
            });
        } catch (error) {
            console.error('Error fetching statistics:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching statistics',
                error: error.message
            });
        }
    }
}

module.exports = ExportController;
