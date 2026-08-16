const express = require('express');
const router = express.Router();

const TransactionController = require('../controllers/transactionController');
const { BudgetController, GoalController } = require('../controllers/planningController');
const ExportController = require('../controllers/exportController');
const { migrateOldData, checkOldDataExists } = require('../utils/backwardCompatibility');

// Transaction Routes
router.post('/transactions/create', TransactionController.createTransaction);
router.post('/transactions/get', TransactionController.getTransactions);
router.post('/transactions/delete', TransactionController.deleteTransaction);
router.post('/transactions/update', TransactionController.updateTransaction);
router.post('/transactions/summary', TransactionController.getMonthlySummary);
router.post('/transactions/breakdown', TransactionController.getCategoryBreakdown);

// Budget Routes
router.post('/budgets/set', BudgetController.setBudget);
router.post('/budgets/get', BudgetController.getBudgets);
router.post('/budgets/status', BudgetController.getBudgetStatus);
router.post('/budgets/delete', BudgetController.deleteBudget);

// Goal Routes
router.post('/goals/create', GoalController.createGoal);
router.post('/goals/get', GoalController.getGoals);
router.post('/goals/update', GoalController.updateGoalProgress);
router.post('/goals/delete', GoalController.deleteGoal);

// Data Migration Routes (Backward Compatibility)
router.get('/migration/status', async (req, res) => {
    try {
        const oldDataCount = await checkOldDataExists();
        res.json({
            success: true,
            message: 'Migration status retrieved',
            oldDataExists: oldDataCount > 0,
            oldRecordCount: oldDataCount,
            status: oldDataCount > 0 ? 'Ready to migrate' : 'No old data found'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error checking migration status',
            error: error.message
        });
    }
});

router.post('/migration/migrate', async (req, res) => {
    try {
        const { user } = req.body;
        const result = await migrateOldData(user || null);
        
        res.json({
            success: result.success,
            message: result.message,
            migratedCount: result.migratedCount,
            usersAffected: result.usersAffected || 1
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error during migration',
            error: error.message
        });
    }
});

// Export/Import Routes
router.post('/export/json', ExportController.exportJSON);
router.post('/export/csv', ExportController.exportCSV);
router.post('/import/json', ExportController.importJSON);
router.post('/statistics', ExportController.getStatistics);

// Backwards compatibility with old endpoints
router.post('/Insert', TransactionController.createTransaction);
router.post('/Delete', TransactionController.deleteTransaction);
router.post('/find', TransactionController.getTransactions);

module.exports = router;
