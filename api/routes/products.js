//Libraries
var express = require('express');
var mongoose = require('mongoose');
var router = express.Router();
var multer = require('multer');

var storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, './uploads/');
    },
    filename: function(req,file,cb){
        cb(null,new Date().toISOString().replace(/:/g, '-') + file.originalname);
    }
});

var fileFilter = (req, file, cb)=>{
 //Reject A File
 if(file.mimetype == 'image/jpeg' || file.mimetype == 'image/png'){
     cb(null, true);
 }
 else{
     cb(null, false);
 }
};

var upload = multer({
    storage: storage,
    limit:{
        fileSize: 1024*1024*5
    },
    fileFilter: fileFilter
});

//Importing Models
var Product = require('../models/product');

//Get Requests from the database
router.get('/', (req, res, next) => {
    Product.find()
        .select('name price _id productImage')
        .exec()
        .then(docs => {
            var response = {
                count: docs.length,
                products: docs.map(doc => {
                    return {
                        name: doc.name,
                        price: doc.price,
                        productImage: doc.productImage,
                        _id: doc._id,
                        request: {
                            type: 'GET',
                            url: 'http://localhost:3000/products/' + doc._id
                        }
                    }
                })
            };
            res.status(200).json(response);
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: err });
        })
});

//Get Requests Specific to ProductID
router.get('/:productID', (req, res, next) => {
    var id = req.params.productID;
    Product.findById(id)
        .select('name price _id productImage')
        .exec()
        .then(doc => {
            console.log("From Database: ", doc);
            if (doc) {
                res.status(200).json({
                    product: doc,
                    request: {
                        type: 'GET',
                        url: 'http://localhost:3000/products/' + doc._id
                    }
                });
            }
            else {
                res.status(404).json({ message: 'No valid entry found at provided ID' });
            }
        })
        .catch(err => {
            console.log(err)
            res.status(500).json({ error: err });
        });
});

//Post requests to the database
router.post('/',upload.single('productImage'), (req, res, next) => {
    console.log(req.file);
    var product = new Product({
        _id: mongoose.Types.ObjectId(),
        name: req.body.name,
        price: req.body.price,
        productImage: req.file.path
    });
    product.save().then(result => {
        res.status(201).json({
            message: 'Created Product Successfully',
            createdProduct: {
                name: result.name,
                price: result.price,
                _id: result._id,
                request: {
                    type: 'GET',
                    url: 'http://localhost:3000/products/' + result._id
                }
            }
        });
    })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: err });

        });
});

//Patching data to the Database
router.patch('/:productID', (req, res, next) => {
    var id = req.params.productID;
    var updateOps = {};
    for (var ops of req.body) {
        updateOps[ops.propName] = ops.value;
    }
    Product.update({ _id: id }, { $set: updateOps })
        .exec()
        .then(result => {
            res.status(200).json({
                message: 'Product Updated',
                request: {
                    type: 'GET',
                    url: 'http://localhost:3000/products/' + id
                }
            });
        })
        .catch(err => {
            res.status(500).json({ error: err });
        })
});

//Deleting Data From The Database
router.delete('/:productID', (req, res, next) => {
    var id = req.params.productID;
    Product.deleteOne({ _id: id })
        .exec()
        .then(result => {
            res.status(200).json({
                message: 'Product Deleted',
                request: {
                    type: 'POST',
                    url: "http://localhost:3000/products",
                    body: { name: 'String', price: 'Number' }
                }
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: err });
        })
});

module.exports = router;


