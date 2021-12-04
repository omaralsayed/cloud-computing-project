const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    HSHD_NUM: {
        type: Number,
        required: true
    },
    BASKET_NUM: {
        type: Number,
        required: false
    },
    PURCHASE_: {
        type: String,
        required: false
    },
    PRODUCT_NUM: {
        type: Number,
        required: false
    },
    SPEND: {
        type: String,
        required: false
    },
    UNITS: {
        type: String,
        required: false
    },
    STORE_R: {
        type: String,
        required: false
    },
    WEEK_NUM: {
        type: Number,
        required: false
    },
    YEAR: {
        type: Number,
        required: false
    }
});

const Transaction = mongoose.model('Transaction', transactionSchema);
module.exports = Transaction;