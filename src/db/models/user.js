const mongoose = require('mongoose')


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
        minlength: 6,
        validate(value) {
            if (value.includes("password")) {
                throw new Error('Password not right');
            }
        }
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }]
})


const User = mongoose.model('User', userSchema)
module.exports = User