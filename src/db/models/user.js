const mongoose = require('mongoose')
const bcrypt = require('bcrypt')


const userSchema = new mongoose.Schema({
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
            type: String,
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
    }]
})


// hash password before each save if password has been modified
userSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 8)
    }
    next()
})


const User = mongoose.model('User', userSchema)
module.exports = User