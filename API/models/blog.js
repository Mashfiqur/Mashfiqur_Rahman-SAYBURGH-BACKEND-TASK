const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    title:{
        type: String,
        required: true,
        trim: true
    },
    description:{
        type: String,
        required: true,
        trim: true
    },
    owner_id:{type:mongoose.Schema.Types.ObjectId, ref: 'User' },
    tags:[{type:mongoose.Schema.Types.ObjectId, ref: 'User' }],
    comments:[{type:mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
}, { timestamps: true });

module.exports = mongoose.model("Blog", blogSchema);