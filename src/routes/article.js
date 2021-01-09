const express = require('express')
const router = new express.Router()

const Article = require('../db/models/article')


// create article
router.post('/article', async (req, res) => {
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
        const article = await Article.findOne({ link: link })
        await Article.populate('Comments').execPopulate()
        if (!article) {
            return res.status(404).send()
        }
        res.send(article)
    } catch (e) {
        res.status(500).send(e)
    }
})


module.exports = router
