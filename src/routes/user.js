const express = require('express')
const router = new express.Router()
const bcrypt = require('bcrypt')
const auth = require('../middleware/auth')

const User = require('../db/models/user')


// create user
router.post('/user', async (req, res) => {
    const user = new User(req.body) // create new instance of user

    try {
        await user.save()
        const token = await user.generateAuthToken() // create token for this user
        res.status(201).send({user, token})
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
        console.log(req.token)
        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send(e)
    }
})


// logout user from all
router.post('/user/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send()
    }
})


// read user
router.get('/user/', auth, async (req, res) => {
    res.send(req.user)
})


// update user
router.patch('/user', auth, async (req, res) => {

    const updates = Object.keys(req.body)
    const updateIsValid = !updates.includes('joined') // don't allow user to update date joined

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
        await req.user.remove()
        res.send(req.user)
    } catch (e) {
        res.status(500).send()
    }
})


module.exports = router