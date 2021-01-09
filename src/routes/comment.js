const express = require('express')
const router = new express.Router()
const auth = require('../middleware/auth')
const Comment = require('../db/models/comment')
const Article = require('../db/models/article')


// add comment
router.post('/comment/:articleid', auth, async (req, res) => {
    const articleId = req.params.articleid
    const comment = new Comment(req.body)
    comment.user =  req.user.id
    comment.date = new Date()

    try {
        // add 1 to number of comments on article
        const article = await Article.findById(articleId)
        if (!article) {
            return res.status(404).send(e)
        }
        article.commentsQty += 1
        article.comments = article.comments.concat({ commentId: comment._id })

        await comment.save()
        await article.save()
        res.send()
    } catch (e) {
        res.status(500).send(e)
    }
})


module.exports = router