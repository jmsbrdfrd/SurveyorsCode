const path = require('path')
const express = require('express')
require('./db/mongoose')

const app = express()
const port = process.env.PORT || 5000 

app.use(express.static(path.join(__dirname, '../app/build'))) // set public path
app.use(express.json()) // parse incoming json

// import routes
const articleRoute = require('./routes/article')
const userRoute = require('./routes/user')
const commentRoute = require('./routes/comment')
const replyRoute = require('./routes/reply')

app.use(articleRoute)
app.use(userRoute)
app.use(commentRoute)
app.use(replyRoute)


// get app
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../app/build/index.html'));
});


app.listen(port, () => {
    console.log('Server is running on port ' + port + '.')
})