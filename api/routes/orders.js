//Libraries
var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');

//Imports The Model 
var Order = require('../models/order');
var Product = require('../models/product');

//Gets The Orders From The Database
router.get('/', (req, res, next) => {
    Order
        .find()
        .select('product quantity _id')
        .populate('product','name')
        .exec()
        .then(docs => {
            res.status(200).json({
                count: docs.quantity,
                orders: docs.map(doc => {
                    return {
                        _id: doc._id,
                        product: doc.product,
                        quantity: doc.quantity,
                        request: {
                            type: 'GET',
                            url: 'http://localhost:3000/orders/' + doc._id
                        }
                    }
                })
            });
        })
        .catch(err => {
            res.status(500).json({ Error: err });
        })
});

router.get('/:OrderId', (req, res, next) => {
    Order.findById(req.params.OrderId)
    .populate('product')
    .exec()
    .then(order =>{
        if(!order){
            res.status(404).json({
                message: "Order Not Found"
            });
        }
        res.status(200).json({
            order: order,
            request:{
                type: 'GET',
                url: 'http://localhost:3000/orders/'
            }
        });
    })
    .catch(err =>{
        res.status(500).json({
            Error: err
        });
    })
});

//Post the Orders in The Database
router.post('/', (req, res, next) => {
    Product.findById(req.body.productID)
        .then(product => {
            if(!product){
                res.status(404).json({
                    message: 'Product Not Found'
                });
            }
            var order = new Order({
                _id: mongoose.Types.ObjectId(),
                product: req.body.productID,
                quantity: req.body.quantity,
            });
            return order
            .save()
        })
        .then(result => {
            console.log(result);
            res.status(201).json({
                message: "Order Stored",
                createdOrder: {
                    _id: result._id,
                    product: result.product,
                    quantity: result.quantity
                },
                request: {
                    type: 'GET',
                    url: 'http://localhost:3000/orders/' + result._id
                }
            });
        });
});

//Deletes The Orders From The Database
router.delete('/:OrderId', (req, res, next) => {
    Order.deleteOne({_id:req.params.OrderId})
    .exec()
    .then(result =>{
        res.status(200).json({
            message: "Order Deleted",
            request:{
                type: 'POST',
                url: 'http://localhost:3000/orders/',
                body: {
                    productID: 'ID',
                    quantity: 'Number'
                }
            }
        });
    })
    .catch(err =>{
        res.status(500).json({
            Error: err
        });
    });
});

module.exports = router;


