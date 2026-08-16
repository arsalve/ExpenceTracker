const TRANSACTION_TYPES = {
    INCOME: 'income',
    EXPENSE: 'expense',
    SAVINGS: 'savings'
};

const EXPENSE_CATEGORIES = {
    FOOD: 'Food',
    FUEL: 'Fuel',
    TRANSPORT: 'Transport',
    UTILITIES: 'Utilities',
    ENTERTAINMENT: 'Entertainment',
    HEALTHCARE: 'Healthcare',
    GROCERIES: 'Groceries',
    SHOPPING: 'Shopping',
    INSURANCE: 'Insurance',
    MAINTENANCE: 'Maintenance',
    COMMUNICATION: 'Communication',
    EDUCATION: 'Education',
    PERSONAL_CARE: 'Personal Care',
    OTHER: 'Other'
};

const INCOME_CATEGORIES = {
    SALARY: 'Salary',
    FREELANCE: 'Freelance',
    INVESTMENT: 'Investment Returns',
    BONUS: 'Bonus',
    GIFT: 'Gift',
    REFUND: 'Refund',
    OTHER: 'Other'
};

const SAVINGS_CATEGORIES = {
    MUTUAL_FUNDS: 'Mutual Funds',
    FD: 'Fixed Deposit',
    RD: 'Recurring Deposit',
    GOLD: 'Gold',
    PPF: 'PPF',
    BANK: 'Bank Savings',
    INVESTMENT: 'Investment',
    OTHER: 'Other'
};

const MARATHI_CATEGORIES = {
    [EXPENSE_CATEGORIES.FOOD]: 'आहार',
    [EXPENSE_CATEGORIES.FUEL]: 'इंधन',
    [EXPENSE_CATEGORIES.TRANSPORT]: 'परिवहन',
    [EXPENSE_CATEGORIES.UTILITIES]: 'उपयोगिता',
    [EXPENSE_CATEGORIES.ENTERTAINMENT]: 'मनोरंजन',
    [EXPENSE_CATEGORIES.HEALTHCARE]: 'आरोग्य',
    [EXPENSE_CATEGORIES.GROCERIES]: 'किराणा',
    [EXPENSE_CATEGORIES.SHOPPING]: 'खरेदी',
    [EXPENSE_CATEGORIES.INSURANCE]: 'विमा',
    [EXPENSE_CATEGORIES.MAINTENANCE]: 'देखरेख',
    [INCOME_CATEGORIES.SALARY]: 'पगार',
    [SAVINGS_CATEGORIES.MUTUAL_FUNDS]: 'म्युच्युअल फंड्स'
};

module.exports = {
    TRANSACTION_TYPES,
    EXPENSE_CATEGORIES,
    INCOME_CATEGORIES,
    SAVINGS_CATEGORIES,
    MARATHI_CATEGORIES
};
