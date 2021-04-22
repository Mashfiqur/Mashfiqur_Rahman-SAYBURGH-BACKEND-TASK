const mongoose = require('mongoose');
const Comment = require('../models/comment');
const Blog = require('../models/blog');


const commentController = {

    create_comment:(req,res,next) =>{        
        const comment = new Comment({
            _id: new mongoose.Types.ObjectId(),
            remark: req.body.remark,
            owner_id: req.userData.userId,
        });
        
        comment
        .save()
        .then(()=>{
            Blog.findOneAndUpdate({_id: req.body.blogId}, {$push: { comments: comment._id}}).exec()
            .then(blog =>{
                res.status(201).json({
                    message: "Comment has been created successfully!",
                    createdComment: comment
                });
            })
            .catch((err)=>{
                res.status(400).json({
                    message: "Bad Request!",
                    error: err
                });
            });
            
        })
        .catch((err)=>{
            res.status(400).json({
                message: "Bad Request!",
                error: err
            });
        });
    }
}

module.exports = commentController;