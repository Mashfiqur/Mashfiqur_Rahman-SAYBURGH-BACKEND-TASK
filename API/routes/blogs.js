const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const checkUser = require('../middlewares/auth-find');

const BlogController =  require('../controllers/blogController');




router.post('/', checkUser, BlogController.create_blog);

router.get('/', checkUser, BlogController.get_all_blogs);

router.get('/:blogId', checkUser, BlogController.get_blog);

router.patch('/:blogId', checkUser, BlogController.update_blog);

router.delete('/:blogId', checkUser, BlogController.remove_blog);

module.exports = router;
