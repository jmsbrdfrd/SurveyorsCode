const express = require('express')
const router = new express.Router()
const auth = require('../middleware/auth')
const Reply = require('../db/models/reply')
const Comment = require('../db/models/comment')
const Article = require('../db/models/article')

// delete a comment
router.post('/reply/:commentid', auth, async (req, res) => {    
    try {
        // create reply
        const reply = new Reply(req.body)

        // find comment to reply to
        const commentId = req.params.commentid
        const comment = await Comment.findById(commentId)
        comment.replies = comment.replies.concat({ reply: reply._id }) // add reply to comment
        
        // add fields to new reply
        reply.article = comment.article // link article reply is on
        reply.comment = commentId
        reply.user = req.user.id // get user from auth function
        reply.date = new Date()

        // find article and increase commentsQty by 1
        const article = await Article.findById(comment.article)
        article.commentsQty += 1

        await article.save()
        await comment.save()
        await reply.save()
        res.send(reply)
    } catch (e) {
        res.status(500).send()
    }
})


// delete a reply
router.delete('/reply/:replyid', auth, async (req, res) => {
    try {
        // find reply to delete
        const replyId = req.params.replyid
        const reply = await Reply.findById(replyId)
        
        // ensure user owns reply
        if (!req.user._id.equals(reply.user)) {
            return res.status(401).send()
        }

        // remove 1 comment from article reply is on
        const article = await Article.findById(reply.article)
        article.commentsQty -= 1

        await article.save()
        await reply.remove()
        res.send()
    } catch (e) {
        res.status(500).send()
    }
})



module.exports = router