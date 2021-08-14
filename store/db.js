const db = require('./index')
const pgp = require('pg-promise')()
//const client = require('./index')

module.exports = Object.freeze({
    insertArticle(data) {
        const {title, date:postedDate, body, tags} = data
        try {
            const queryText = pgp.as.format(`INSERT INTO articles(title, posted_date, body, tags) VALUES ($1,$2,$3,$4) RETURNING id`, [title, postedDate, body, tags])
            return db.public.one(queryText)
        }
        catch (e) {
            throw e
        }
    },
    getArticle(id) {
        try {
            return db.public.one(`SELECT id, title, posted_date as date, body, tags FROM articles WHERE id = ${id}`)
        }
        catch (e) {
            throw e
        }
    },
    getTags(tagName, date) {
        try {
            const queryText = pgp.as.format(`SELECT id, title, posted_date as date, body, tags FROM articles a WHERE $1=ANY(tags) AND posted_date = $2 ORDER BY id DESC LIMIT 10`, [tagName, date])
            return db.public.many(queryText)
        }
        catch (e) {
            throw e
        }
    }
    
})