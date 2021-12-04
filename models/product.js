const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    PRODUCT_NUM: {
        type: Number,
        required: true
    },
    DEPARTMENT: {
        type: String,
        required: false
    },
    COMMODITY: {
        type: String,
        required: false
    },
    BRAND_TY: {
        type: String,
        required: false
    },
    NATURAL_ORGANIC_FLAG: {
        type: String,
        required: false
    }
});

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
