const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}


const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    bio: {
        type: String,
        trim: true
    },
    image: {
        type: String,
        default: '/imgs/user.png'
    },
    joined: {
        type: Date,
        required: true
    },
    saved: [{
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Article',
            required: true
        }
    }],
    notifications: [{
        content: {
            type: String,
            required: true,
            trim: true,
        },
        read: {
            type: Boolean,
            required: true
        }
    }],
    password: {
        type: String,
        required: true,
        trim: true,
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


// hash password before each save if password has been modified
userSchema.pre('save', async function (next) {
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

// don't allow password or tokens to be returned
userSchema.methods.toJSON = function () {
    const userObject = this.toObject()

    delete userObject.password
    delete userObject.tokens

    return userObject
}


const User = mongoose.model('User', userSchema)
module.exports = User