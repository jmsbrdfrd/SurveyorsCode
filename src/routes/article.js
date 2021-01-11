const express = require('express')
const router = new express.Router()
const adminAuth = require('../middleware/adminAuth')

const Article = require('../db/models/article')


// create article
router.post('/article', adminAuth, async (req, res) => {
    const article = new Article(req.body) // create article

    try {
        await article.save() // attempt to save
        res.status(201).send(article)
    } catch (e) {
        res.status(500).send(e)
    }
})


// read all articles
router.get('/articles', async (req, res) => {
    const page = req.query.page ? req.query.page : 0
    const search = req.query.search ? req.query.search.split(' ') : ''
    const limit = 10

    try {
        if (search !== ''){
            // search and sort by relevance
            // sorted by number of matches to tags field
            articles = await Article.aggregate([
                { $match: { 'tags': {$in: search} } },
                { $unwind: '$tags' },
                { $match: { 'tags': {$in: search} } },
                { $group: { 
                    _id: '$_id',            
                    title: { $first: '$title' },
                    description: { $first: '$description' },
                    date: { $first: '$date'} ,
                    link: { $first: '$link' },
                    hashtags: { $first: '$hashtags' },
                    likes: { $first: '$likes' },
                    commentsQty: { $first: '$commentsQty'},
                    saves: { $first: '$saves'},
                    numTags: { $sum: 1 }
                } },
                { $sort: {numTags: -1 } }
            ]).skip(limit*page).limit(limit)
        } else {
            articles = await Article.find({}).skip(limit*page).limit(limit)
        }

        if (!articles) {
            return res.status(404).send()
        }
        res.send(articles)
    } catch (e) {
        res.status(500).send(e)
    }
})


// read single article
router.get('/article/:link', async (req, res) => {
    const link = req.params.link
    try {
        const article = await Article.findOne({ link })
        await article.populate('comments.comment').execPopulate()
        await article.populate('comments.comment.user', '-email').execPopulate() // exclude email
        await article.populate('comments.comment.replies.reply').execPopulate()
        await article.populate('comments.comment.replies.reply.user').execPopulate()
        if (!article) {
            return res.status(404).send()
        }
        res.send(article)
    } catch (e) {
        res.status(500).send(e)
    }
})


module.exports = router
