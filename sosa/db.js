const mysql = require('mysql')
const dbConfig = require('./db.config')

const query = (sql, params) =>
  new Promise((resolve, reject) => {
    if (process.env.NODE_ENV !== 'test') {
      console.log(`Execute query[${sql}] with params[${params}]`)
    }
    const db = mysql.createConnection(dbConfig)
    db.connect()
    db.query(sql, params, (err, result, fields) => {
      db.end()
      if (err) {
        console.log(`error occurred in database query=${sql}, error=${err}`)
        reject(err)
      } else {
        resolve(result)
        if (process.env.NODE_ENV !== 'test') {
          console.log(`DB result is ${JSON.stringify(result)}`)
        }
      }
    })
  })

const queryOne = (sql, params, defaultValue) => {
  return query(sql, params).then(res => {
    if (res === undefined || res[0] === undefined) {
      return defaultValue || {}
    }
    return res[0]
  })
}

module.exports = {
  query,
  queryOne
}
