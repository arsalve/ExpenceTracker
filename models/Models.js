const mongoose = require('mongoose');
const {
    string
} = require('yargs');
const Acc = mongoose.Schema({
    'date': {
        type: String
    },
    'month': {
        type: Number
    },
    'year': {
        type: Number
    },
    'amount': {
        type: Number
    },
    'type': {
        type: String
    },
    'description': {
        type: String
    },
    'HS': {
        type: Object
    },
    'id': {
        type: String
    }
}, {
    timestamps: true
},{ strict: false })
const Use = mongoose.Schema({
    'user': {
        type: String
    },
    'transaction': {
        type: Array
    }
    
},{ strict: false });
const Acount = mongoose.model('Account', Acc)
const user = mongoose.model('AccountDAta', Use)

module.exports = {
    'Acount': Acount,
    'user': user

};
