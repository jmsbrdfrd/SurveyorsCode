const express = require('express')
const router = new express.Router()
const auth = require('../middleware/auth')
const Reply = require('../db/models/reply')
const Comment = require('../db/models/comment')


router.post('/reply/:commentid', auth, async (req, res) => {    
    try {
        const reply = new Reply(req.body)

        const commentId = req.params.commentid
        const comment = await Comment.findById(commentId)
        comment.replies = comment.replies.concat({ reply: reply._id })
        

        reply.comment = commentId
        reply.user = req.user.id
        reply.date = new Date()

        await comment.save()
        await reply.save()
        res.send(reply)
    } catch (e) {
        res.status(500).send()
    }


})



module.exports = router