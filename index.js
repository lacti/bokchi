const express = require('express')
const port = process.env.PORT || 3000
const app = express()

app.use(express.static(__dirname))
app.listen(port)
console.log('Waiting on 3000 port.')
