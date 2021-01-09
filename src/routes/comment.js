const express = require('express')
const router = new express.Router()
const auth = require('../middleware/auth')
const Comment = require('../db/models/comment')
const Article = require('../db/models/article')


// add comment
router.post('/comment/:id', auth, async (req, res) => {
    const comment = new Comment(req.body)
    // add article id
    const articleId = req.params.id
    comment.article = articleId
    // add user id
    const userId = req.user.id
    comment.user = userId
    // add date
    const date = new Date()
    comment.date = date    

    // add 1 to number of comments on article
    const article = await Article.findById(req.params.id)
    article.comments += 1

    try {
        await comment.save()
        await article.save()
        res.send()
    } catch (e) {
        res.status(500).send(e)
    }
})


module.exports = router