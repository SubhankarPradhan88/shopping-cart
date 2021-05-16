// const fs = require('fs');
// const path = require('path');

const db = require('../util/database');
const Cart = require('./cart');

// const p = path.join(path.dirname(require.main.filename), 'data', 'products.json');

const getProductsFromFile = cb => {
    fs.readFile(p, (err, fileContent) => {
        // Invoke the call-back function that is been passed in the controller fetchAll method
        if (err) {
            cb([]);
        } else {
            cb(JSON.parse(fileContent));
        }
    });
}

module.exports = class Product {
    constructor(id, title, imageUrl, price, description) {
        this.id = id;
        this.title = title;
        this.imageUrl = imageUrl;
        this.price = price;
        this.description = description;
    }

    // ***** Using File System to store / fetch / delete and read ******

    // save() {
    //     getProductsFromFile(products => {
    //         if(this.id) {
    //             const existingProductsIndex = products.findIndex(prod => prod.id === this.id);
    //             const updatedProducts = [...products];
    //             updatedProducts[existingProductsIndex] = this;
    //             fs.writeFile(p, JSON.stringify(updatedProducts), (err) => {
    //                 console.log(err);
    //             });
    //         }else {
    //             this.id = Math.random().toString();
    //             products.push(this);
    //             fs.writeFile(p, JSON.stringify(products), (err) => {
    //                 console.log(err);
    //             });
    //         }
    //     })
    // }

    // static fetchAll(cb) {
    //     getProductsFromFile(cb);
    // }

    // static deleteById(id) {
    //     getProductsFromFile(products => {
    //         const delProduct = products.find(prod => prod.id === id); 
    //         const updatedProducts = products.filter(prod => prod.id !== id); 
    //         fs.writeFile(p, JSON.stringify(updatedProducts), err => {
    //             if(!err) {
    //                 Cart.deleteProduct(id, delProduct.price);
    //             }
    //         });
    //     })
    // }
    // static findById(id, cb) {
    //     getProductsFromFile(products => {
    //         const product = products.find(p => p.id === id);    // Find method retuns the first matched object
    //         cb(product);
    //     })
    // }

    // Using DB to store / fetch / delete and read
    save() {
        return db.execute('INSERT INTO products (title, price, imageUrl, description) VALUES (?, ?, ?, ?)',
            [this.title, this.price, this.imageUrl, this.description]
        );
    }   

    static fetchAll() {
        return db.execute('SELECT * FROM products');
    }

    static deleteById(id) {


    }

    static findById(id) {
        return db.execute('SELECT * FROM products WHERE products.id = ?', [id]);
    }
    
}