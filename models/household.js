const mongoose = require('mongoose');

const householdSchema = new mongoose.Schema({
    HSHD_NUM: {
        type: Number,
        required: true
    },
    L: {
        type: String,
        required: false
    },
    AGE_RANGE: {
        type: String,
        required: false
    },
    MARITAL: {
        type: String,
        required: false
    },
    INCOME_RANGE: {
        type: String,
        required: false
    },
    HOMEOWNER: {
        type: String,
        required: false
    },
    HSHD_COMPOSITION: {
        type: String,
        required: false
    },
    HH_SIZE: {
        type: String,
        required: false
    },
    CHILDREN: {
        type: String,
        required: false
    }
});

const Household = mongoose.model('Household', householdSchema);
module.exports = Household;