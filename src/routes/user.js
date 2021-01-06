const express = require('express')
const router = new express.Router()

const User = require('../db/models/user')


// create user
router.post('/user', async (req, res) => {
    const user = new User(req.body)

    try {
        await user.save()
        res.send(req.body)
    } catch (e) {
        res.status(500).send(e) 
    }
})


// update user
router.patch('/user/:id', async (req, res) => {

    const updates = Object.keys(req.body)
    const updateIsValid = !updates.includes('joined') // don't allow user to update date joined

    if (!updateIsValid) {
        return res.status(400).send({error: "Updates aren't valid"})
    }

    try {
        const user = await User.findById( req.params.id ) // assign found user to user variable

        if (!user) { // if user cannot be found
            return res.status(404).send()
        }

        updates.forEach((update) => user[update] = req.body[update]) // update each field     
        await user.save() // attempt to save
        res.send(user)

    } catch (e) {
        res.status(500).send(e)
    }
})


// read user
router.get('/user/:id', async (req, res) => {
    const id = req.params.id
    try {
        const user = await User.findById(id)
        if (!user) {
            return res.status(404).send()
        }
        res.send(user)
    } catch (e) {   
        res.status(500).send(e)
    }
})


module.exports = router