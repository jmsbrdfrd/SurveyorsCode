const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    message: {
        type: String,
        required: true,
        trim: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    replies: [{
        message: {
            type: String,
            required: true,
            trim: true
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        date: {
            type: Date,
            required: true
        } 
    }] // end of list of replies
})

const Comment = mongoose.model('Comment', commentSchema)
module.exports = Comment