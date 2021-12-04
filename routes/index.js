const express = require('express');
const router = express.Router();

const csv = require('csvtojson');
const fs = require('fs');

const Transaction = require('../models/transaction');
const Household = require('../models/household');
const Product = require('../models/product');

const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');

router.get('/', forwardAuthenticated, (req, res) => {
  res.render('index', { user: req.user });
});

router.get('/home', ensureAuthenticated, (req, res) => {
  let id = 10; // Default household id
  if (req.query.id) {
    id = req.query.id;
  }
  Transaction.aggregate([
    {
      $match: {
        'HSHD_NUM': parseInt(id)
      }
    },
    {
      $lookup: {
        from: 'households',
        localField: 'HSHD_NUM',
        foreignField: 'HSHD_NUM',
        as: 'HSHD_NUM'
      },
    },
    {
      $unwind: {
        path: '$HSHD_NUM',
        preserveNullAndEmptyArrays: false
      }
    },
    {
      $lookup: {
        from: 'products',
        localField: 'PRODUCT_NUM',
        foreignField: 'PRODUCT_NUM',
        as: 'PRODUCT_NUM'
      },
    },
    {
      $unwind: {
        path: '$PRODUCT_NUM',
        preserveNullAndEmptyArrays: false
      }
    },
    {
      $sort: {
        'HSHD_NUM.BASKET_NUM': 1,
        'PURCHASE': 1,
        'PRODUCT_NUM.PRODUCT_NUM': 1,
        'PRODUCT_NUM.DEPARTMENT': 1,
        'PRODUCT_NUM.COMMODITY': 1
      }
    }
  ], (err, transactions) => {
    if (err) {
      console.log(err);
    } else {
      res.render('home', {
        user: req.user,
        transactions: transactions.reverse().reverse()
      });
    }
  });
});

router.get('/temporal', ensureAuthenticated, (req, res) => {
  res.render('temporal', { user: req.user });
});

router.get('/demographic', ensureAuthenticated, (req, res) => {
  res.render('demographic', { user: req.user });
});

router.get('/upload', ensureAuthenticated, (req, res) => {
  res.render('upload', { user: req.user });
});

router.post('/upload/data', ensureAuthenticated, (req, res) => {
  if (!req.files) {
    return res.status(400).send('No files were uploaded.');
  }

  let transactions = req.files.Transactions;
  let households = req.files.Households;
  let products = req.files.Products;

  transactions.mv(`${__dirname}/../temp/transactions.csv`, (err) => {
    if (err) {
      console.log(err);
      return res.status(500).send(err);
    }
  });

  households.mv(`${__dirname}/../temp/households.csv`, (err) => {
    if (err) {
      console.log(err);
      return res.status(500).send(err);
    }
  });

  products.mv(`${__dirname}/../temp/products.csv`, (err) => {
    if (err) {
      console.log(err);
      return res.status(500).send(err);
    }
  });

  csv().fromFile(`${__dirname}/../temp/transactions.csv`)
    .then((transactions) => {
      Transaction.insertMany(transactions, (err) => {
        if (err) {
          console.log(err);
        } else {
          console.log('All records inserted - Transactions');
        }
      });
    });

  csv().fromFile(`${__dirname}/../temp/households.csv`)
    .then((households) => {
      Household.insertMany(households, (err) => {
        if (err) {
          console.log(err);
        } else {
          console.log('All records inserted - Households');
        }
      });
    });

  csv().fromFile(`${__dirname}/../temp/products.csv`)
    .then((products) => {
      Product.insertMany(products, (err) => {
        if (err) {
          console.log(err);
        } else {
          console.log('All records inserted - Products');
        }
      });
    });

  req.flash('success', 'Files uploaded successfully!');
  res.redirect('/upload');
});

router.get('/prepare/clear', (req, res) => {
  Transaction.deleteMany({}, (err) => {
    if (err) {
      console.log(err);
    } else {
      console.log('All records deleted - Transactions');
    }
  });

  Household.deleteMany({}, (err) => {
    if (err) {
      console.log(err);
    } else {
      console.log('All records deleted - Households');
    }
  });

  Product.deleteMany({}, (err) => {
    if (err) {
      console.log(err);
    } else {
      console.log('All records deleted - Products');
    }
  });

  res.status(200).send('Cleared');
});

router.get('/prepare/build', (req, res) => {
  csv().fromFile(`${__dirname}/../data/400_transactions.csv`)
    .then((transactions) => {
      Transaction.insertMany(transactions, (err) => {
        if (err) {
          console.log(err);
        } else {
          console.log('All records inserted - Transactions');
        }
      });
    });

  csv().fromFile(`${__dirname}/../data/400_households.csv`)
    .then((households) => {
      Household.insertMany(households, (err) => {
        if (err) {
          console.log(err);
        } else {
          console.log('All records inserted - Households');
        }
      });
    });

  csv().fromFile(`${__dirname}/../data/400_products.csv`)
    .then((products) => {
      Product.insertMany(products, (err) => {
        if (err) {
          console.log(err);
        } else {
          console.log('All records inserted - Products');
        }
      });
    });

  res.status(200).send('Data prepared');
});

module.exports = router;