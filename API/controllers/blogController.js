const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Blog = require('../models/blog');
const Comment = require('../models/comment');


const blogController = {

    create_blog:(req,res,next) =>{
       
        let tags = req.body.tags;
        
        let tag_array = [];
        if(!tags == "" || !tags === null){
            if(!tags.includes(",")){
                tag_array.push(tags)
            }
            else{
                let single_tag = tags.split(',');
                single_tag.forEach(function(tag){
                    tag_array.push(tag);
                });
            }
            
        }
        
        
        
        const blog = new Blog({
            _id: new mongoose.Types.ObjectId(),
            title: req.body.title,
            description: req.body.description,
            owner_id: req.userData.userId,
            tags: tag_array,
        });
        // res.send(blog)
        blog
        .save()
        .then(()=>{
            res.status(201).json({
                message: "Blog has been created successfully!",
                createdBlog: blog
            });
        })
        .catch((err)=>{
            res.status(400).json({
                message: "Bad Request!",
                error: err
            });
        });
    },
    get_all_blogs: (req, res, next) => {
    
        Blog.find({owner_id: req.userData.userId})
        .populate([
            {
                path: 'tags',
                model: 'User',
                select: 'name',
            },
            {
                path: 'comments',
                model: 'Comment',
                select: 'remark',
                populate: {
                    path: 'owner_id',
                    model: 'User',
                    select: 'name'
                }

            }
        ])
        .exec()
        .then((doc)=>{
            const count_blogs = doc.length;
            if(count_blogs > 0){
                res.status(200).json({
                    message: "Blogs have been retrieved successfully!",
                    count : count_blogs,
                    Blogs: doc
                });
            }
            else{
                res.status(404).json({
                    message: "No Entries Found!",
                });
            }
            
        }).catch((err)=>{
            res.status(500).json({
                message: "Internal Server Error!",
                error : err
            });
        });

    },


    get_blog:(req, res, next) => {

        Blog.findOne({_id:req.params.blogId, owner_id: req.userData.userId})
        .populate([
            {
                path: 'tags',
                model: 'User',
                select: 'name',
            },
            {
                path: 'comments',
                model: 'Comment',
                select: 'remark',
                populate: {
                    path: 'owner_id',
                    model: 'User',
                    select: 'name'
                }

            }
        ])
        .exec()
        .then((doc)=>{
            if(doc != null){
                res.status(200).json({
                    message: "Blog has been retrieved successfully!",
                    Blog: doc
                });
            }
            else{
                res.status(404).json({
                    message: "No Entries Found!",
                });
            }
            
        }).catch((err)=>{
            res.status(500).json({
                message: "Internal Server Error!",
                error : err
            });
        });


    },


    update_blog:(req, res, next) => {

      Blog.findOne({_id:req.params.blogId})
        .exec()
        .then(resultDoc =>{
            if(resultDoc == null){
                res.status(404).json({
                    message: "This id does not associated with any blog!"
                });
            }
            else if(resultDoc.owner_id != req.userData.userId){
                res.status(403).json({
                    message: "You don't have access to remove this blog!"
                });
            }
            else{
                const objUp = req.body;
                const updateData = {};
                for (const property in objUp) {
                    if(property != 'tags'){
                        updateData[property] = objUp[property];
                    }
                    else{
                        let tags = objUp[property];
                        let tag_array = [];
                        if(!tags == "" || !tags === null){
                            if(!tags.includes(",")){
                                tag_array.push(tags)
                            }
                            else{
                                let single_tag = tags.split(',');
                                single_tag.forEach(function(tag){
                                    tag_array.push(tag);
                                });
                            } 
                        }
                        updateData[property] = tag_array;
                    }
                    
                }
                                
                Blog.findOneAndUpdate({_id:req.params.blogId},updateData,{new:true})
                .exec()
                .then((doc)=>{
                  console.log(doc)
                      if(doc){
                          res.status(200).json({
                              message: "Blog has been updated successfully!",
                              updatedBlog: doc
                          });
                      }
                      else{
                          res.status(404).json({
                              message: "Not Found!"
                          });
                      }
                      
              })
              .catch((err)=>{
                  res.status(500).json({
                      message: "Internal Server Error!",
                      error : err
                  });
              });
            }
        })
        .catch((err)=>{
            res.status(500).json({
                message: "Internal Server Error!",
                error : err
            });
        });


    },


    remove_blog:(req, res, next) => {
        Blog.findOne({_id:req.params.blogId})
        .exec()
        .then(resultDoc =>{
            if(resultDoc == null){
                res.status(404).json({
                    message: "This id does not associated with any blog!"
                });
            }
            else if(resultDoc.owner_id != req.userData.userId){
                res.status(403).json({
                    message: "You don't have access to remove this blog!"
                });
            }
            else{
                //Can be used Promiss.all
                Comment.deleteMany({_id: { $in: resultDoc.comments}}).exec()
                .then(com =>{
                    Blog.deleteOne({_id:req.params.blogId, owner_id: req.userData.userId})
                    .exec()
                    .then((doc)=>{
                      
                          if(doc.deletedCount != 0){
                              res.status(200).json({
                                  message: "Blog has been removed successfully!"
                              });
                          }
                          else{
                              res.status(404).json({
                                  message: "Not Found!"
                              });
                          }
                          
                      
                      
                  })
                  .catch((err)=>{
                      res.status(500).json({
                          message: "Internal Server Error!",
                          error : err
                      });
                  });
                }).catch((err)=>{
                    res.status(500).json({
                        message: "Internal Server Error!",
                        error : err
                    });
                });
            
            }
        })
        .catch((err)=>{
            res.status(500).json({
                message: "Internal Server Error!",
                error : err
            });
        });
        
    },
}

module.exports = blogController;