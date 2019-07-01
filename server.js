//Required Libraries
var express = require('express');
var app = express();
var morgan = require('morgan');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

//Routes
var productRoutes = require('./api/routes/products');
var orderRoutes = require('./api/routes/orders');
var userRoutes = require('./api/routes/users');

//Password
var password = "nodeshop";

//Connection To MongoDB Atlas
mongoose.connect('mongodb+srv://node-api:' + password + '@node-rest-api-gaowe.mongodb.net/test?retryWrites=true&w=majority',
{
    useNewUrlParser: true
}, function (err) {
    if (err) {
        console.log(err);
    }
    else {
        console.log("Connected To The Database");
    }
});

//Middlewares
app.use(morgan('dev'));
app.use('/uploads',express.static('uploads'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//Routes Which handle requests
app.use('/products', productRoutes);
app.use('/orders', orderRoutes);
app.use('/users',userRoutes);

app.use((req, res, next) => {
    var error = new Error('Not Found');
    error.status = 404;
    next(error);
});
app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    });
});

//Runnning Server
app.listen(3000, function(err){
    if (err) throw err;
    console.log("Server is Running on port 3000");
  });


 

