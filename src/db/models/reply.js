const mongoose = require('mongoose')

const replySchema = new mongoose.Schema({
    article: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Article',
        required: true
    },
    comment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment',
        required: true
    },
    message: {
        type: String,
        required: true,
        trim: true,
        maxlength: 1000
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    date: {
        type: Date,
        required: true,
    },
    likes: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        }
    }]
})


const Reply = mongoose.model('Reply', replySchema)
module.exports = Reply