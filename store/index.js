/**Fake database in memory to simulate a real database*/
const { newDb } = require('pg-mem');
const dummy = require('./dummyData.json')
const pgp = require('pg-promise')();

const db = newDb();

db.public.none(`create table articles(id serial primary key, title varchar, posted_date date NOT NULL, body varchar, tags varchar [] NOT NULL)`)

dummy.forEach(async val=> {
    const queryText = await pgp.as.format(`INSERT INTO articles(title, posted_date, body, tags) VALUES ($1,$2,$3,$4)`, [val.title, val.date, val.body, val.tags])
    db.public.none(queryText)
})

module.exports = db
