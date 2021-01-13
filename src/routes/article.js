const express = require('express')
const router = new express.Router()
const adminAuth = require('../middleware/adminAuth')
const auth = require('../middleware/auth')

const Article = require('../db/models/article')
const User = require('../db/models/user')

// create article
router.post('/article', adminAuth, async (req, res) => { // only allow admin to create article

    const article = new Article(req.body) // create article
    article.date = new Date() // set date created as now
    article.author = req.user._id // assign author to article
    req.user.posts = req.user.posts.concat({ post: article._id })

    try {
        await article.save()
        await req.user.save()
        res.status(201).send(article)
    } catch (e) {
        res.status(500).send(e)
    }
})


// read all articles
router.get('/articles', async (req, res) => {
    const page = req.query.page ? req.query.page : 0 // return first 10 if page isn't populated
    const search = req.query.search ? req.query.search.split(' ') : '' // split search into list if provided
    const limit = 10

    try {
        // if search is provided
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
                    date: { $first: '$date' } ,
                    link: { $first: '$link' },
                    hashtags: { $first: '$hashtags' },
                    likes: { $first: '$likes' },
                    comments: { $first: '$comments'},
                    saves: { $first: '$saves' },
                    author: { $first: '$author' },
                    numTags: { $sum: 1 }
                } },
                { $sort: {numTags: -1 } },
                { $skip: limit*page },
                { $limit: limit }
            ])
            await User.populate(articles, {path: "author"})
        } else {
            // if search is not provided, find all sorted by date
            articles = await Article.find({}).sort({ date: 1 }).skip(limit*page).limit(limit) // else find all, limit to 10
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
        // author, comments, and replies need to be populated when reading single link
        await article.populate('author').execPopulate()
        await article.populate('comments.comment').execPopulate()
        await article.populate('comments.comment.user', '-email').execPopulate()
        await article.populate('comments.comment.replies.reply').execPopulate()
        await article.populate('comments.comment.replies.reply.user', '-email').execPopulate()
        if (!article) {
            return res.status(404).send()
        }
        res.send(article)
    } catch (e) {
        res.status(500).send(e)
    }
})


// like article
router.post('/article/like/:articleid', auth, async (req, res) => {
    const id = req.params.articleid

    try {
        const article = await Article.findById(id)

        article.likes = article.likes.concat({ user: req.user._id })
        req.user.liked = req.user.liked.concat({ article: article._id })

        await article.save()
        await req.user.save()   
        res.send()
    } catch (e) {
        res.status(500).send()
    }
})



// save article
router.post('/article/save/:articleid', auth, async (req, res) => {
    const id = req.params.articleid

    try {
        const article = await Article.findById(id)

        article.saves = article.saves.concat({ user: req.user._id })
        req.user.saved = req.user.saved.concat({ article: article._id })

        await article.save()
        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

module.exports = router
