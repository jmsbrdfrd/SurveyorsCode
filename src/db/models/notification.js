const mongoose = require('mongoose')


const notificationSchema = new mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        trim: true
    },
    from: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        trim: true
    },
    message: {
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
    read: {
        type: Boolean,
        required: true,
        trim: true
    },
    unique: { // to ensure same notification is never sent twice
        type: String,
        required: true,
        unique: true,
        trim: true
    }
})

const Notification = mongoose.model('Notification', notificationSchema)
module.exports = Notification