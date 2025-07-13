const uri = process.env.MONGODB;
const mongoose = require('mongoose');
const Model = require('../models/Models.js');
const catchHandler = require('../utils/catchHandler.js');

mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).catch(err => {
    catchHandler("MongoDB Connection", err, "Error");
});

async function ensureFixedEntriesForMonth(user, month, year) {
    try {
        const exists = await Model.user.aggregate([
            { $match: { user } },
            { $unwind: "$transaction" },
            { $match: { "transaction.month": String(month), "transaction.year": String(year) } }
        ]);
        if (exists.length === 0) {
            const fixedEntries = await Model.FixedEntry.find({ user });
            if (fixedEntries.length > 0) {
                for (const entry of fixedEntries) {
                    const transaction = {
                        date: `${year}-${month}-01`,
                        month: Number(month),
                        year: Number(year),
                        amount: entry.amount,
                        type: entry.type,
                        description: entry.description,
                        id: Date.now() + Math.random().toString(36).slice(2)
                    };
                    try {
                        await Model.user.updateOne(
                            { user },
                            { $addToSet: { transaction } },
                            { upsert: true }
                        );
                    } catch (err) {
                        catchHandler("ensureFixedEntriesForMonth - updateOne", err, "Error");
                    }
                }
            }
        }
    } catch (err) {
        catchHandler("ensureFixedEntriesForMonth", err, "Error");
    }
}

/**
 * Finds an object in the MongoDB database based on the specified criteria.
 * @param {Object} req - search critera.
 * @param {Function} cb - Callback function to handle the result.
 */
async function FindObj(req, cb) {
    var re = 0;
    var query = {
        $match: {
            user: String(req.manuser || req.body.user)
        }
    };
    var unwind = {
        $unwind: "$transaction"
    }
    var result = [];
    try {
        if ((req.query.month || req.body.month) && (req.query.year || req.body.year)) {
            const month = req.query.month || req.body.month;
            const year = req.query.year || req.body.year;
            const userStr = String(req.manuser || req.body.user);
            try {
                await ensureFixedEntriesForMonth(userStr, month, year);
            } catch (err) {
                catchHandler("FindObj - ensureFixedEntriesForMonth", err, "Error");
            }
            var match = {
                $match: {
                    "transaction.month": String(req.query.month || req.body.month),
                    "transaction.year": String(req.query.year || req.body.year)
                }
            }
            try {
                result = await Model.user.aggregate([query, unwind, match]);
            } catch (err) {
                catchHandler("FindObj - aggregate with match", err, "Error");
                return cb("Error");
            }
        } else {
            try {
                result = await Model.user.aggregate([query, unwind]);
            } catch (err) {
                catchHandler("FindObj - aggregate", err, "Error");
                return cb("Error");
            }
        }
        if (result.length > 0)
            return cb(result);
        else
            return cb("object not Found");
    } catch (err) {
        catchHandler("FindObj", err, "Error");
        return cb("Error")
    }
}

/**
 * this will check if object is avilable in DB or not
 * @param {object} req search critera
 * @param {Function} cb call back function
 * @returns responce
 */
async function objectAvilable(req, cb) {
    var query = {
        user: req.body.user
    };
    try {
        var result = await Model.user.find(query).exec();
        if (result.length > 0)
            return cb(result);
        else
            return cb("object not Found");
    } catch (err) {
        catchHandler("objectAvilable", err, "Error");
        return cb("Error")
    }
}

/**
 *Following function which is triggered when req. occured on /Update enpoint, Updates an object in Mongo db or if the object is not present it will create new  
 * @param {object} req search critera
 * @param {Function} resp call back function will return all the avilable transactions
 */
async function Insert(req, resp) {
    try {
        objectAvilable(req, (a) => {
            if (a != "object not Found") {
                var obj = new Model.user(req.body);
                Model.user.updateOne({
                    "user": obj.user
                }, {
                    $addToSet: {
                        "transaction": req.body.transaction
                    }
                }).then(() => {
                    FindObj(req, resp);
                }).catch(err => {
                    catchHandler("Insert - updateOne", err, "Error");
                    resp("Error");
                });
            } else {
                var obj = new Model.user(req.body);
                Model.user.create(obj).then(() => {
                    FindObj(req, resp);
                }).catch(err => {
                    catchHandler("Insert - create", err, "Error");
                    resp("Error");
                });
            }
        })
    } catch (err) {
        catchHandler("Insert", err, "Error");
        return resp("Error");
    }
}

/**
 * Deletes a transaction based on its ID.
 * @param {object} req search critera
 * @param {Function} resp call back function will return all the avilable transactions
 */
async function delEntry(req, resp) {
    try {
        const obj = new Model.user(req.body);
        const query = {
            user: obj.user
        };

        let user;
        try {
            user = await Model.user.findOne(query);
        } catch (err) {
            catchHandler("delEntry - findOne", err, "Error");
            return resp({ error: 'Internal server error' });
        }

        if (!user) {
            catchHandler("delEntry", "User not found", "Warning");
            return resp({ error: 'User not found' });
        }

        try {
            user.transaction = user.transaction.filter(t => t.id != obj.Deid);
            await user.save();
        } catch (err) {
            catchHandler("delEntry - save", err, "Error");
            return resp({ error: 'Internal server error' });
        }

        try {
            FindObj(req, resp);
        } catch (err) {
            catchHandler("delEntry - FindObj", err, "Error");
            return resp({ error: 'Internal server error' });
        }
    } catch (error) {
        catchHandler("delEntry", error, "Error");
        resp({ error: 'Internal server error' });
    }
}

module.exports = {
    'FindObj': FindObj,
    'Insert': Insert,
    "delEntry": delEntry
}
