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
        const author = await User.findById(article.author)

        // if user has already liked the post
        if (req.user.liked.filter((like) => like.article.equals(id)).length > 0) {
            article.likes = article.likes.filter((user) => !user.user.equals(req.user._id))
            req.user.liked = req.user.saved.filter((like) => !like.article.equals(article._id))
        } else { // if user hasn't already liked
            article.likes = article.likes.concat({ user: req.user._id })
            req.user.liked = req.user.liked.concat({ article: article._id })
            await author.sendNotification(req.user._id, 'liked your post.', article.link, req.user._id + article._id)
        }
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

        // if user has already saved this post, unsave it
        if (req.user.saved.filter((save) => save.article.equals(id)).length > 0) {
            article.saves = article.saves.filter((user) => !user.user.equals(req.user._id))
            req.user.saved = req.user.saved.filter((save) => !save.article.equals(article._id))
        } else { // else save the post
            article.saves = article.saves.concat({ user: req.user._id })
            req.user.saved = req.user.saved.concat({ article: article._id })
        }        

        await article.save()
        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

module.exports = router
