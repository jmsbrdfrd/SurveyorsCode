const path = require('path')
const express = require('express')

const Article = require('./db/models/article')
require('./db/mongoose')


const app = express()
const port = process.env.PORT || 5000 


app.use(express.static(path.join(__dirname, '../app/build'))) // set public path
app.use(express.json()) // parse incoming json



// get app
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../app/build/index.html'));
});



app.listen(port, () => {
    console.log('Server is running on port ' + port + '.')
})