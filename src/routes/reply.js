const express = require('express')
const router = new express.Router()
const auth = require('../middleware/auth')
const Reply = require('../db/models/reply')
const Comment = require('../db/models/comment')
const Article = require('../db/models/article')
const User = require('../db/models/user')


// add a reply
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

        await comment.save()
        await reply.save()
        res.send(reply)


        // send notification to original comment owner
        await comment.populate('article').execPopulate()
        const commentAuthor = await User.findById(comment.user)
        await commentAuthor.sendNotification(req.user._id, 'replied to your comment.', comment.article.link, reply._id)

        // get list of other people who have replied
        await comment.populate('replies.reply').execPopulate() // populate people to send notification to

        // get list of their ids
        let users = []
        comment.replies.filter((reply) => {
            const user = String(reply.reply.user)
            if ((!users.includes(user)) && user !== String(comment.user)) {
                users.push(user)
            }
        })

        // send notification to the others that have replied
        users.map(async (id) => {
            const user = await User.findById(id)
            await user.sendNotification(req.user._id, 'also replied to a comment.', comment.article.link, reply._id)
        })

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


// like reply
router.post('/reply/like/:replyid', auth, async (req, res, next) => {
    try {
        const replyId = req.params.replyid
        const reply = await Reply.findById(replyId)
        if (!reply) {
            return res.status(404).send()
        }

        // if user has already liked reply - unlike it
        if (reply.likes.filter((like) => like.user.equals(req.user._id)).length > 0) {
            reply.likes = reply.likes.filter((user) => !user.user.equals(req.user._id))
        } else { // if user has not already liked
            
            // get link for article this reply is on
            const comment = await Comment.findById(reply.comment)
            const article = await Article.findById(comment.article)
            const author = await User.findById(reply.user) // get person who wrote reply

            reply.likes = reply.likes.concat({ user: req.user._id })
            await author.sendNotification(req.user._id, 'liked your comment.', article.link, req.user._id + reply._id)
        }

        await reply.save()
        res.send()
    } catch (e) {
        res.status(500).send(e)
    }
})



module.exports = router