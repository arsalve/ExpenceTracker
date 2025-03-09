const uri = process.env.MONGODB || "mongodb+srv://Alpha1996:Alpha1996@notepad.marpq.mongodb.net/Users?retryWrites=true&w=majority";
const mongoose = require('mongoose');
const Model = require('./Models.js');
const catchHandler = require('./catchHandler.js');

mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

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
            var match = {
                $match: {
                    "transaction.month": String(req.query.month || req.body.month),
                    "transaction.year": String(req.query.year || req.body.year)
                }
            }
            result = await Model.user.aggregate([query, unwind, match]);
        } else {
            result = await Model.user.aggregate([query, unwind]);
        }
        if (result.length > 0)
            return cb(result);
        else
            return cb("object not Found");
    } catch (err) {
        catchHandler("While Finding data in the DB", err, "ErrorC");
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
    var re = 0
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
        catchHandler("While Finding data in the DB", err, "ErrorC");
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
                });
            } else {
                var obj = new Model.user(req.body);
                Model.user.create(obj).then(() => {
                    FindObj(req, resp);
                });
            }
        })
    } catch (err) {
        catchHandler("While conecting the DB", err, "ErrorC");
        return err;
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

        // Find the user
        const user = await Model.user.findOne(query);

        if (!user) {
            // User not found
            return resp.status(404).json({ error: 'User not found' });
        }

        // Remove the transaction with the specified ID
        user.transaction = user.transaction.filter(t => t.id != obj.Deid);
        await user.save();

        // Transaction deleted successfully
        FindObj(req, resp);
    } catch (error) {
        console.error('Error deleting transaction:', error.message);
        // Handle the error (e.g., send an error response)
        resp.status(500).json({ error: 'Internal server error' });
    }
}

module.exports = {
    'FindObj': FindObj,
    'Insert': Insert,
    "delEntry": delEntry
}