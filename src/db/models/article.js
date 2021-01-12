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
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
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
    comments: [{
        comment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Comment',
            required: true
        }
    }],
    saves: {
        type: Number,
        default: 0
    },
    likes: {
        type: Number,
        default: 0
    }
})



const Article = mongoose.model('Article', articleSchema)
module.exports = Article
