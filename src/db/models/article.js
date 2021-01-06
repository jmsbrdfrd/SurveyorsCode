const mongoose = require('mongoose')

const articleSchema = new mongoose.Schema('article', {
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
        trim: true
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
            type: String,
            required: true,
            trim: true
        },
        user: {
            name: {
                type: String,
                required: true,
                trim: true
            },
            image: {
                type: String,
                required: true,
            }
        },
        date: {
            type: Date,
            required: true
        },
        replies: [{
            content: {
                type: String,
                required: true,
                trim: true
            },
            user: {
                name: {
                    type: String,
                    required: true,
                    trim: true
                },
                image: {
                    type: String,
                    default: '/imgs/user.png'
                }
            },
            date: {
                type: Date,
                required: true
            } 
        }] // end of list of replies

    }] // end of list of comments

})



const Article = mongoose.model('Article', articleSchema)
module.exports = Article
