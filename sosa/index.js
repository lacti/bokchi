const express = require('express')
const bodyParser = require('body-parser')
const db = require('./db')

const app = express()
app.use(bodyParser.json())
app.use(express.static(__dirname))

app.post('/rank', (req, res) => {
  const d = req.body
  console.log(d)
  db
    .query(
      'INSERT INTO sosa_rank (comment, week, category, earn, lose, `loop`, flow) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [d.comment, d.week, d.category, d.earn, d.lose, d.loop, d.flow]
    )
    .then(_ => db.query(`SELECT * FROM sosa_rank ORDER BY week DESC LIMIT 15`))
    .then(r => res.send(JSON.stringify([...r])))
    .catch(console.log)
})
app.get('/rank', (req, res) => {
  db
    .query(`SELECT * FROM sosa_rank ORDER BY week DESC LIMIT 15`)
    .then(r => res.send(JSON.stringify([...r])))
    .catch(console.log)
})

const port = process.env.PORT || 3000
app.listen(port)
console.log('Waiting on 3000 port.')
