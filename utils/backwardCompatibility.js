const mongoose = require('mongoose');
const crypto = require('crypto');

/**
 * Backward Compatibility Utilities
 * Handles both old (flat) and new (nested) data structures
 */

const LEGACY_COLLECTIONS = ['transactions', 'accountdatas'];

function makeLegacyEmail(userId) {
    const salt = crypto.createHash('sha1').update(String(userId || 'legacy-user')).digest('hex').slice(0, 12);
    return `${salt}@legacy.local`;
}

function normalizeLegacyType(type) {
    const value = String(type || '').trim().toLowerCase();

    if (['income', 'credit', 'salary', 'earnings', 'received', 'deposit'].includes(value)) {
        return 'income';
    }

    if (['saving', 'savings', 'investment', 'mutual', 'ppf', 'sip', 'bank'].includes(value)) {
        return 'savings';
    }

    return 'expense';
}

function normalizeLegacyTransaction(tx, fallbackUser) {
    const dateValue = tx.date ? new Date(tx.date) : new Date();
    const rawAmount = Number(tx.amount ?? 0);
    const normalizedMonth = Number(tx.month ?? (dateValue.getMonth() + 1));
    const normalizedYear = Number(tx.year ?? dateValue.getFullYear());

    return {
        ...tx,
        user: String(tx.user || fallbackUser || ''),
        type: normalizeLegacyType(tx.type),
        amount: Number.isFinite(rawAmount) ? rawAmount : 0,
        month: Number.isFinite(normalizedMonth) ? normalizedMonth : dateValue.getMonth() + 1,
        year: Number.isFinite(normalizedYear) ? normalizedYear : dateValue.getFullYear(),
        description: tx.description || 'Legacy transaction',
        category: tx.category || tx.description || 'Uncategorized',
        notes: tx.notes || '',
        tags: Array.isArray(tx.tags) ? tx.tags : [],
        isRecurring: Boolean(tx.isRecurring),
        recurringId: tx.recurringId || '',
        id: tx.id ? String(tx.id) : `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        date: dateValue.toISOString()
    };
}

async function getLegacyTransactions() {
    const db = mongoose.connection.db;
    if (!db) {
        return [];
    }

    const rows = [];

    for (const collectionName of LEGACY_COLLECTIONS) {
        try {
            const collection = db.collection(collectionName);
            const docs = await collection.find({}).toArray();

            for (const doc of docs) {
                if (collectionName === 'transactions') {
                    const normalized = normalizeLegacyTransaction(doc, doc.user);
                    if (normalized.user) {
                        rows.push(normalized);
                    }
                    continue;
                }

                const userId = doc.user || doc.username || doc.account || doc.email || null;
                const nestedTransactions = Array.isArray(doc.transaction) ? doc.transaction : [];

                for (const item of nestedTransactions) {
                    const normalized = normalizeLegacyTransaction(item, userId);
                    if (normalized.user) {
                        rows.push(normalized);
                    }
                }
            }
        } catch (error) {
            // Ignore missing collections and continue; the app should still work if legacy data doesn't exist.
        }
    }

    return rows;
}

async function getAllTransactionsForUser(user) {
    try {
        const { User } = require('../models/schemas');
        const userData = await User.findOne({ user });
        const newTransactions = userData?.transactions || userData?.transaction || [];
        const oldTransactions = (await getLegacyTransactions()).filter(tx => String(tx.user) === String(user));

        const txMap = new Map();

        newTransactions.forEach(tx => {
            const key = tx.id ? String(tx.id) : `${tx.date}-${tx.amount}-${tx.type}-${tx.description}`;
            if (key) txMap.set(key, tx);
        });

        oldTransactions.forEach(tx => {
            const key = tx.id ? String(tx.id) : `${tx.date}-${tx.amount}-${tx.type}-${tx.description}`;
            if (key && !txMap.has(key)) {
                txMap.set(key, tx);
            }
        });

        return Array.from(txMap.values()).sort((a, b) => new Date(b.date) - new Date(a.date));
    } catch (error) {
        console.error('Error getting all transactions:', error);
        throw error;
    }
}

async function migrateOldData(user = null) {
    try {
        const { User } = require('../models/schemas');
        const legacyRows = (await getLegacyTransactions()).filter(tx => !user || String(tx.user) === String(user));

        if (legacyRows.length === 0) {
            return {
                success: true,
                message: 'No old data to migrate',
                migratedCount: 0,
                usersAffected: 0
            };
        }

        const byUser = {};
        legacyRows.forEach(tx => {
            if (!byUser[tx.user]) {
                byUser[tx.user] = [];
            }
            byUser[tx.user].push(tx);
        });

        let totalMigrated = 0;
        const usersCollection = mongoose.connection.db.collection('users');

        for (const [userId, transactions] of Object.entries(byUser)) {
            const normalizedUserId = String(userId).trim();
            const userDoc = await usersCollection.findOne({
                $or: [
                    { user: normalizedUserId },
                    { user: { $regex: new RegExp(`^${normalizedUserId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') } }
                ]
            });

            const existingTransactionList = Array.isArray(userDoc?.transactions)
                ? userDoc.transactions
                : Array.isArray(userDoc?.transaction)
                    ? userDoc.transaction
                    : [];

            const existingIds = new Set(existingTransactionList.map(t => String(t.id)));
            const newTransactions = transactions.filter(tx => !existingIds.has(String(tx.id)));

            if (newTransactions.length === 0 && userDoc) {
                continue;
            }

            const mergedTransactions = [...existingTransactionList, ...newTransactions];
            const uniqueEmail = (userDoc && (userDoc.email || userDoc.Email)) || makeLegacyEmail(normalizedUserId);

            await usersCollection.updateOne(
                userDoc ? { _id: userDoc._id } : { user: normalizedUserId },
                {
                    $set: {
                        user: normalizedUserId,
                        Email: uniqueEmail,
                        email: uniqueEmail,
                        currency: userDoc?.currency || '₹',
                        language: userDoc?.language || 'mr',
                        theme: userDoc?.theme || 'auto',
                        notifications_enabled: userDoc?.notifications_enabled ?? true,
                        transactions: mergedTransactions,
                        updated_at: new Date(),
                        created_at: userDoc?.created_at || new Date()
                    },
                    $setOnInsert: {
                        password: '',
                        __v: 0
                    }
                },
                { upsert: true }
            );

            totalMigrated += newTransactions.length;
        }

        return {
            success: true,
            message: 'Migration completed successfully',
            migratedCount: totalMigrated,
            usersAffected: Object.keys(byUser).length
        };
    } catch (error) {
        console.error('Error during migration:', error);
        throw error;
    }
}

async function checkOldDataExists() {
    try {
        return (await getLegacyTransactions()).length;
    } catch (error) {
        return 0;
    }
}

async function autoMigrateOnStartup() {
    try {
        const oldDataCount = await checkOldDataExists();

        if (oldDataCount > 0) {
            console.log(`\n⚠️  Found ${oldDataCount} legacy transactions`);
            console.log('🔄 Starting automatic migration...\n');

            const result = await migrateOldData();

            console.log('✓ Migration complete:');
            console.log(`  - Transactions migrated: ${result.migratedCount}`);
            console.log(`  - Users affected: ${result.usersAffected}\n`);
        }
    } catch (error) {
        console.error('Auto-migration failed:', error.message);
    }
}

module.exports = {
    getAllTransactionsForUser,
    migrateOldData,
    checkOldDataExists,
    autoMigrateOnStartup
};
