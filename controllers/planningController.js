const { User } = require('../models/schemas');

class BudgetController {
    /**
     * Create or update a budget
     */
    static async setBudget(req, res) {
        try {
            const { user, category, limit, month, year, alert_threshold } = req.body;

            if (!user || !category || !limit) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Missing required fields' 
                });
            }

            const budget = {
                category,
                limit: Number(limit),
                month: month || new Date().getMonth() + 1,
                year: year || new Date().getFullYear(),
                alert_threshold: alert_threshold || 80,
                created_at: new Date()
            };

            const result = await User.findOneAndUpdate(
                { user },
                { $push: { budgets: budget } },
                { upsert: true, new: true }
            );

            res.status(201).json({
                success: true,
                message: 'Budget created successfully',
                data: budget
            });
        } catch (error) {
            console.error('Error creating budget:', error);
            res.status(500).json({
                success: false,
                message: 'Error creating budget',
                error: error.message
            });
        }
    }

    /**
     * Get budgets for a user
     */
    static async getBudgets(req, res) {
        try {
            const { user, month, year } = req.body;

            if (!user) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'User ID is required' 
                });
            }

            const userData = await User.findOne({ user });
            if (!userData) {
                return res.json({
                    success: true,
                    message: 'No budgets found',
                    data: []
                });
            }

            let budgets = userData.budgets || [];

            if (month && year) {
                budgets = budgets.filter(b => 
                    b.month === Number(month) && b.year === Number(year)
                );
            }

            res.json({
                success: true,
                message: 'Budgets retrieved successfully',
                data: budgets
            });
        } catch (error) {
            console.error('Error fetching budgets:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching budgets',
                error: error.message
            });
        }
    }

    /**
     * Get budget status (spent vs limit)
     */
    static async getBudgetStatus(req, res) {
        try {
            const { user, month, year } = req.body;

            if (!user || !month || !year) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'User ID, month, and year are required' 
                });
            }

            const userData = await User.findOne({ user });
            if (!userData) {
                return res.json({
                    success: true,
                    message: 'No data found',
                    status: []
                });
            }

            const budgets = userData.budgets?.filter(b => 
                b.month === Number(month) && b.year === Number(year)
            ) || [];

            const transactions = userData.transactions?.filter(t => 
                t.month === Number(month) && t.year === Number(year) && t.type === 'expense'
            ) || [];

            const status = budgets.map(budget => {
                const spent = transactions
                    .filter(t => t.category === budget.category)
                    .reduce((sum, t) => sum + t.amount, 0);

                const percentUsed = (spent / budget.limit) * 100;
                const remaining = Math.max(0, budget.limit - spent);
                const isExceeded = spent > budget.limit;
                const isAlert = percentUsed >= budget.alert_threshold;

                return {
                    category: budget.category,
                    limit: budget.limit,
                    spent,
                    remaining,
                    percentUsed: Math.round(percentUsed),
                    isExceeded,
                    isAlert,
                    status: isExceeded ? 'exceeded' : isAlert ? 'alert' : 'ok'
                };
            });

            res.json({
                success: true,
                message: 'Budget status retrieved successfully',
                status
            });
        } catch (error) {
            console.error('Error fetching budget status:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching budget status',
                error: error.message
            });
        }
    }

    /**
     * Delete a budget
     */
    static async deleteBudget(req, res) {
        try {
            const { user, category } = req.body;

            if (!user || !category) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'User ID and category are required' 
                });
            }

            const result = await User.findOneAndUpdate(
                { user },
                { $pull: { budgets: { category } } },
                { new: true }
            );

            res.json({
                success: true,
                message: 'Budget deleted successfully'
            });
        } catch (error) {
            console.error('Error deleting budget:', error);
            res.status(500).json({
                success: false,
                message: 'Error deleting budget',
                error: error.message
            });
        }
    }
}

class GoalController {
    /**
     * Create a new goal
     */
    static async createGoal(req, res) {
        try {
            const { user, name, target_amount, target_date, priority, description } = req.body;

            if (!user || !name || !target_amount) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Missing required fields' 
                });
            }

            const goal = {
                name,
                target_amount: Number(target_amount),
                current_amount: 0,
                target_date: target_date ? new Date(target_date) : null,
                priority: priority || 'medium',
                description: description || '',
                status: 'active',
                created_at: new Date()
            };

            const result = await User.findOneAndUpdate(
                { user },
                { $push: { goals: goal } },
                { upsert: true, new: true }
            );

            res.status(201).json({
                success: true,
                message: 'Goal created successfully',
                data: goal
            });
        } catch (error) {
            console.error('Error creating goal:', error);
            res.status(500).json({
                success: false,
                message: 'Error creating goal',
                error: error.message
            });
        }
    }

    /**
     * Get all goals for a user
     */
    static async getGoals(req, res) {
        try {
            const { user, status } = req.body;

            if (!user) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'User ID is required' 
                });
            }

            const userData = await User.findOne({ user });
            if (!userData) {
                return res.json({
                    success: true,
                    message: 'No goals found',
                    data: []
                });
            }

            let goals = userData.goals || [];

            if (status) {
                goals = goals.filter(g => g.status === status);
            }

            res.json({
                success: true,
                message: 'Goals retrieved successfully',
                data: goals
            });
        } catch (error) {
            console.error('Error fetching goals:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching goals',
                error: error.message
            });
        }
    }

    /**
     * Update goal progress
     */
    static async updateGoalProgress(req, res) {
        try {
            const { user, goalName, amount } = req.body;

            if (!user || !goalName || amount === undefined) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Missing required fields' 
                });
            }

            const userData = await User.findOne({ user });
            if (!userData) {
                return res.status(404).json({ 
                    success: false, 
                    message: 'User not found' 
                });
            }

            const goal = userData.goals.find(g => g.name === goalName);
            if (!goal) {
                return res.status(404).json({ 
                    success: false, 
                    message: 'Goal not found' 
                });
            }

            goal.current_amount = Number(amount);
            if (goal.current_amount >= goal.target_amount) {
                goal.status = 'completed';
            }

            await userData.save();

            res.json({
                success: true,
                message: 'Goal progress updated successfully',
                data: goal
            });
        } catch (error) {
            console.error('Error updating goal:', error);
            res.status(500).json({
                success: false,
                message: 'Error updating goal',
                error: error.message
            });
        }
    }

    /**
     * Delete a goal
     */
    static async deleteGoal(req, res) {
        try {
            const { user, goalName } = req.body;

            if (!user || !goalName) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'User ID and goal name are required' 
                });
            }

            const result = await User.findOneAndUpdate(
                { user },
                { $pull: { goals: { name: goalName } } },
                { new: true }
            );

            res.json({
                success: true,
                message: 'Goal deleted successfully'
            });
        } catch (error) {
            console.error('Error deleting goal:', error);
            res.status(500).json({
                success: false,
                message: 'Error deleting goal',
                error: error.message
            });
        }
    }
}

module.exports = { BudgetController, GoalController };
