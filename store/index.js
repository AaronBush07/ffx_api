/**Fake database in memory to simulate a real database*/
const { newDb } = require('pg-mem');

const db = newDb();

db.public.none(`create table articles(id serial primary key, title varchar, posted_date date, body varchar, tags varchar [] )`)

module.exports = db
