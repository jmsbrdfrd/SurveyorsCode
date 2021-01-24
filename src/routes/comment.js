const express = require('express')
const router = new express.Router()
const auth = require('../middleware/auth')
const Comment = require('../db/models/comment')
const Article = require('../db/models/article')
const Reply = require('../db/models/reply')
const User = require('../db/models/user')


// add comment
router.post('/comment/:articleid', auth, async (req, res) => {
    
    try {
        // find article to add comment to
        const articleId = req.params.articleid
        const article = await Article.findById(articleId)
        const author = await User.findById(article.author)

        // create comment
        const comment = new Comment(req.body)
        comment.user =  req.user._id
        comment.date = new Date()
        comment.article = articleId

        if (!article) {
            return res.status(404).send(e)
        }
        article.comments = article.comments.concat({ comment: comment._id }) // link this comment

        await author.sendNotification(req.user._id, 'commented on your post.', article.link, article._id + comment._id)
        await comment.save()
        await article.save()
        res.send(comment)
    } catch (e) {
        res.status(500).send(e)
    }
})


// delete comment
router.delete('/comment/:commentid', auth, async (req, res) => {
    try {
        // find comment to delete
        const commentId = req.params.commentid
        const comment = await Comment.findById(commentId)
        if (!comment) {
            return res.status(404).send(e)
        }
        
        // ensure user owns comment
        const user = req.user
        if (!user._id.equals(comment.user)) {
            return res.status(401).send()
        }
        await comment.remove()

        // remove replies associated with this comment
        const replyIds = comment.replies.map(reply => reply.reply) // get list of reply ids
        await Reply.deleteMany({_id: { $in: replyIds }})

        // remove comment and calculate new comments qty
        const article = await Article.findById(comment.article)
        article.comments.pop({ commentId: commentId }) // remove comment
        await article.save()

        res.send()
    } catch (e) {
        res.status(500).send()
    }
})


// like a comment
router.post('/comment/like/:commentid', auth, async (req, res) => {
    try {
        const commentId = req.params.commentid
        const comment = await Comment.findById(commentId)
        if (!comment) {
            return res.status(404).send()
        }
        
        // if user has already liked comment - unlike it
        if (comment.likes.filter((like) => like.user.equals(req.user._id)).length > 0) {
            comment.likes = comment.likes.filter((user) => !user.user.equals(req.user._id))
        } else { // if user has not already liked comment
            const article = await Article.findById(comment.article)
            const author = await User.findById(article.author)

            comment.likes = comment.likes.concat({ user: req.user._id })
            await author.sendNotification(req.user._id, 'liked your comment.', article.link, req.user._id + comment._id)
        }

        await comment.save()
        res.send()

    } catch (e) {
        res.status(500).send()
    }
})


module.exports = router