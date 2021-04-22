const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');


const userController = {

    signup: (req, res, next) => {

        User.find({
                email: req.body.email
            }).exec()
            .then(user => {
    
                if (user.length >= 1) {
                    return res.status(409).json({
                        message: "This email has already been exist!",
                    });
                } else {
                    bcrypt.hash(req.body.password, 10, (err, hash) => {
                        if (err) {
                            return res.status(500).json({
                                message: "Internal Server Error!",
                                error: err
                            });
                        } else {
                            const user = new User({
                                _id: new mongoose.Types.ObjectId(),
                                name: req.body.name,
                                email: req.body.email,
                                password: hash
                            });
    
                            user
                                .save()
                                .then(() => {
                                    return res.status(201).json({
                                        message: "User registration has been completed successfully!",
                                        createdUser: user
                                    });
                                })
                                .catch((err) => {
                                    return res.status(400).json({
                                        message: "Bad Request!",
                                        error: err
                                    });
                                });
                        }
    
                    });
                }
            })
            .catch((err) => {
                return res.status(400).json({
                    message: "Bad Request!",
                    error: err
                });
            });
    },

    login: (req,res,next) =>{
        User.findOne({
            email: req.body.email
        }).exec()
        .then(user => {
    
            if (user == null) {
                return res.status(401).json({
                    message: "Auth Failed!",
                });
            } 
            bcrypt.compare(req.body.password, user.password, (err, result)=>{
                if(err){
                    return res.status(401).json({
                        message: "Auth Failed!",
                    });
                }
                if(result){
                    const userinfo = {email:  user.email, userId: user._id};
                    const accessToken = jwt.sign(userinfo, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
                    const refreshToken = jwt.sign(userinfo, process.env.REFRESH_TOKEN_SECRET); // Check https://jwt.io/

                    res.cookie('refresh_token',refreshToken, {
                        maxAge: 3600000, //seconds
                        httpOnly: true
                    });
                    return res.status(200).json({
                        message: "Auth Successful!",
                        access_token: accessToken,
                        refresh_token: refreshToken
                    });
                    
                     
                }
                return res.status(400).json({
                    message: "Bad Request!",
                    error: err
                });

    
            });
        })
        .catch((err) => {
            return res.status(400).json({
                message: "Bad Request!",
                error: err
            });
        });
        
    },
    token: (req, res) => {
        const refreshToken = req.cookies.refresh_token;
        if (refreshToken == null) return res.sendStatus(401)
        User.findOne({ refresh_token:refreshToken })
        .exec()
        .then(() =>{
            jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
                if (err){
                    return res.status(403).json({
                        message: "Forbidden!",
                        error: err
                    });
                } 
                const userinfo = {email:  user.email, userId: user._id};
                const accessToken = jwt.sign(userinfo, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '3h' });
                return res.status(200).json({
                    message: "New Access Token!",
                    access_token: accessToken
                });
              })
        })
        .catch((err)=>{
            return res.status(403).json({
                message: "This refresh token does not exist in database!",
                error: err
            });
        })
        
      }
}

module.exports = userController;