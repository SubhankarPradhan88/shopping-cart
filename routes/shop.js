const path = require('path');

const express = require('express');

const rootDir = require('../util/path');

const adminData = require('./admin');

const router = express.Router();

router.get('/', (req, res, next) => {
    console.log('Shop ==>: ', adminData.products);
    const products = adminData.products;

    // res.sendFile(path.join(rootDir, 'views', 'shop.html'));  // Without any template engine

    // Render the Shop pug template & passing props to it
    res.render('shop', { 
        prods: products, 
        pageTitle: 'Shop', 
        path: '/',
        hasProducts:  products.length > 0,
        activeShop: true,
        productCSS: true
        // layout: false       // Set this layout key to false so that it disables the default layout, means it won't use the default layout
    });     
});

module.exports = router;