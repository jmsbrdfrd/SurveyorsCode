const mongoose = require('mongoose')

const articleSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    date: {
        type: Date,
        required: true,
        trim: true
    },
    link: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        unique: true,
    },
    tags: {
        type: Array,
        required: true,
    },
    hashtags: {
        type: Array
    },
    likes: {
        type: Number,
        default: 0
    },
    comments: [{
        comment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Comment',
            required: true
        }
    }],
    commentsQty: {
        type: Number,
        default: 0
    },
    saves: {
        type: Number,
        default: 0
    }

})



const Article = mongoose.model('Article', articleSchema)
module.exports = Article
