const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const mongoose = require('mongoose');

mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);

//Database Connection
mongoose.connect('mongodb://localhost:27017/PostMedia',{useNewUrlParser:true, useUnifiedTopology:true});

// Retrieve Routes
const userRoutes = require('./api/routes/users');
const blogRoutes = require('./api/routes/blogs');
const commentRoutes = require('./api/routes/comments');

app.use(cookieParser())
app.use(morgan('dev'));
app.use(express.json());

app.use((req, res, next) =>{
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Header', 'Origin,X-Requested-With, Content-Type,Accept,Authorization');
    if(req.method === 'OPTIONS'){
        res.header('Access-Control-Allow-Methods','PUT, PATCH, POST, GET,DELETE');
        return res.status(200).send({});
    }
    next();
})

//Base Route
app.get('/', (req,res,next) =>{
    res.status(200).json({
        message: "Welcome to the Restful API!"
    });
});

// Routes
app.use('/user', userRoutes);
app.use('/blog', blogRoutes);
app.use('/comment', commentRoutes);




// Handling errors

// If no routes are matched
app.use((req, res, next)=>{
    const error = new Error("Oops! Endpoint doesn't found.");
    error.status = 404;
    next(error);
});

//If any error occured in the app
app.use((error, req, res, next)=>{
    res.status(error.status || 500);
    res.json({
        error:{
            message: error.message
        }
    })
});


module.exports = app;