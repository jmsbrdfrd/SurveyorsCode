const express = require('express')
const router = new express.Router()
const auth = require('../middleware/auth')
const Comment = require('../db/models/comment')


// add comment
router.post('/comment/:id', auth, async (req, res) => {
    const comment = new Comment(req.body)
    
    const articleId = req.params.id
    comment.article = articleId
    
    const userId = req.user.id
    comment.user = userId

    const date = new Date()
    comment.date = date    

    try {
        await comment.save()
        res.send()
    } catch (e) {
        res.status(500).send(e)
    }
})


module.exports = router