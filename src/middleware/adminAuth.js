const User = require('../db/models/user')
const jwt = require('jsonwebtoken')
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}


const adminAuth = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '')
        const decoded = jwt.verify(token, process.env.JWT_KEY)
        const user = await User.findOne({ _id: decoded._id, 'tokens.token': token })

        if (!user) {
            throw new Error()
        }

        if (user.admin === false) {
            throw new Error
        }

        req.user = user
        next()
        
    } catch (e) {
        res.status(401).send()
    }
}

module.exports = adminAuth