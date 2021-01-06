const path = require('path')
const express = require('express')


// import models
require('./db/mongoose')
const Article = require('./db/models/article')
const User = require('./db/models/user')


// import routes
const articleRoute = require('./routes/article')
const userRoute = require('./routes/user')

const app = express()
const port = process.env.PORT || 5000 


app.use(express.static(path.join(__dirname, '../app/build'))) // set public path
app.use(express.json()) // parse incoming json
app.use(articleRoute)
app.use(userRoute)



// get app
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../app/build/index.html'));
});



app.listen(port, () => {
    console.log('Server is running on port ' + port + '.')
})