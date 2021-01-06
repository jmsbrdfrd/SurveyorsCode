const jwt = require('jsonwebtoken')
const User = require('../db/models/user')
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '') // get token from header
        const decoded = jwt.verify(token, process.env.JWT_KEY) // decode token
        const user = await User.findOne({ _id: decoded._id, 'tokens.token': token }) // find user by id on token, and check token exists for user

        if (!user) {
            throw new Error()
        }

        req.user = user
        req.token = token
        next()
    } catch (e) {
        res.status(401).send()
    }    
}

module.exports = auth