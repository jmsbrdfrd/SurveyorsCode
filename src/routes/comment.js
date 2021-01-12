const express = require('express')
const router = new express.Router()
const auth = require('../middleware/auth')
const Comment = require('../db/models/comment')
const Article = require('../db/models/article')
const Reply = require('../db/models/reply')


// add comment
router.post('/comment/:articleid', auth, async (req, res) => {
    
    try {
        // find article to add comment to
        const articleId = req.params.articleid
        const article = await Article.findById(articleId)

        // create comment
        const comment = new Comment(req.body)
        comment.user =  req.user.id
        comment.date = new Date()
        comment.article = articleId

        if (!article) {
            return res.status(404).send(e)
        }
        article.comments = article.comments.concat({ comment: comment._id }) // link this comment

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


module.exports = router