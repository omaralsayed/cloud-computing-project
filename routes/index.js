const express = require('express');
const router = express.Router();

const csv = require('csv-parser');
const fs = require('fs');

const Transaction = require('../models/transaction');
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
    // {
    //   // TODO: Verify ORDER BY
    //   $sort: {
    //     'HSHD_NUM.BASKET_NUM': 1,
    //     'PURCHASE': 1,
    //     'PRODUCT_NUM.PRODUCT_NUM': 1,
    //     'PRODUCT_NUM.DEPARTMENT': 1,
    //     'PRODUCT_NUM.COMMODITY': 1
    //   }
    // },
    {
      $limit: 100
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

  for (let file of [transactions, households, products]) {
    if (file.mimetype !== 'text/csv') {
      req.flash('fail', 'File type not supported.');
      return res.redirect('/upload');
    }
  }

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

  req.flash('success', 'Files uploaded successfully!');
  res.redirect('/upload');
});

router.get('/test/todb', ensureAuthenticated, (req, res) => {
  let tArray = [];
  let hArray = [];
  let pArray = [];
  
  fs.createReadStream(`${__dirname}/../temp/transactions.csv`)
   .pipe(csv())
   .on('data', (row) => {
      console.log(row);
      tArray.push(row);
    })
   .on('end', () => {
     console.log('transactions.csv successfully processed...');
  });

  fs.createReadStream(`${__dirname}/../temp/households.csv`)
  .pipe(csv())
  .on('data', (row) => {
    console.log(row);
    hArray.push(row);
  })
  .on('end', () => {
    console.log('households.csv successfully processed...');
  });

  fs.createReadStream(`${__dirname}/../temp/products.csv`)
  .pipe(csv())
  .on('data', (row) => {
    console.log(row);
    pArray.push(row);
  })
  .on('end', () => {
    console.log('products.csv successfully processed...');
  });
});

module.exports = router;