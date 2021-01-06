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
router.get('/article', async (req, res) => {
    try {
        const articles = await Article.find({})
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
        if (!article) {
            return res.status(404).send()
        }
        res.send(article)
    } catch (e) {
        res.status(500).send(e)
    }
})


module.exports = router
