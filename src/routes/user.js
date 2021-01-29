const express = require('express')
const router = new express.Router()
const bcrypt = require('bcrypt')
const auth = require('../middleware/auth')

const User = require('../db/models/user')


// create user
router.post('/user', async (req, res) => {
    try {
        // create new instance of user
        const user = new User(req.body)

        // check user has not supplied any additional information
        const fields = Object.keys(req.body)
        const allowedFields = ['email', 'name', 'username', 'password']
        if (fields.filter((field) => !allowedFields.includes(field)).length > 0) {
            return res.status(500).send()
        }
        
        user.admin = false
        user.joined = new Date()
        await user.save()
        
        const token = await user.generateAuthToken() // create token for this user
        res.status(201).send({user, token}) // send back user and token
    } catch (e) {
        res.status(500).send(e) 
    }
})


// login user
router.post('/user/login', async (req, res) => {
    try {
        // check user exists
        const user = await User.findOne({ email: req.body.email })
        if (!user) {
            return res.status(404).send()
        }

        // check password is a match
        const isMatch = await bcrypt.compare(req.body.password, user.password)
        if (!isMatch) {
            return res.status(404).send()
        }

        // generate token for user, send user info and token back
        const token = await user.generateAuthToken()
        res.send({ user, token })
    } catch (e) {
        res.status(500).send(e)
    }
})


// logout user
router.post('/user/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token // remove token that was used for auth
        })
        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send(e)
    }
})


// logout user from all
router.post('/user/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = [] // completely remove all tokens
        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send()
    }
})


// read user
router.get('/user/', auth, async (req, res) => {
    await req.user.populate('posts.post').execPopulate()
    await req.user.populate('saved.article').execPopulate() 
    await req.user.populate('notifications.notification').execPopulate()
    res.send(req.user.toPrivateJSON()) // get user added to req from auth function
})


// update user
router.patch('/user', auth, async (req, res) => {

    const updates = Object.keys(req.body)
    // only allow user to update certain fields
    const updateIsValid = ! (updates.includes('joined')
        || updates.includes('admin')
        || updates.includes('username')
        || updates.includes('joined') 
        || updates.includes('score')
        || updates.includes('tokens')
        || updates.includes('saved')
        || updates.includes('notifications')
        || updates.includes('posts'))

    if (!updateIsValid) { // check updates are valid
        return res.status(400).send({error: "Updates aren't valid"})
    }

    try {
        updates.forEach((update) => req.user[update] = req.body[update]) // update each field     
        await req.user.save() // attempt to save
        res.send(req.user)
    } catch (e) {
        res.status(500).send(e)
    }
})


// delete a user
router.delete('/user/delete', auth, async (req, res) => {
    try {
        await req.user.remove() // get user from auth function
        res.send(req.user)
    } catch (e) {
        res.status(500).send()
    }
})


module.exports = router