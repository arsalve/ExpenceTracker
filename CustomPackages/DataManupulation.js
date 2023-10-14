const uri = process.env.MONGODB
;
const mongoose = require('mongoose');
const Model = require('./Models.js');
const catchHandler = require('./catchHandler.js');
mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
});

//Following function which is triggered when req. occured on /find enpoint, finds an object in Mongo db 
async function FindObj(req, cb) {
    var re = 0;
    var query = {
        $match: {
            user: req.body.user
        }
    };
    var unwind = {
        $unwind: "$transaction"
    }
    var match = {
        $match: {
            "transaction.month": String(req.body.month),
            "transaction.year": String(req.body.year)
        }
    };
    try {
        // var result = await Model.user.find(query).sort({
        //     date: 'desc'
        // }).limit(req.body.limit).exec()
        
        var result = await Model.user.aggregate([query, unwind, match])
        // console.log(result);
        if (result.length > 0)
            return cb(result);
        else
            return cb("object not Found");
    } catch (err) {
        catchHandler("While Finding data in the DB", err, "ErrorC");
        return cb("Error")
    }
}

async function objectAvilable (req, cb) {
    var re = 0
    var query = {
        user: req.body.user
    };
    try {
        var result = await Model.user.find(query).exec();
        // console.log(result);
        if (result.length > 0)
            return  cb(result);
        else
            return cb("object not Found");
    } catch (err) {
        catchHandler("While Finding data in the DB", err, "ErrorC");
        return cb("Error")
    }


}

//Following function which is triggered when req. occured on /Update enpoint, Updates an object in Mongo db or if the object is not present it will create new  
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
    } catch {
        (err) => {
            catchHandler("While conecting the DB", err, "ErrorC");
            return err;
        }
    }


}



module.exports = {
    'FindObj': FindObj,
    'Insert': Insert
}
