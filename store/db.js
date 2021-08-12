const db = require('./index')
const pgp = require('pg-promise')()
//const client = require('./index')

module.exports = Object.freeze({
    async insertArticle(data) {
        const {title, date:postedDate, body, tags} = data
        //console.log('ddd', data)
        try {
            const queryText = await pgp.as.format(`INSERT INTO articles(title, posted_date, body, tags) VALUES ($1,$2,$3,$4)`, [title, postedDate, body, tags])
            console.log(queryText)
            db.public.none(queryText)
            // console.log(db.public.many('SELECT * FROM articles'))
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
    }
    
})