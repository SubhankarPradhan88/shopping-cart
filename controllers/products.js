const Product = require('../models/product');

exports.getAddProduct = (req, res, next) => {
    res.render('add-product', { 
        pageTitle: 'Add Product', 
        path: '/admin/add-product',
        activeAddProduct: true,
        formsCSS: true,
        productCSS: true
    });  
};

exports.postAddProduct = (req, res, next) => {
    const product = new Product(req.body.title);
    product.save();
    res.redirect('/');
};

exports.getProducts = (req, res, next) => {
    // res.sendFile(path.join(rootDir, 'views', 'shop.html'));  // Without any template engine
    Product.fetchAll(products => {
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
}