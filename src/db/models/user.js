const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const validator = require('validator')
const Notification = require('./notification')
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}


const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        unique: true,
        maxlength: 320,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Email is not valid')
            }
        }
    },
    username: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        unique: true,
        maxlength: 20,
        minlength: 6,
        validate(username) {
            if (!validator.matches(username, '^[a-zA-Z0-9_\-]*$')) {
                throw new Error('Username is not valid')
            }
        }
    },
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 40
    },
    image: {
        type: String,
        default: '/imgs/user.png' //  fix this later
    },
    bio: {
        type: String,
        trim: true,
        maxlength: 400
    },
    location: {
        type: String,
        trim: true,
        maxlength: 100
    },
    education: {
        type: String,
        trim: true,
        maxlength: 100
    },
    jobtitle: {
        type: String,
        trim: true,
        maxlength: 100
    },
    score: {
        type: Number,
        trim: true,
        default: 0
    },
    company: {
        type: String,
        trim: true,
        maxlength: 100
    },
    url: {
        type: String,
        trim: true,
        maxlength: 200
    },
    facebook: {
        type: String,
        trim: true,
        maxlength: 200
    },
    twitter: {
        type: String,
        trim: true,
        maxlength: 200
    },
    linkedin: {
        type: String,
        trim: true,
        maxlength: 200
    },
    instagram: {
        type: String,
        trim: true,
        maxlength: 200
    },
    joined: {
        type: Date,
        required: true
    },
    posts: [{
        post: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Article',
            required: true
        }
    }],
    saved: [{
        article: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Article',
            required: true
        }
    }],
    liked: [{
        article: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Article',
            required: true
        }
    }],
    likedComments: [{
        comment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'comment',
            required: true
        }
    }],
    likedReplies: [{
        reply: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'reply',
            required: true
        }
    }],
    notifications: [{ // change structure later
        notification: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'notification',
            required: true
        }
    }],
    password: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    admin: {
        type: Boolean
    }
})


userSchema.pre('save', async function (next) {
    // hash password before each save if password has been modified
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 8)
    }
    next()
})


// generate JWT for user
userSchema.methods.generateAuthToken = async function () {
    const token = jwt.sign({ _id: this._id.toString() }, process.env.JWT_KEY)
    this.tokens = this.tokens.concat({ token })
    await this.save()
    return token
}

userSchema.methods.sendNotification = async function (from, message, link, item) {

    // create notification
    const notification = new Notification({
        owner: this._id,
        from: from,
        message: message,
        date: new Date(),
        link: link,
        read: false,
        item: item
    })
    // save notification
    await notification.save()
    
    // add notification to user
    this.notifications = this.notifications.concat({notification: notification._id})
    await this.save()
}

// don't allow password or tokens to be returned
userSchema.methods.toJSON = function () {
    const userObject = this.toObject()

    delete userObject.password
    delete userObject.tokens
    delete userObject.admin

    return userObject
}


const User = mongoose.model('User', userSchema)
module.exports = User