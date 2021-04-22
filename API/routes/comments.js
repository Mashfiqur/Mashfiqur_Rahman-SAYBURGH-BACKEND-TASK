const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const checkUser = require('../middlewares/auth-find');

const CommentController =  require('../controllers/commentController');


router.post('/', checkUser, CommentController.create_comment);


module.exports = router;
